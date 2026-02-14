import sqlite3
import os
from backend.app.services.database import DB_PATH

if not os.path.exists(DB_PATH):
    print(f"Database file NOT found at: {DB_PATH}")
else:
    print(f"Database file found at: {DB_PATH}")
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    try:
        cursor.execute("PRAGMA table_info(users)")
        columns = cursor.fetchall()
        if not columns:
            print("Table 'users' does NOT exist.")
        else:
            print("Table 'users' exists with columns:")
            for col in columns:
                print(f" - {col[1]} ({col[2]})")
    except Exception as e:
        print(f"Error checking schema: {e}")
    finally:
        conn.close()
