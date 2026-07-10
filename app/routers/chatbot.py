from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
from .. import crud, database
from ..services import ai

router = APIRouter(
    prefix="/api/chatbot",
    tags=["Chatbot"]
)

class ChatRequest(BaseModel):
    query: str
    document_id: int | None = None

@router.post("/ask")
def ask_chatbot(request: ChatRequest, db: Session = Depends(database.get_db)):
    """Answers user query using RAG pipeline connected to knowledge base."""
    # 1. Semantic search for context
    search_results = ai.semantic_search(request.query, top_k=3, document_id=request.document_id)
    
    context = ""
    for idx, res in enumerate(search_results):
        context += f"Source {idx+1} ({res['metadata'].get('title', 'Unknown')}):\n{res['content']}\n\n"
        
    # 1b. Fallback if no context found but document_id is provided
    if not context and request.document_id:
        doc = crud.get_document(db, request.document_id)
        if doc and doc.file_path:
            text = ai.extract_text_from_file(doc.file_path)
            context = text[:15000] # Use raw text as context
            
    # 2. Generate answer
    answer = ai.generate_rag_answer(query=request.query, context=context)
    
    return {
        "query": request.query,
        "answer": answer,
        "sources": [res['metadata'] for res in search_results]
    }
