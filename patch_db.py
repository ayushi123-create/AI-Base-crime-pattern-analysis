
import sqlite3
import os

DB_PATH = 'crime_data.db'

def patch_db():
    try:
        conn = sqlite3.connect(DB_PATH)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        
        # 1. Check if column exists
        cursor.execute("PRAGMA table_info(users)")
        columns = [info[1] for info in cursor.fetchall()]
        
        if 'username' not in columns:
            print("Adding 'username' column...")
            cursor.execute("ALTER TABLE users ADD COLUMN username VARCHAR(50)")
            conn.commit()
            
            # 2. Update Admin
            print("Updating Admin username...")
            cursor.execute("UPDATE users SET username = 'admin' WHERE user_id = 1 OR role = 'admin' OR email = 'admin@police.gov'")
            cursor.execute("UPDATE users SET username = 'officer' WHERE user_id = 2 OR role = 'officer' OR email = 'officer@police.gov'")
            conn.commit()
            
            # 3. Add Index
            print("Creating index...")
            cursor.execute("CREATE UNIQUE INDEX IF NOT EXISTS idx_users_username ON users(username)")
        else:
            print("'username' column already exists.")
        
        conn.commit()
        print("Database patched successfully.")
        
        # Verify
        cursor.execute("SELECT * FROM users")
        users = cursor.fetchall()
        for u in users:
            print(f"User: {u['full_name']}, Email: {u['email']}, Username: {u['username']}")

    except Exception as e:
        print(f"Error patching DB: {e}")
    finally:
        if 'conn' in locals(): conn.close()

if __name__ == '__main__':
    patch_db()
