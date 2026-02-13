
import pandas as pd
import numpy as np
import json

# Simulate data exactly as likely received from SQL
data = {
    'id': [1, 2],
    'crime_id': ['C123', 'C456'],
    'community_area': [np.nan, 25.0],  # Int column with nulls becomes float
    'ward': [None, 10]
}

df = pd.DataFrame(data)

print(f"Original Schema:\n{df.dtypes}")
print(f"Original Data:\n{df}")

# Current Fix in app.py
try:
    df_fix1 = df.copy().astype(object).where(pd.notnull(df), None)
    out1 = df_fix1.to_dict(orient='records')
    json1 = json.dumps(out1)
    print("\n[SUCCESS] Current Fix JSON:", json1)
except Exception as e:
    print("\n[FAIL] Current Fix Error:", e)

# Proposed Robust Fix (List Comprehension)
try:
    df_raw = df.copy()
    raw_dicts = df_raw.to_dict(orient='records')
    # Clean manually
    cleaned_dicts = [{k: (None if pd.isna(v) else v) for k, v in r.items()} for r in raw_dicts]
    json2 = json.dumps(cleaned_dicts)
    print("\n[SUCCESS] Robust Fix JSON:", json2)
except Exception as e:
    print("\n[FAIL] Robust Fix Error:", e)
