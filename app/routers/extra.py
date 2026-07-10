from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from .. import database, models, auth
from ..schemas_extra import BookmarkCreate, BookmarkResponse, AnnouncementCreate, AnnouncementResponse, RoleUpdate
from ..schemas import UserResponse

router = APIRouter(tags=["Extra Features"])

# --- Users (Admin) ---
@router.get("/api/users", response_model=List[UserResponse])
def get_all_users(db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    if current_user.role != models.UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Not authorized")
    return db.query(models.User).all()

@router.put("/api/users/{user_id}/role")
def update_user_role(user_id: int, role_update: RoleUpdate, db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    if current_user.role != models.UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Not authorized")
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.role = role_update.role
    db.commit()
    return {"status": "success", "new_role": user.role}

# --- Announcements ---
@router.get("/api/announcements", response_model=List[AnnouncementResponse])
def get_announcements(db: Session = Depends(database.get_db)):
    return db.query(models.Announcement).order_by(models.Announcement.created_at.desc()).all()

@router.post("/api/announcements", response_model=AnnouncementResponse)
def create_announcement(announcement: AnnouncementCreate, db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    if current_user.role != models.UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Not authorized")
    db_ann = models.Announcement(title=announcement.title, content=announcement.content, author_id=current_user.id)
    db.add(db_ann)
    db.commit()
    db.refresh(db_ann)
    return db_ann

@router.delete("/api/announcements/{ann_id}")
def delete_announcement(ann_id: int, db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    if current_user.role != models.UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Not authorized")
    ann = db.query(models.Announcement).filter(models.Announcement.id == ann_id).first()
    if not ann:
        raise HTTPException(status_code=404, detail="Announcement not found")
    db.delete(ann)
    db.commit()
    return {"status": "success"}

# --- Bookmarks ---
@router.get("/api/bookmarks", response_model=List[BookmarkResponse])
def get_bookmarks(db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    return db.query(models.Bookmark).filter(models.Bookmark.user_id == current_user.id).all()

@router.post("/api/bookmarks", response_model=BookmarkResponse)
def add_bookmark(bookmark: BookmarkCreate, db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    existing = db.query(models.Bookmark).filter(models.Bookmark.user_id == current_user.id, models.Bookmark.document_id == bookmark.document_id).first()
    if existing:
        return existing
    db_bm = models.Bookmark(user_id=current_user.id, document_id=bookmark.document_id)
    db.add(db_bm)
    db.commit()
    db.refresh(db_bm)
    return db_bm

@router.delete("/api/bookmarks/{doc_id}")
def remove_bookmark(doc_id: int, db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    db.query(models.Bookmark).filter(models.Bookmark.user_id == current_user.id, models.Bookmark.document_id == doc_id).delete()
    db.commit()
    return {"status": "success"}

# --- Document Management (Faculty) ---
# Endpoint moved to documents.py to ensure FAISS index is cleared
