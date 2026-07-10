# EduMind – AI‑Powered Knowledge Management Portal

## Overview
EduMind is a modern, full‑stack platform that helps educational institutions manage, search, and interact with knowledge assets. It combines a **FastAPI** backend, **SQLite** database, and a **React** frontend with AI‑driven features such as semantic search, document summarisation, RAG chatbot, automatic quiz generation, flashcards, and analytics.

---

## Features

- **Smart Document Processing** – Upload PDFs, DOCX, TXT; automatic text extraction, AI‑generated summaries, and tagging.
- **Semantic Search** – Find documents by meaning using sentence‑transformers embeddings stored in a FAISS index.
- **RAG Chatbot** – Conversational AI that retrieves precise answers from the indexed knowledge base.
- **AI Quiz Generator** – Dynamically creates practice questions based on document content.
- **Flashcards & Leaderboard** – Generate study flashcards and track quiz scores across users.
- **Rich Analytics** – Dashboard showing search trends, knowledge gaps, and user engagement.
- **Premium UI** – Glass‑morphism design, interactive D3.js knowledge graph, and dynamic notifications.
- **User & Role Management** – Admins can create, edit, and deactivate users (Admin, Faculty, Student).
- **Document Management** – Approve pending uploads, delete documents, and view detailed stats.
- **Announcements & Notifications** – Broadcast messages and push real‑time alerts to users.

---

## Security
- **Role‑Based Access Control (RBAC)** – Distinct permissions for Admins, Faculty, and Students.
- **Authentication** – JWT‑based protected API endpoints and frontend routes.
- **Secure Configuration** – Sensitive credentials (e.g., secret keys) stored in environment variables.

---

## Tech Stack

| Layer      | Technology                               |
|------------|------------------------------------------|
| Backend    | FastAPI, SQLAlchemy, SQLite, FAISS, LangChain, Google Gemini |
| Frontend   | React (Vite), Vanilla CSS, D3.js, Glass‑morphism UI |
| Database   | SQLite (relational) + FAISS index for embeddings |
| Testing    | Pytest, Jest (frontend) |
| Deployment | Docker (optional), Uvicorn server |

---

## Project Structure
```
EduMind/
├─ app/                     # FastAPI backend source
│   ├─ routers/            # API route controllers (auth, docs, search, chatbot)
│   ├─ services/           # AI modules (summarisation, embeddings, quiz generation)
│   ├─ models.py           # SQLAlchemy table definitions
│   └─ crud.py             # Database transaction helpers
├─ frontend/                # React Vite frontend
│   ├─ src/
│   │   ├─ components/     # UI components (Layout, DocumentCard, Chatbot, etc.)
│   │   ├─ pages/          # Pages (Dashboard, Library, Quiz, AdminDashboard)
│   │   └─ App.jsx
│   └─ vite.config.js
├─ uploads/                 # Stored document files (seeded content)
├─ kmp.db                   # SQLite database file
├─ seed_demo.py             # Demo data injection script
├─ requirements.txt         # Python dependencies
└─ README.md                # Project documentation (this file)
```

---

## Getting Started
### Prerequisites
- **Python 3.9+** (added to PATH)
- **Node.js & npm** (for the React frontend)
- **Git** (optional, for version control)

### 1️⃣ Clone the Repository
```bash
git clone <repository_url>
cd EduMind
```

### 2️⃣ Set Up the Backend
```bash
# Create and activate a virtual environment
python -m venv venv
# Windows
.\\venv\\Scripts\\activate
# macOS/Linux
source venv/bin/activate

# Install Python dependencies
pip install -r requirements.txt
```

### 3️⃣ Configure Environment Variables
Create a `.env` file in the project root:
```dotenv
SECRET_KEY=your-secret-key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

### 4️⃣ Seed the Demo Database
```bash
python seed_demo.py
```
The script creates users, categories, sample documents, quizzes, comments, notifications, and a pending document for moderation.

### 5️⃣ Run the Backend Server
```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
Backend API will be available at **http://localhost:8000**.

### 6️⃣ Run the Frontend
```bash
cd frontend
npm install
npm run dev   # Vite dev server on http://localhost:5173
```
Open the URL in your browser to explore the portal.

---

## Running Tests
Backend tests use **pytest**. To execute:
```bash
cd app
pytest
```
Frontend tests (if any) can be run with **npm test** inside the `frontend` folder.

---

## License
This project is open source and available under the **MIT License**.

---


