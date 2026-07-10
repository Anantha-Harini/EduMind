import os, shutil
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from .. import crud, schemas, auth, database, models
from ..services import ai

router = APIRouter(prefix="/api/documents", tags=["Documents"])

ALLOWED_EXTENSIONS = {".pdf", ".docx", ".txt", ".ppt", ".pptx"}

def _ext(filename): return os.path.splitext(filename)[1].lower()


@router.post("/upload", response_model=schemas.DocumentResponse)
def upload_document(
    title: str = Form(...),
    description: str = Form(None),
    category_id: Optional[int] = Form(None),
    tags: str = Form(None),
    file: UploadFile = File(...),
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    ext = _ext(file.filename)
    os.makedirs("uploads", exist_ok=True)
    file_location = f"uploads/{file.filename}"
    with open(file_location, "wb+") as f:
        shutil.copyfileobj(file.file, f)

    # Duplicate check
    dup = ai.check_duplicate(file_location)
    if dup:
        try: os.remove(file_location)
        except: pass
        raise HTTPException(status_code=409, detail=f"Duplicate detected: '{dup['title']}' ({dup['similarity']}% similar). Upload rejected.")

    # Summarize
    text = ai.extract_text_from_file(file_location)
    summary = ai.summarize_text(text) if text else None

    # Auto-categorize if no category_id was provided
    if not category_id and text:
        existing_cats = crud.get_categories(db)
        existing_names = [c.name for c in existing_cats]
        suggested_name = ai.suggest_category(title + " " + text[:5000], existing_names)
        
        # Get or create the suggested category
        cat = crud.get_or_create_category(db, suggested_name)
        category_id = cat.id

    # Enforce Student Category Restrictions
    curr_role = str(current_user.role).lower()
    if curr_role in ["student", "userrole.student"]:
        allowed_student_cats = {
            "Academic Resources", "Student Services", "Knowledge Articles / FAQs", 
            "Events & Announcements", "Multimedia Learning", "External Resources", 
            "Research & Publications"
        }
        
        # We need the full category object to check its name if ID was directly provided
        cat_obj = crud.get_categories(db)
        target_cat = next((c for c in cat_obj if c.id == category_id), None)
        
        if target_cat and target_cat.name not in allowed_student_cats:
            # If AI suggested it or student forced it, block it
            try: os.remove(file_location)
            except: pass
            raise HTTPException(
                status_code=403, 
                detail=f"Students are not permitted to upload documents to the '{target_cat.name}' category."
            )

    # Auto-tag and Auto-describe if missing
    if not tags and text:
        tags = ai.extract_tags(text)
    if not description and summary:
        description = summary[:150] + "..." if len(summary) > 150 else summary

    # Auto-approve only if admin; Faculty and Student uploads go to pending
    status = models.DocStatus.APPROVED if current_user.role == models.UserRole.ADMIN else models.DocStatus.PENDING

    doc_create = schemas.DocumentCreate(title=title, description=description, category_id=category_id, tags=tags)
    document = crud.create_document(db, doc_create, file_location, current_user.id, file_type=ext.lstrip("."), summary=summary, status=status)

    # Index and Notify based on Approval status
    if status == models.DocStatus.APPROVED:
        cat_name = "General"
        if category_id:
            cats = crud.get_categories(db)
            cat = next((c for c in cats if c.id == category_id), None)
            if cat: cat_name = cat.name
        ai.process_and_index_document(document.id, document.title, file_location, cat_name)
        
        # Notify all users about new available document
        all_users = db.query(models.User).filter(models.User.id != current_user.id).all()
        for u in all_users[:50]:  
            crud.create_notification(db, u.id, f"New document available: '{title}'", "/dashboard")
    else:
        # Notify admins that a document needs approval
        admins = db.query(models.User).filter(models.User.role == models.UserRole.ADMIN).all()
        for admin in admins:
            crud.create_notification(db, admin.id, f"New document waiting for approval: '{title}'", "/approval")

    return document


@router.get("/", response_model=List[schemas.DocumentResponse])
def get_documents(
    status: Optional[str] = None,
    category_id: Optional[int] = None,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    # Only return approved documents to the dashboard/search endpoints for all users
    # To view pending documents, admins use the separate /pending endpoint.
    if not status:
        status = models.DocStatus.APPROVED
    
    doc_status = models.DocStatus(status)
    return crud.get_documents(db, status=doc_status, category_id=category_id)


@router.get("/pending", response_model=List[schemas.DocumentResponse])
def get_pending(db: Session = Depends(database.get_db),
                _ = Depends(auth.require_role([models.UserRole.ADMIN]))):
    return crud.get_documents(db, status=models.DocStatus.PENDING)


@router.get("/trending")
def trending(db: Session = Depends(database.get_db),
             current_user: models.User = Depends(auth.get_current_user)):
    docs = crud.get_trending(db, limit=5)
    return [{"id": d.id, "title": d.title, "view_count": d.view_count, "summary": d.summary} for d in docs]


@router.get("/search")
def search(query: str = Query(...), top_k: int = 5, category: Optional[str] = None,
           db: Session = Depends(database.get_db),
           current_user: models.User = Depends(auth.get_current_user)):
    results = ai.semantic_search(query, top_k, category)
    crud.log_search(db, query, len(results), current_user.id)
    return {"query": query, "results": results}


@router.post("/{doc_id}/approve")
def approve(doc_id: int, approved: bool = True, db: Session = Depends(database.get_db),
            current_user: models.User = Depends(auth.require_role([models.UserRole.ADMIN]))):
    doc = crud.approve_document(db, doc_id, current_user.id, approved)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    # Index if approved
    if approved:
        ai.process_and_index_document(doc.id, doc.title, doc.file_path, "General")
        # Notify owner
        crud.create_notification(db, doc.owner_id, f"Your document '{doc.title}' was approved!", "/dashboard")
    else:
        crud.create_notification(db, doc.owner_id, f"Your document '{doc.title}' was rejected.", "/dashboard")

    return {"status": "approved" if approved else "rejected", "doc_id": doc_id}

@router.delete("/{doc_id}")
def delete_doc(doc_id: int, db: Session = Depends(database.get_db),
               current_user: models.User = Depends(auth.get_current_user)):
    doc = crud.get_document(db, doc_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
        
    if doc.owner_id != current_user.id and current_user.role != models.UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Not authorized to delete this document")
        
    ai.remove_document_from_index(doc_id)
    success = crud.delete_document(db, doc_id)
    
    if not success:
        raise HTTPException(status_code=500, detail="Failed to delete document completely")
        
    return {"status": "success", "message": "Document deleted"}


@router.get("/{doc_id}/view")
def view_doc(doc_id: int, db: Session = Depends(database.get_db),
             current_user: models.User = Depends(auth.get_current_user)):
    doc = crud.record_view(db, doc_id, current_user.id)
    if not doc:
        raise HTTPException(status_code=404, detail="Not found")
        
    is_bookmarked = db.query(models.Bookmark).filter(
        models.Bookmark.user_id == current_user.id,
        models.Bookmark.document_id == doc_id
    ).first() is not None
    
    has_upvoted = db.query(models.Upvote).filter(
        models.Upvote.user_id == current_user.id,
        models.Upvote.document_id == doc_id
    ).first() is not None
    
    # Convert doc to dict and add user-specific states
    doc_dict = {
        "id": doc.id,
        "title": doc.title,
        "description": doc.description,
        "file_type": doc.file_type,
        "view_count": doc.view_count,
        "upvote_count": doc.upvote_count or 0,
        "summary": doc.summary,
        "tags": doc.tags,
        "owner_id": doc.owner_id,
        "category_id": doc.category_id,
        "is_bookmarked": is_bookmarked,
        "has_upvoted": has_upvoted
    }
    return doc_dict

@router.get("/{doc_id}/content")
def get_doc_content(doc_id: int, db: Session = Depends(database.get_db),
                    current_user: models.User = Depends(auth.get_current_user)):
    doc = crud.get_document(db, doc_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Not found")
    # For security, could verify if it's approved or user is owner
    if doc.status != models.DocStatus.APPROVED and doc.owner_id != current_user.id and current_user.role != models.UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Not allowed")
    
    text = ai.extract_text_from_file(doc.file_path)
    return {"text": text}

@router.get("/{doc_id}/similar")
def similar_docs(doc_id: int, db: Session = Depends(database.get_db),
                 current_user: models.User = Depends(auth.get_current_user)):
    doc = crud.get_document(db, doc_id)
    if not doc or not doc.category_id:
        return []
    similar = crud.get_category_docs(db, doc.category_id, doc_id)
    return [{"id": d.id, "title": d.title, "summary": d.summary} for d in similar]

@router.post("/{doc_id}/upvote")
def upvote_document(doc_id: int, db: Session = Depends(database.get_db),
                    current_user: models.User = Depends(auth.get_current_user)):
    doc = crud.get_document(db, doc_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
        
    # Check if user already upvoted
    existing_upvote = db.query(models.Upvote).filter(
        models.Upvote.user_id == current_user.id,
        models.Upvote.document_id == doc_id
    ).first()
    
    if existing_upvote:
        # Toggle upvote off
        db.delete(existing_upvote)
        doc.upvote_count = max(0, (doc.upvote_count or 0) - 1)
        action = "removed"
    else:
        # Toggle upvote on
        new_upvote = models.Upvote(user_id=current_user.id, document_id=doc_id)
        db.add(new_upvote)
        doc.upvote_count = (doc.upvote_count or 0) + 1
        action = "added"
        
        # Notify the author
        if doc.owner_id and doc.owner_id != current_user.id:
            crud.create_notification(db, doc.owner_id, f"Someone upvoted your document '{doc.title}'!", f"/document/{doc_id}")
            
    db.commit()
    return {"status": "success", "action": action, "upvote_count": doc.upvote_count}

from ..schemas_extra import CommentCreate, CommentResponse

@router.post("/{doc_id}/comments", response_model=CommentResponse)
def post_comment(doc_id: int, comment: CommentCreate, db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    doc = crud.get_document(db, doc_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    
    new_comment = crud.create_comment(db, doc_id, current_user.id, comment.content)
    
    if doc.owner_id and doc.owner_id != current_user.id:
        crud.create_notification(db, doc.owner_id, f"{current_user.full_name or current_user.email} commented on '{doc.title}'.", f"/document/{doc_id}")
        
    return new_comment

@router.get("/{doc_id}/comments")
def get_comments(doc_id: int, db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    comments = crud.get_comments(db, doc_id)
    result = []
    for c in comments:
        result.append({
            "id": c.id,
            "document_id": c.document_id,
            "user_id": c.user_id,
            "user_name": c.user.full_name or c.user.email.split("@")[0],
            "user_role": c.user.role,
            "content": c.content,
            "created_at": c.created_at
        })
    return result
