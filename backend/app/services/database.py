import sqlite3
import os
from dotenv import load_dotenv

load_dotenv()

DB_PATH = os.getenv('SQLITE_DB_PATH', 'crime_data.db')

def get_db_connection():
    try:
        connection = sqlite3.connect(DB_PATH)
        connection.row_factory = sqlite3.Row  # This allows accessing columns by name
        return connection
    except Exception as e:
        print(f"Error connecting to SQLite: {e}")
        return None

def init_db():
    connection = get_db_connection()
    if connection:
        cursor = connection.cursor()
        try:
            # Drop existing tables if they exist to ensure schema is fresh
            cursor.execute("DROP TABLE IF EXISTS crimes")
            cursor.execute("DROP TABLE IF EXISTS users")
            
            # Read schema.sql and execute
            # Note: SQLite doesn't support 'AUTO_INCREMENT' (uses AUTOINCREMENT) 
            # and 'DATETIME' handled as text or TIMESTAMP. 
            # I'll modify the schema execution to be SQLite compatible.
            with open('schema.sql', 'r') as f:
                schema_sql = f.read()
                
                # SQLite compatibility adjustments
                schema_sql = schema_sql.replace('INT AUTO_INCREMENT', 'INTEGER')
                schema_sql = schema_sql.replace('AUTOINCREMENT', '') # Remove if already present from previous replace attempt
                schema_sql = schema_sql.replace('PRIMARY KEY', 'PRIMARY KEY AUTOINCREMENT')
                schema_sql = schema_sql.replace('INTEGER PRIMARY KEY AUTOINCREMENT', 'INTEGER PRIMARY KEY AUTOINCREMENT') # Ensure it's correct
                schema_sql = schema_sql.replace('INT ', 'INTEGER ')
                schema_sql = schema_sql.replace('DECIMAL(10, 8)', 'REAL')
                schema_sql = schema_sql.replace('DECIMAL(11, 8)', 'REAL')
                schema_sql = schema_sql.replace('ENUM(\'ADMIN\', \'ANALYST\', \'VIEWER\') DEFAULT \'VIEWER\'', 'TEXT DEFAULT \'VIEWER\'')
                schema_sql = schema_sql.replace('TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP', 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP')
                schema_sql = schema_sql.replace('CREATE DATABASE IF NOT EXISTS crime_db;', '')
                schema_sql = schema_sql.replace('USE crime_db;', '')
                
                # Special fix for the composite cases
                schema_sql = schema_sql.replace('id INTEGER PRIMARY KEY AUTOINCREMENT', 'id INTEGER PRIMARY KEY AUTOINCREMENT')

                # Split commands by semicolon
                for clause in schema_sql.split(';'):
                    if clause.strip():
                        cursor.execute(clause)
            connection.commit()
            print(f"SQLite Database initialized at {DB_PATH}.")
        except Exception as e:
            print(f"Error initializing SQLite database: {e}")
        finally:
            cursor.close()
            connection.close()
