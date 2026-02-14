
import math
import numpy as np
import json

def clean_nans(data):
    if isinstance(data, float):
        if math.isnan(data) or np.isnan(data):
            return None
    elif isinstance(data, dict):
        return {k: clean_nans(v) for k, v in data.items()}
    elif isinstance(data, list):
        return [clean_nans(v) for v in data]
    return data

data = {
    "val": 1.0,
    "bad": float('nan'),
    "bad_np": np.nan,
    "nested": {"x": float('nan'), "y": 2}
}

cleaned = clean_nans(data)
print(f"Original: {data}")
print(f"Cleaned: {cleaned}")

try:
    json_out = json.dumps(cleaned)
    print(f"JSON: {json_out}")
    if 'NaN' not in json_out and 'null' in json_out:
        print("VERIFICATION SUCCESS")
    else:
        print("VERIFICATION FAILED")
except Exception as e:
    print(f"Error: {e}")
