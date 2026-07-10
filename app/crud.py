import os
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from typing import Optional, List
from . import models, schemas, auth


# ── Users ──────────────────────────────────────────────────────────────
def get_user(db, user_id): return db.query(models.User).filter(models.User.id == user_id).first()
def get_user_by_email(db, email): return db.query(models.User).filter(models.User.email == email).first()

def create_user(db, user: schemas.UserCreate):
    db_user = models.User(email=user.email, hashed_password=auth.get_password_hash(user.password), role=user.role)
    db.add(db_user); db.commit(); db.refresh(db_user)
    return db_user

def update_user_profile(db, user_id: int, data: schemas.UserUpdate):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user: return None
    if data.full_name is not None: user.full_name = data.full_name
    if data.department is not None: user.department = data.department
    if data.bio is not None: user.bio = data.bio
    db.commit(); db.refresh(user)
    return user


# ── Categories ─────────────────────────────────────────────────────────
def get_categories(db) -> List[models.Category]:
    return db.query(models.Category).all()

def get_or_create_category(db, name: str) -> models.Category:
    cat = db.query(models.Category).filter(models.Category.name == name).first()
    if not cat:
        cat = models.Category(name=name)
        db.add(cat); db.commit(); db.refresh(cat)
    return cat

def create_category(db, cat: schemas.CategoryCreate):
    db_cat = models.Category(name=cat.name, description=cat.description)
    db.add(db_cat); db.commit(); db.refresh(db_cat)
    return db_cat


# ── Documents ──────────────────────────────────────────────────────────
def get_documents(db, skip=0, limit=100, status=None, category_id=None):
    q = db.query(models.Document)
    if status: q = q.filter(models.Document.status == status)
    if category_id: q = q.filter(models.Document.category_id == category_id)
    return q.order_by(desc(models.Document.upload_date)).offset(skip).limit(limit).all()

def get_document(db, doc_id: int):
    return db.query(models.Document).filter(models.Document.id == doc_id).first()

def create_document(db, document: schemas.DocumentCreate, file_path: str, owner_id: int,
                    file_type: str = None, summary: str = None, status=models.DocStatus.PENDING):
    db_doc = models.Document(
        title=document.title, description=document.description,
        category_id=document.category_id, tags=document.tags,
        file_path=file_path, file_type=file_type, summary=summary,
        owner_id=owner_id, status=status
    )
    db.add(db_doc); db.commit(); db.refresh(db_doc)
    return db_doc

def approve_document(db, doc_id: int, admin_id: int, approved: bool):
    doc = db.query(models.Document).filter(models.Document.id == doc_id).first()
    if not doc: return None
    doc.status = models.DocStatus.APPROVED if approved else models.DocStatus.REJECTED
    doc.approved_by = admin_id
    db.commit(); db.refresh(doc)
    return doc

def delete_document(db: Session, doc_id: int) -> bool:
    doc = db.query(models.Document).filter(models.Document.id == doc_id).first()
    if not doc: return False
    
    # Clean up dependent records explicitly
    db.query(models.UserInteraction).filter(models.UserInteraction.document_id == doc_id).delete()
    db.query(models.GeneratedQuestion).filter(models.GeneratedQuestion.document_id == doc_id).delete()
    
    # Try deleting actual file payload from disk
    if doc.file_path and os.path.exists(doc.file_path):
        try: os.remove(doc.file_path)
        except Exception as e: print(f"File delete err: {e}")
            
    db.delete(doc)
    db.commit()
    return True

def record_view(db, doc_id: int, user_id: int):
    doc = db.query(models.Document).filter(models.Document.id == doc_id).first()
    if doc:
        doc.view_count = (doc.view_count or 0) + 1
        db.add(models.UserInteraction(user_id=user_id, document_id=doc_id, interaction_type="view"))
        db.commit()
    return doc

def get_trending(db, limit=5):
    return db.query(models.Document)\
        .filter(models.Document.status == models.DocStatus.APPROVED)\
        .order_by(desc(models.Document.view_count)).limit(limit).all()

def get_category_docs(db, category_id: int, exclude_id: int, limit=4):
    return db.query(models.Document)\
        .filter(models.Document.category_id == category_id,
                models.Document.id != exclude_id,
                models.Document.status == models.DocStatus.APPROVED)\
        .limit(limit).all()

