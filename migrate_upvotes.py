import sqlite3

def upgrade():
    try:
        conn = sqlite3.connect('kmp.db')
        c = conn.cursor()
        c.execute("ALTER TABLE documents ADD COLUMN upvote_count INTEGER DEFAULT 0")
        
        c.execute("""
            CREATE TABLE IF NOT EXISTS upvotes (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER,
                document_id INTEGER,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY(user_id) REFERENCES users(id),
                FOREIGN KEY(document_id) REFERENCES documents(id)
            )
        """)
        conn.commit()
        print("Column upvote_count added and upvotes table created.")
    except Exception as e:
        print("Error or already exists:", e)
    finally:
        conn.close()

if __name__ == "__main__":
    upgrade()
