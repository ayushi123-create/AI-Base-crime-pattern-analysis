
import os
import sqlite3
import pandas as pd
import json
import numpy as np

# Mocking the app logic
def get_db_connection():
    try:
        conn = sqlite3.connect('crime_data.db')
        conn.row_factory = sqlite3.Row
        return conn
    except Exception as e:
        print(f"DB Error: {e}")
        return None

def diagnose():
    print("--- DIAGNOSTIC START ---")
    conn = get_db_connection()
    if not conn:
        print("FAIL: Could not connect to DB")
        return

    try:
        query = "SELECT * FROM crimes LIMIT 5"
        df = pd.read_sql(query, conn)
        print(f"Data Loaded: {len(df)} records")
        
        # Exact logic from app.py
        crimes_raw = df.to_dict(orient='records')
        crimes = [{k: (None if pd.isna(v) else v) for k, v in record.items()} for record in crimes_raw]
        
        json_output = json.dumps(crimes)
        
        if "NaN" in json_output:
            print("FAIL: JSON contains 'NaN'")
            print(json_output)
        else:
            print("SUCCESS: JSON is clean (no NaN)")
            print(json_output[:200] + "...")
            
    except Exception as e:
        print(f"FAIL: Logic Error - {e}")
    finally:
        conn.close()
    print("--- DIAGNOSTIC END ---")

if __name__ == "__main__":
    diagnose()
