from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os

from . import models
from .database import engine
from .routers import auth, documents, chatbot, categories, profile, notifications, analytics, questions, extra

# Create all DB tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="EduMind API", version="2.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allow React frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

# Initialize storage dirs
for d in ["uploads"]:
    os.makedirs(d, exist_ok=True)

# Register all routers
for router in [auth.router, documents.router, chatbot.router, categories.router,
               profile.router, notifications.router, analytics.router, questions.router, extra.router]:
    app.include_router(router)

@app.get("/")
async def root():
    return {"message": "Welcome to the EduMind API. Access /docs for Swagger UI."}

