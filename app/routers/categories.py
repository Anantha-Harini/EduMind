from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from .. import crud, schemas, auth, database, models

router = APIRouter(prefix="/api/categories", tags=["Categories"])

@router.get("/", response_model=List[schemas.CategoryResponse])
def list_categories(db: Session = Depends(database.get_db)):
    return crud.get_categories(db)

@router.post("/", response_model=schemas.CategoryResponse)
def create_category(cat: schemas.CategoryCreate, db: Session = Depends(database.get_db),
                    current_user: models.User = Depends(auth.require_role([models.UserRole.ADMIN]))):
    return crud.create_category(db, cat)
