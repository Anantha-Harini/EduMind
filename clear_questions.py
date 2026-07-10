from app.database import SessionLocal
from app.models import GeneratedQuestion

def clear_questions():
    db = SessionLocal()
    db.query(GeneratedQuestion).delete()
    db.commit()
    db.close()
    print("Cleared generated questions.")

if __name__ == "__main__":
    clear_questions()
