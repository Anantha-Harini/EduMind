from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from .. import crud, schemas, auth, database, models

router = APIRouter(prefix="/api/profile", tags=["Profile"])

@router.get("/", response_model=schemas.UserResponse)
def get_profile(current_user: models.User = Depends(auth.get_current_user)):
    return current_user

@router.put("/", response_model=schemas.UserResponse)
def update_profile(data: schemas.UserUpdate, db: Session = Depends(database.get_db),
                   current_user: models.User = Depends(auth.get_current_user)):
    return crud.update_user_profile(db, current_user.id, data)
