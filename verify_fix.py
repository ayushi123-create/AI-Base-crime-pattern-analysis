
from flask import Flask
from flask.json.provider import DefaultJSONProvider
import simplejson
import math
import numpy as np

class SimpleJsonProvider(DefaultJSONProvider):
    def dumps(self, obj, **kwargs):
        return simplejson.dumps(obj, **kwargs, ignore_nan=True)

    def loads(self, s, **kwargs):
        return simplejson.loads(s, **kwargs)

app = Flask(__name__)
app.json = SimpleJsonProvider(app)

data = {
    "float_nan": float('nan'),
    "numpy_nan": np.nan,
    "valid": 123
}

with app.app_context():
    json_output = app.json.dumps(data)
    print(f"Serialized JSON: {json_output}")

    if 'NaN' not in json_output and 'null' in json_output:
        print("VERIFICATION SUCCESS: NaNs converted to null.")
    else:
        print("VERIFICATION FAILED: NaNs still present or not converted correctly.")
