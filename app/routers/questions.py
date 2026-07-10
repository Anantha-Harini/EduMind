from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from .. import crud, schemas, auth, database, models
from ..services import ai

router = APIRouter(prefix="/api/questions", tags=["Questions"])

@router.post("/generate/{doc_id}")
def generate_questions(doc_id: int, db: Session = Depends(database.get_db),
                       current_user: models.User = Depends(auth.get_current_user)):
    doc = crud.get_document(db, doc_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    text = ai.extract_text_from_file(doc.file_path)
    if not text:
        raise HTTPException(status_code=400, detail="Could not extract text from this document.")
    questions = ai.generate_questions(text, num_questions=8)
    crud.save_questions(db, doc_id, questions)
    
    # Refetch from DB to ensure the response uses the `question_text` and `question_type` schema properly
    db_questions = crud.get_questions(db, doc_id)
    return {"doc_id": doc_id, "questions": db_questions}

@router.get("/flashcards/{doc_id}")
def generate_flashcards(doc_id: int, db: Session = Depends(database.get_db),
                        current_user: models.User = Depends(auth.get_current_user)):
    doc = crud.get_document(db, doc_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
        
    db_flashcards = crud.get_flashcards(db, doc_id)
    if db_flashcards:
        # Format for frontend response
        return {"doc_id": doc_id, "flashcards": [{"term": f.question, "definition": f.answer} for f in db_flashcards]}
        
    text = ai.extract_text_from_file(doc.file_path)
    if not text:
        raise HTTPException(status_code=400, detail="Could not extract text from this document.")
    flashcards = ai.generate_flashcards(text)
    
    # Save to db
    crud.save_flashcards(db, doc_id, flashcards)
    
    return {"doc_id": doc_id, "flashcards": flashcards}

from pydantic import BaseModel
class QuizResultCreate(BaseModel):
    document_id: int
    score: int
    total_questions: int

@router.post("/results")
def submit_quiz_result(result: QuizResultCreate, db: Session = Depends(database.get_db),
                       current_user: models.User = Depends(auth.get_current_user)):
    db_result = models.QuizResult(
        user_id=current_user.id,
        document_id=result.document_id,
        score=result.score,
        total_questions=result.total_questions
    )
    db.add(db_result)
    db.commit()
    return {"status": "success"}

@router.get("/{doc_id}", response_model=List[schemas.QuestionResponse])
def get_questions(doc_id: int, db: Session = Depends(database.get_db),
                  current_user: models.User = Depends(auth.get_current_user)):
    return crud.get_questions(db, doc_id)
