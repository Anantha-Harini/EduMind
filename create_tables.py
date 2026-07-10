from app.database import engine
from app.models import Base

def create_tables():
    Base.metadata.create_all(bind=engine)
    print("Tables created.")

if __name__ == "__main__":
    create_tables()
