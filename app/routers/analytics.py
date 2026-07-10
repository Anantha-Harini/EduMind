from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from .. import crud, schemas, auth, database, models
from ..services import ai

router = APIRouter(prefix="/api/analytics", tags=["Analytics"])

def admin_only(current_user: models.User = Depends(auth.get_current_user)):
    if current_user.role != models.UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Admin only")
    return current_user

@router.get("/overview")
def analytics_overview(db: Session = Depends(database.get_db), _=Depends(admin_only)):
    return crud.get_analytics_overview(db)

@router.get("/top-docs")
def top_docs(db: Session = Depends(database.get_db), _=Depends(admin_only)):
    return crud.get_top_docs(db)

@router.get("/search-trends")
def search_trends(db: Session = Depends(database.get_db), _=Depends(admin_only)):
    trends = crud.get_search_trends(db)
    return [{"query": t[0], "count": t[1]} for t in trends]

@router.get("/knowledge-gaps")
def knowledge_gaps(db: Session = Depends(database.get_db), _=Depends(admin_only)):
    gaps = crud.get_knowledge_gaps(db)
    return [{"query": g[0], "count": g[1]} for g in gaps]

@router.get("/knowledge-graph")
def knowledge_graph(db: Session = Depends(database.get_db),
                    current_user: models.User = Depends(auth.get_current_user)):
    cats = crud.get_categories(db)
    docs = crud.get_documents(db, limit=200, status=models.DocStatus.APPROVED)
    return ai.build_knowledge_graph(cats, docs)

@router.get("/student/me")
def student_analytics(db: Session = Depends(database.get_db),
                      current_user: models.User = Depends(auth.get_current_user)):
    quizzes = db.query(models.QuizResult).filter(models.QuizResult.user_id == current_user.id).all()
    
    total_quizzes = len(quizzes)
    avg_score = sum(q.score / max(q.total_questions, 1) for q in quizzes) / total_quizzes if total_quizzes > 0 else 0
    
    docs_viewed = db.query(models.UserInteraction).filter(
        models.UserInteraction.user_id == current_user.id,
        models.UserInteraction.interaction_type == "view"
    ).count()
    
    return {
        "total_quizzes": total_quizzes,
        "average_score": round(avg_score * 100),
        "docs_viewed": docs_viewed
    }

@router.get("/student/history")
def student_history(db: Session = Depends(database.get_db),
                    current_user: models.User = Depends(auth.get_current_user)):
    quizzes = db.query(models.QuizResult).filter(
        models.QuizResult.user_id == current_user.id
    ).order_by(models.QuizResult.completed_at.desc()).limit(10).all()
    
    results = []
    for q in quizzes:
        doc = db.query(models.Document).filter(models.Document.id == q.document_id).first()
        if doc:
            results.append({
                "id": q.id,
                "document_title": doc.title,
                "score": q.score,
                "total_questions": q.total_questions,
                "completed_at": q.completed_at
            })
    return results

@router.get("/leaderboard")
def leaderboard(db: Session = Depends(database.get_db),
                current_user: models.User = Depends(auth.get_current_user)):
    # Calculate top students by total score or number of quizzes
    from sqlalchemy import func
    
    # Query to sum up scores for each user
    top_students = db.query(
        models.User.full_name,
        models.User.email,
        func.sum(models.QuizResult.score).label('total_score'),
        func.count(models.QuizResult.id).label('quizzes_taken')
    ).join(models.QuizResult, models.QuizResult.user_id == models.User.id)\
     .filter(models.User.role == models.UserRole.STUDENT)\
     .group_by(models.User.id)\
     .order_by(func.sum(models.QuizResult.score).desc())\
     .limit(10).all()
     
    return [
        {
            "rank": idx + 1,
            "name": ts.full_name or ts.email.split('@')[0],
            "total_score": ts.total_score,
            "quizzes_taken": ts.quizzes_taken
        }
        for idx, ts in enumerate(top_students)
    ]

@router.get("/student/weak-topics")
def weak_topics(db: Session = Depends(database.get_db),
                current_user: models.User = Depends(auth.get_current_user)):
    quizzes = db.query(models.QuizResult).filter(models.QuizResult.user_id == current_user.id).all()
    
    topic_scores = {}
    for q in quizzes:
        doc = db.query(models.Document).filter(models.Document.id == q.document_id).first()
        if doc and doc.category_id:
            cat = crud.get_categories(db)
            cat_name = next((c.name for c in cat if c.id == doc.category_id), "General")
            
            if cat_name not in topic_scores:
                topic_scores[cat_name] = {"total_score": 0, "total_questions": 0}
            
            topic_scores[cat_name]["total_score"] += q.score
            topic_scores[cat_name]["total_questions"] += max(q.total_questions, 1)
            
    # Calculate percentages and find weak ones (< 70%)
    weak = []
    for topic, stats in topic_scores.items():
        pct = (stats["total_score"] / stats["total_questions"]) * 100
        if pct < 70:
            weak.append({"topic": topic, "score": round(pct)})
            
    # Sort by lowest score
    weak.sort(key=lambda x: x["score"])
    return weak

@router.get("/faculty/stats")
def faculty_stats(db: Session = Depends(database.get_db),
                  current_user: models.User = Depends(auth.get_current_user)):
    if current_user.role not in [models.UserRole.FACULTY, models.UserRole.ADMIN]:
        raise HTTPException(status_code=403, detail="Not authorized")
        
    # Get documents uploaded by this faculty
    docs = db.query(models.Document).filter(models.Document.owner_id == current_user.id).all()
    doc_ids = [d.id for d in docs]
    
    total_views = sum(d.view_count for d in docs)
    total_upvotes = sum((d.upvote_count or 0) for d in docs)
    
    # Quiz stats for their documents
    from sqlalchemy import func
    quiz_stats = db.query(
        func.count(models.QuizResult.id).label("total_attempts"),
        func.avg(models.QuizResult.score / models.QuizResult.total_questions).label("avg_score")
    ).filter(models.QuizResult.document_id.in_(doc_ids)).first() if doc_ids else (0, 0)
    
    return {
        "total_documents": len(docs),
        "total_views": total_views,
        "total_upvotes": total_upvotes,
        "quiz_attempts_on_materials": quiz_stats[0] or 0,
        "average_quiz_score_on_materials": round((quiz_stats[1] or 0) * 100)
    }

