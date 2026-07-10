import os
import shutil
from sqlalchemy.orm import Session
from app.database import engine, Base, SessionLocal
from app.models import User, UserRole, Category, Document, DocStatus
from app.services import ai
from app.auth import get_password_hash

def reset_database():
    print("Clearing database and FAISS index...")
    
    # 1. Drop existing tables and recreate
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    
    # 2. Clear FAISS index files
    if os.path.exists("faiss_index.bin"):
        os.remove("faiss_index.bin")
    if os.path.exists("faiss_metadata.pkl"):
        os.remove("faiss_metadata.pkl")
        
    # 3. Clear uploads directory safely
    if os.path.exists("uploads"):
        for filename in os.listdir("uploads"):
            file_path = os.path.join("uploads", filename)
            try:
                if os.path.isfile(file_path):
                    os.remove(file_path)
            except Exception as e:
                print(f"Skipping {file_path}: {e}")
    os.makedirs("uploads", exist_ok=True)
    
    print("Database and indexes cleared.")

def create_users_and_categories(db: Session):
    print("Creating users and categories...")
    users = [
        User(email="admin@kmp.edu", hashed_password=get_password_hash("admin123"), role=UserRole.ADMIN, full_name="System Admin"),
        User(email="faculty@kmp.edu", hashed_password=get_password_hash("faculty123"), role=UserRole.FACULTY, full_name="Dr. Smith"),
        User(email="student@kmp.edu", hashed_password=get_password_hash("student123"), role=UserRole.STUDENT, full_name="Jane Doe"),
    ]
    db.add_all(users)
    
    categories = [
        Category(name="Computer Science", description="CS and Programming topics"),
        Category(name="Physics", description="Quantum mechanics, relativity, etc."),
        Category(name="Web Development", description="Frontend, Backend, frameworks"),
        Category(name="Artificial Intelligence", description="Machine Learning and Neural Networks")
    ]
    db.add_all(categories)
    db.commit()

def generate_and_seed_files(db: Session):
    print("Creating new sample files and indexing...")
    
    files_to_create = [
        {
            "filename": "Quantum_Computing_Basics.txt",
            "title": "Introduction to Quantum Computing",
            "category": "Physics",
            "content": "Quantum computing is a rapidly-emerging technology that harnesses the laws of quantum mechanics to solve problems too complex for classical computers. Classical computers encode information in bits that take the value of 1 or 0. Quantum computers, on the other hand, use quantum bits or qubits. A qubit can be a 1 or a 0, or it can exist in a superposition of both states simultaneously. Another key concept is entanglement, which allows qubits that are separated by incredible distances to interact with each other instantaneously. These principles allow quantum computers to process massive amounts of data at unprecedented speeds, which is highly beneficial for cryptography, material science, and complex system simulations."
        },
        {
            "filename": "Advanced_React_Patterns.txt",
            "title": "Advanced React Patterns in 2026",
            "category": "Web Development",
            "content": "React in 2026 relies heavily on Server Components and the new compiler that optimizes re-renders automatically, making useMemo and useCallback mostly obsolete. When building complex UIs, adopting the Compound Component pattern allows for flexible and expressive APIs. Another critical pattern is the Custom Hook pattern, which extracts stateful logic for maximum reusability. For managing asynchronous state, suspense boundaries coupled with the 'use' hook have revolutionized data fetching. We no longer write verbose useEffect chains to load data. Instead, components natively suspend while promises resolve, allowing for highly declarative loading states."
        },
        {
            "filename": "The_Future_of_AI.txt",
            "title": "The Future of AI and Large Language Models",
            "category": "Artificial Intelligence",
            "content": "Artificial Intelligence has shifted from generative text models to fully autonomous agentic workflows. Large Language Models (LLMs) like Gemini and GPT are now embedded directly into IDEs, allowing them to write entire codebases, run bash commands, and debug their own errors. This is known as Agentic AI. The primary challenge currently lies in context management—how to allow an AI to remember thousands of files seamlessly. Retrieval-Augmented Generation (RAG) using vector databases like FAISS and ChromaDB solved this by converting documents into high-dimensional vectors, allowing the AI to 'search' for context semantically rather than relying on exact keyword matches."
        },
        {
            "filename": "Microservices_Architecture.txt",
            "title": "Microservices Architecture Principles",
            "category": "Computer Science",
            "content": "Microservices architecture is a design pattern where an application is composed of many small, independent services communicating over well-defined APIs. Unlike monolithic architectures, where all code is packaged into a single deployable unit, microservices allow individual teams to develop, deploy, and scale services independently. A key principle is decentralised data management; each service should own its own database to prevent tight coupling. Communication is typically handled via synchronous HTTP/REST or asynchronous message brokers like Kafka or RabbitMQ. While microservices offer immense scalability, they introduce complexity in monitoring, distributed tracing, and transaction management."
        }
    ]
    
    faculty_user = db.query(User).filter_by(role=UserRole.FACULTY).first()
    
    for file_data in files_to_create:
        filepath = os.path.join("uploads", file_data["filename"])
        with open(filepath, "w") as f:
            f.write(file_data["content"])
            
        category = db.query(Category).filter_by(name=file_data["category"]).first()
        
        # 1. AI Processing
        print(f"  -> Processing {file_data['title']} with Gemini...")
        summary = ai.summarize_text(file_data["content"])
        tags = ai.extract_tags(file_data["content"])
        
        # 2. Database Insertion
        doc = Document(
            title=file_data["title"],
            description="Generated sample document.",
            file_path=filepath,
            file_type="txt",
            tags=tags,
            status=DocStatus.APPROVED,
            summary=summary,
            owner_id=faculty_user.id,
            category_id=category.id,
            approved_by=faculty_user.id
        )
        db.add(doc)
        db.commit()
        db.refresh(doc)
        
        # 3. Add to FAISS Vector Index
        ai.process_and_index_document(doc.id, doc.title, filepath, file_data["category"])

def main():
    reset_database()
    db = SessionLocal()
    try:
        create_users_and_categories(db)
        generate_and_seed_files(db)
        print("Successfully wiped database and seeded with fresh files!")
    finally:
        db.close()

if __name__ == "__main__":
    main()
