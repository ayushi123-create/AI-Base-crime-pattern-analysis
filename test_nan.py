
import pandas as pd
import numpy as np
import json

df = pd.DataFrame({
    'a': [1, 2, np.nan],
    'b': ['x', 'y', None],
    'c': [1.1, np.nan, 3.3]
})

print("Original:")
print(df)

# The line from app.py
df_clean = df.where(pd.notnull(df), None)

print("\nCleaned:")
print(df_clean)

# Convert to dict
data = df_clean.to_dict(orient='records')
print("\nDict:")
print(data)

# Simulate jsonify behavior
try:
    print("\nJSON Dump:")
    print(json.dumps(data))
except Exception as e:
    print(f"\nJSON Error: {e}")

# Check for NaN in dict
for row in data:
    for k, v in row.items():
        if isinstance(v, float) and np.isnan(v):
            print(f"FOUND NaN in {k}: {v}")
