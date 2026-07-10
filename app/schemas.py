from pydantic import BaseModel, EmailStr
from typing import Optional, List, Any
from datetime import datetime
from .models import UserRole, DocStatus


# ── User ──────────────────────────────────────────────────
class UserBase(BaseModel):
    email: EmailStr

class UserCreate(UserBase):
    password: str
    role: Optional[UserRole] = UserRole.STUDENT

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    department: Optional[str] = None
    bio: Optional[str] = None

class UserResponse(UserBase):
    id: int
    role: UserRole
    is_active: int
    full_name: Optional[str] = None
    department: Optional[str] = None
    bio: Optional[str] = None
    class Config:
        from_attributes = True

# ── Token ─────────────────────────────────────────────────
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None
    role: Optional[UserRole] = None

# ── Category ──────────────────────────────────────────────
class CategoryBase(BaseModel):
    name: str
    description: Optional[str] = None

class CategoryCreate(CategoryBase):
    pass

class CategoryResponse(CategoryBase):
    id: int
    class Config:
        from_attributes = True

# ── Document ──────────────────────────────────────────────
class DocumentBase(BaseModel):
    title: str
    description: Optional[str] = None
    category_id: Optional[int] = None
    tags: Optional[str] = None

class DocumentCreate(DocumentBase):
    pass

class DocumentResponse(DocumentBase):
    id: int
    file_path: str
    file_type: Optional[str]
    status: DocStatus
    view_count: int
    upvote_count: Optional[int] = 0
    summary: Optional[str]
    upload_date: datetime
    owner_id: int
    class Config:
        from_attributes = True

# ── SearchLog ─────────────────────────────────────────────
class SearchLogCreate(BaseModel):
    query: str
    results_count: int

# ── Notification ──────────────────────────────────────────
class NotificationResponse(BaseModel):
    id: int
    message: str
    link: Optional[str]
    is_read: bool
    created_at: datetime
    class Config:
        from_attributes = True

# ── Question ──────────────────────────────────────────────
class QuestionResponse(BaseModel):
    id: int
    document_id: int
    question_text: str
    question_type: str
    options: Optional[List[str]]
    answer: Optional[str]
    class Config:
        from_attributes = True
