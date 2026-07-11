# Updated EduMind backend main entrypoint with static file serving and health endpoint

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os
import pathlib

from . import models
from .database import engine
from .routers import auth, documents, chatbot, categories, profile, notifications, analytics, questions, extra

# Create all DB tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="EduMind API", version="2.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow React frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register all routers first so they take precedence
for router in [
    auth.router,
    documents.router,
    chatbot.router,
    categories.router,
    profile.router,
    notifications.router,
    analytics.router,
    questions.router,
    extra.router,
]:
    app.include_router(router)

# Serve React build (single service deployment) after routers
BUILD_DIR = pathlib.Path(__file__).parent.parent / "frontend" / "dist"
app.mount("/", StaticFiles(directory=BUILD_DIR, html=True), name="frontend")

# Initialize storage directories
for d in ["uploads"]:
    os.makedirs(d, exist_ok=True)

# Simple health check
@app.get("/health")
async def health():
    return {"message": "EduMind API is healthy"}

