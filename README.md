# EduMind – AI-Powered Learning Platform

## Project Overview

EduMind is an AI-powered learning and knowledge management platform that enables students and faculty to organize, search, and interact with academic resources. The platform integrates semantic search, AI-powered document analysis, personalized learning, and role-based access to enhance resource discovery and the overall learning experience.

> **For Live Website -** **[Click here](https://edumind-mgtr.onrender.com)**

<img width="1280" height="720" alt="For Demo Video -check screenshots folder" src="https://github.com/Anantha-Harini/EduMind/blob/main/screenshots/EduMind.gif">

## Features

- Upload and manage PDF, DOCX, and TXT resources.
- RAG-based chatbot for document-aware question answering.
- AI-generated document summarization, categorization, and keyword extraction.
- AI-generated quizzes and flashcards from uploaded study materials.
- AI-powered semantic document search powered by Sentence Transformers.
- Personalized student dashboard with quiz history and learning progress.
- Faculty dashboard for resource management and student performance insights.
- Role-based authentication for Administrators, Faculty, and Students.
- Responsive interface with document preview ,bookmarking and discussion support

---

## Tech Stack

| Category | Technologies |
|----------|--------------|
| **Frontend** | React, HTML, CSS, JavaScript |
| **Backend** | FastAPI, Python |
| **Database** | SQLite |
| **AI & NLP** | Google Gemini API, LangChain, Sentence Transformers|
| **Authentication** | JWT Authentication |

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

- Python 3.9+
- Node.js & npm

### Clone the Repository

```bash
git clone https://github.com/your-username/EduMind.git
cd EduMind
```

### Backend Setup

```bash
python -m venv venv

# Windows
venv\Scripts\activate

# macOS/Linux
source venv/bin/activate

pip install -r requirements.txt

uvicorn app.main:app --reload
```

### Frontend Setup

```bash
cd frontend

npm install

npm run dev
```
---

## Running Tests

### Backend (FastAPI)

1. Ensure your virtual environment is activated.
2. Install testing dependencies (pytest is already listed in `requirements.txt`):
   ```bash
   pip install -r requirements.txt
   ```
3. Run the test suite with verbose output:
   ```bash
   cd app
   pytest -v
   ```

### Frontend (React)

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dev dependencies (if not already done):
   ```bash
   npm install
   ```
3. Execute the Jest test runner:
   ```bash
   npm test
---
## License

This project is licensed under the **MIT License**.



