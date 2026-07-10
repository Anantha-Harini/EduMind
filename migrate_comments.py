import sqlite3

def upgrade():
    try:
        conn = sqlite3.connect('kmp.db')
        c = conn.cursor()
        c.execute("""
            CREATE TABLE IF NOT EXISTS document_comments (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                document_id INTEGER,
                user_id INTEGER,
                content TEXT NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY(user_id) REFERENCES users(id),
                FOREIGN KEY(document_id) REFERENCES documents(id)
            )
        """)
        conn.commit()
        print("document_comments table created.")
    except Exception as e:
        print("Error:", e)
    finally:
        conn.close()

if __name__ == "__main__":
    upgrade()