def save_summary(db, doc_id: int, summary: str):
    doc = db.query(models.Document).filter(models.Document.id == doc_id).first()
    if doc:
        doc.summary = summary
        db.commit()


# ── Search Logs ────────────────────────────────────────────────────────
def log_search(db, query: str, results_count: int, user_id: Optional[int] = None):
    normalized = query.strip().lower() if query else ""
    db.add(models.SearchLog(query=normalized, results_count=results_count, user_id=user_id))
    db.commit()

def get_search_trends(db, limit=10):
    return db.query(models.SearchLog.query, func.count(models.SearchLog.id).label("count"))\
        .group_by(models.SearchLog.query).order_by(desc("count")).limit(limit).all()

def get_knowledge_gaps(db, limit=10):
    """Queries searched but returned 0 results."""
    return db.query(models.SearchLog.query, func.count(models.SearchLog.id).label("count"))\
        .filter(models.SearchLog.results_count == 0)\
        .group_by(models.SearchLog.query).order_by(desc("count")).limit(limit).all()


# ── Notifications ──────────────────────────────────────────────────────
def create_notification(db, user_id: int, message: str, link: str = None):
    notif = models.Notification(user_id=user_id, message=message, link=link)
    db.add(notif); db.commit()

def get_notifications(db, user_id: int):
    return db.query(models.Notification)\
        .filter(models.Notification.user_id == user_id,
                models.Notification.is_read == False)\
        .order_by(desc(models.Notification.created_at)).limit(20).all()

def mark_notifications_read(db, user_id: int):
    db.query(models.Notification).filter(models.Notification.user_id == user_id)\
        .update({"is_read": True})
    db.commit()


# ── Analytics ──────────────────────────────────────────────────────────
def get_analytics_overview(db):
    approved_docs = db.query(models.Document).filter(models.Document.status == models.DocStatus.APPROVED).count()
    pending_docs = db.query(models.Document).filter(models.Document.status == models.DocStatus.PENDING).count()
    total_docs = approved_docs + pending_docs
    
    total_users = db.query(models.User).count()
    total_searches = db.query(models.SearchLog).count()
    
    return {
        "total_docs": total_docs, "total_users": total_users,
        "total_searches": total_searches, "approved_docs": approved_docs,
        "pending_docs": pending_docs
    }

def get_top_docs(db, limit=8):
    docs = db.query(models.Document).filter(models.Document.status == models.DocStatus.APPROVED)\
        .order_by(desc(models.Document.view_count)).limit(limit).all()
    return [{"title": d.title, "views": d.view_count or 0} for d in docs]


# ── Questions ──────────────────────────────────────────────────────────
def save_questions(db, doc_id: int, questions: list):
    # Clear old questions for this doc
    db.query(models.GeneratedQuestion).filter(models.GeneratedQuestion.document_id == doc_id).delete()
    for q in questions:
        db.add(models.GeneratedQuestion(
            document_id=doc_id, question_text=q["question"],
            question_type=q.get("type", "mcq"),
            options=q.get("options"), answer=q.get("answer")
        ))
    db.commit()

def get_questions(db, doc_id: int):
    return db.query(models.GeneratedQuestion).filter(models.GeneratedQuestion.document_id == doc_id).all()

# ── Flashcards ────────────────────────────────────────────────────────
def save_flashcards(db, doc_id: int, flashcards: list):
    db.query(models.Flashcard).filter(models.Flashcard.document_id == doc_id).delete()
    for f in flashcards:
        db.add(models.Flashcard(
            document_id=doc_id, 
            question=f.get("term", ""),
            answer=f.get("definition", "")
        ))
    db.commit()

def get_flashcards(db, doc_id: int):
    return db.query(models.Flashcard).filter(models.Flashcard.document_id == doc_id).all()

# ── Comments ─────────────────────────────────────────────────────────
def create_comment(db: Session, doc_id: int, user_id: int, content: str):
    db_comment = models.DocumentComment(document_id=doc_id, user_id=user_id, content=content)
    db.add(db_comment)
    db.commit()
    db.refresh(db_comment)
    return db_comment

def get_comments(db: Session, doc_id: int):
    return db.query(models.DocumentComment).filter(models.DocumentComment.document_id == doc_id).order_by(models.DocumentComment.created_at.desc()).all()
