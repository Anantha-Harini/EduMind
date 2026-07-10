from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from .. import crud, schemas, auth, database, models

router = APIRouter(prefix="/api/notifications", tags=["Notifications"])

@router.get("/", response_model=List[schemas.NotificationResponse])
def get_notifications(db: Session = Depends(database.get_db),
                      current_user: models.User = Depends(auth.get_current_user)):
    return crud.get_notifications(db, current_user.id)

@router.post("/read")
def mark_read(db: Session = Depends(database.get_db),
              current_user: models.User = Depends(auth.get_current_user)):
    crud.mark_notifications_read(db, current_user.id)
    return {"status": "ok"}

@router.post("/{notif_id}/read")
def mark_single_read(notif_id: int, db: Session = Depends(database.get_db),
                     current_user: models.User = Depends(auth.get_current_user)):
    notif = db.query(models.Notification).filter(
        models.Notification.id == notif_id,
        models.Notification.user_id == current_user.id
    ).first()
    if notif:
        notif.is_read = True
        db.commit()
    return {"status": "ok"}
