
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

# Proposed fix: Convert to object then replace
df_clean = df.astype(object).where(pd.notnull(df), None)

print("\nCleaned (astype object):")
print(df_clean)

data = df_clean.to_dict(orient='records')
print("\nDict:")
print(data)

print("\nJSON Dump:")
print(json.dumps(data))
