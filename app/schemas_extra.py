from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from .models import UserRole

class RoleUpdate(BaseModel):
    role: UserRole

from .schemas import DocumentResponse

class BookmarkCreate(BaseModel):
    document_id: int

class BookmarkResponse(BaseModel):
    id: int
    document_id: int
    created_at: datetime
    document: Optional[DocumentResponse] = None
    class Config:
        from_attributes = True

class AnnouncementCreate(BaseModel):
    title: str
    content: str

class CommentCreate(BaseModel):
    content: str

class CommentResponse(BaseModel):
    id: int
    document_id: int
    user_id: int
    content: str
    created_at: datetime
    # We could also include a nested user field, but let's keep it simple or return raw dict
    class Config:
        from_attributes = True

class AnnouncementResponse(BaseModel):
    id: int
    title: str
    content: str
    author_id: int
    created_at: datetime
    class Config:
        from_attributes = True
