from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Text, Enum, Float, Boolean, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .database import Base
import enum


class UserRole(str, enum.Enum):
    STUDENT = "student"
    FACULTY = "faculty"
    ADMIN = "admin"
    GUEST = "guest"


class DocStatus(str, enum.Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"


class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(Enum(UserRole), default=UserRole.STUDENT, nullable=False)
    is_active = Column(Integer, default=1)
    full_name = Column(String, nullable=True)
    department = Column(String, nullable=True)
    bio = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Explicit foreign_keys on both sides to avoid AmbiguousForeignKeysError
    documents = relationship("Document", back_populates="owner",
                             primaryjoin="User.id == Document.owner_id",
                             foreign_keys="[Document.owner_id]")
    notifications = relationship("Notification", back_populates="user")
    interactions = relationship("UserInteraction", back_populates="user")


class Category(Base):
    __tablename__ = "categories"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True, nullable=False)
    description = Column(Text, nullable=True)
    documents = relationship("Document", back_populates="category")


class Document(Base):
    __tablename__ = "documents"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True, nullable=False)
    description = Column(Text, nullable=True)
    file_path = Column(String, nullable=False)
    file_type = Column(String, nullable=True)
    tags = Column(String, nullable=True)
    status = Column(Enum(DocStatus), default=DocStatus.PENDING, nullable=False)
    view_count = Column(Integer, default=0)
    summary = Column(Text, nullable=True)
    upvote_count = Column(Integer, default=0)
    upload_date = Column(DateTime(timezone=True), server_default=func.now())

    owner_id = Column(Integer, ForeignKey("users.id"))
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=True)
    approved_by = Column(Integer, ForeignKey("users.id"), nullable=True)

    # Explicit foreign_keys to resolve ambiguity (two FKs from documents → users)
    owner = relationship("User", back_populates="documents", foreign_keys=[owner_id])
    category = relationship("Category", back_populates="documents")
    interactions = relationship("UserInteraction", back_populates="document")
    questions = relationship("GeneratedQuestion", back_populates="document")


class SearchLog(Base):
    __tablename__ = "search_logs"
    id = Column(Integer, primary_key=True, index=True)
    query = Column(String, nullable=False)
    results_count = Column(Integer, default=0)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())


class UserInteraction(Base):
    __tablename__ = "user_interactions"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    document_id = Column(Integer, ForeignKey("documents.id"))
    interaction_type = Column(String, default="view")  # view / download / search
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
    user = relationship("User", back_populates="interactions")
    document = relationship("Document", back_populates="interactions")


class Notification(Base):
    __tablename__ = "notifications"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    message = Column(String, nullable=False)
    link = Column(String, nullable=True)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    user = relationship("User", back_populates="notifications")


class GeneratedQuestion(Base):
    __tablename__ = "generated_questions"
    id = Column(Integer, primary_key=True, index=True)
    document_id = Column(Integer, ForeignKey("documents.id"))
    question_text = Column(Text, nullable=False)
    question_type = Column(String, default="mcq")     # mcq / short / descriptive
    options = Column(JSON, nullable=True)              # for MCQ: list of options
    answer = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    document = relationship("Document", back_populates="questions")


class Flashcard(Base):
    __tablename__ = "flashcards"
    id = Column(Integer, primary_key=True, index=True)
    document_id = Column(Integer, ForeignKey("documents.id"))
    question = Column(Text, nullable=False)
    answer = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    document = relationship("Document")

class QuizResult(Base):
    __tablename__ = "quiz_results"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    document_id = Column(Integer, ForeignKey("documents.id"))
    score = Column(Integer, default=0)
    total_questions = Column(Integer, default=0)
    completed_at = Column(DateTime(timezone=True), server_default=func.now())
    user = relationship("User")
    document = relationship("Document")

class UserProgress(Base):
    __tablename__ = "user_progress"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=True)
    completion_percentage = Column(Float, default=0.0)
    study_time_minutes = Column(Integer, default=0)
    last_accessed = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    user = relationship("User")
    category = relationship("Category")

class Bookmark(Base):
    __tablename__ = "bookmarks"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    document_id = Column(Integer, ForeignKey("documents.id"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    user = relationship("User")
    document = relationship("Document")

class Announcement(Base):
    __tablename__ = "announcements"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    content = Column(Text, nullable=False)
    author_id = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    author = relationship("User")

class Upvote(Base):
    __tablename__ = "upvotes"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    document_id = Column(Integer, ForeignKey("documents.id"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    user = relationship("User")
    document = relationship("Document")

class DocumentComment(Base):
    __tablename__ = "document_comments"
    id = Column(Integer, primary_key=True, index=True)
    document_id = Column(Integer, ForeignKey("documents.id"))
    user_id = Column(Integer, ForeignKey("users.id"))
    content = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    user = relationship("User")
    document = relationship("Document")
