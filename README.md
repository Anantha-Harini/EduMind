# KMP - AI-Powered Knowledge Management Portal ⚡

A modern, intelligent knowledge management system built with FastAPI, SQLite, and ChromaDB. This portal features an AI-driven Semantic Search engine, a dynamic Knowledge Graph, automated Document Summarization, and a Contextual RAG Chatbot.

## 🚀 Features
- **Smart Document Processing:** Upload PDFs, DOCXs, and TXTs with automatic text extraction, auto-tagging, and summarization.
- **RAG Chatbot:** Conversational AI assistant that retrieves precise answers directly from indexed documents.
- **Semantic Search:** Go beyond keyword matching. Search by *meaning* powered by `sentence-transformers` and ChromaDB.
- **AI Quiz Generator:** Dynamically generates high-quality practice questions based on deep document analysis.
- **Rich Analytics:** Admin dashboards tracking search trends, knowledge gaps, user engagement, and document views.
- **Premium UI:** Glassmorphism design, interactive D3.js knowledge graphs, and dynamic notifications.

---

## 🛠️ Prerequisites
Before you begin, ensure you have the following installed on your machine:
- **Python 3.9+** (Make sure Python is added to your PATH)
- **Git**

---

## 👥 Setup Instructions for Teammates

### 1. Clone the Repository
Open your terminal and clone the project to your local machine:
```bash
git clone https://github.com/YourUsername/YourRepositoryName.git
cd YourRepositoryName
```

### 2. Create a Virtual Environment
It is highly recommended to use a virtual environment to keep dependencies isolated so they don't interfere with your global Python installation.
```bash
# On Windows:
python -m venv venv

# On macOS/Linux:
python3 -m venv venv
```

### 3. Activate the Virtual Environment
You must activate the virtual environment every time you open a new terminal to work on this project.
```bash
# On Windows:
.\venv\Scripts\activate

# On macOS/Linux:
source venv/bin/activate
```
*(You should see `(venv)` appear at the beginning of your terminal prompt.)*

### 4. Install Dependencies
With the virtual environment active, install all required Python packages from the requirements file. Note: The first time you run this, it may take 2-5 minutes as it downloads heavy AI models like PyTorch and ChromaDB.
```bash
pip install -r requirements.txt
```

### 5. Seed the Demo Database
You need initial data to test the portal! We have a dedicated Python script that will automatically provision the SQLite database, initialize the ChromaDB vector index, download the AI embedding model, and inject 17 distinct academic documents and 3 user accounts.
```bash
python seed_demo.py
```
*(Wait until you see `[OK] Demo Seeding Completed Successfully!`)*

---

## 🏃‍♂️ Running the Server
Once the environment is set up and the database is seeded, you can start the FastAPI web server. Let it run in your terminal.
```bash
python -m uvicorn app.main:app --port 8000
```

Open your web browser and navigate to: **http://localhost:8000**

---

## 🔑 Default Demo Accounts
Use these simulated accounts created by the seed script to log into the portal and test the features:

| Role | Email | Password |
| :--- | :--- | :--- |
| **Admin** | `admin@kmp.edu` | `admin123` |
| **Faculty** | `faculty@kmp.edu` | `faculty123` |
| **Student** | `student@kmp.edu` | `student123` |

*(Note: Only Admins can access the Analytics Dashboard and physically delete documents)*

---

## 📁 Project Structure
```
KMP-V-2.0/
├── app/                  # FastAPI Backend Source Code
│   ├── routers/          # API Route Controllers (Auth, Docs, Search, Chatbot)
│   ├── services/         # AI Modules (ChromaDB, NLP Summarization)
│   ├── models.py         # SQLAlchemy SQL Table Definitions
│   └── crud.py           # Database Transaction logic
├── templates/            # Frontend HTML Pages (Jinja2 + Tailwind)
├── uploads/              # Physical storage for uploaded Document Files
├── chroma_db/            # (Ignored) AI Vector Database Storage
├── kmp.db                # (Ignored) Local SQLite Relational Database
└── seed_demo.py          # Development data injection script
```
