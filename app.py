from flask import Flask, jsonify, request, render_template
from flask_cors import CORS
import os
from dotenv import load_dotenv

from backend.app.services.database import get_db_connection
from backend.app.models.hotspot_model import HotspotModel
import pandas as pd
import random

app = Flask(__name__, 
            static_folder='frontend/static',
            template_folder='frontend/templates')
CORS(app)

# Default configuration
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'crime-pattern-dev-key')

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/login')
def login_page():
    return render_template('login.html')

@app.route('/register')
def register_page():
    return render_template('register.html')

@app.route('/api/auth/login', methods=['POST'])
def api_login():
    data = request.json
    username = data.get('username')
    password = data.get('password')
    # Basic logic for demo - can be extended with DB check
    if password in ['admin', '1234']:
        return jsonify({"status": "success", "username": username, "role": "OFFICER"}), 200
    return jsonify({"status": "error", "message": "Invalid password"}), 401

@app.route('/api/crimes/submit', methods=['POST'])
def submit_crime():
    data = request.json
    connection = get_db_connection()
    if not connection:
        return jsonify({"error": "Database connection failed"}), 500
    
    try:
        cursor = connection.cursor()
        query = """
        INSERT INTO crimes 
        (crime_id, crime_type, description, occurrence_date, latitude, longitude, location_description, arrested, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """
        crime_id = f"C{random.randint(200000, 999999)}"
        values = (
            crime_id, data['type'], data['description'], 
            data['date'], data['lat'], data['lng'],
            data['location'], 0, 'Open'
        )
        cursor.execute(query, values)
        connection.commit()
        return jsonify({"status": "success", "crime_id": crime_id}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        connection.close()

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({"status": "healthy", "service": "crime-analysis-api", "database": "sqlite"}), 200

@app.route('/api/crimes', methods=['GET'])
def get_crimes():
    connection = get_db_connection()
    if not connection:
        return jsonify({"error": "Database connection failed"}), 500
    
    try:
        query = "SELECT * FROM crimes LIMIT 100"
        df = pd.read_sql(query, connection)
        crimes = df.to_dict(orient='records')
        return jsonify({"crimes": crimes, "count": len(crimes)}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        connection.close()

@app.route('/api/hotspots', methods=['GET'])
def get_hotspots():
    model = HotspotModel(n_clusters=10)
    centers = model.get_hotspots()
    if centers is not None:
        hotspots = [{"lat": float(c[0]), "lng": float(c[1])} for c in centers]
        return jsonify({"hotspots": hotspots}), 200
    return jsonify({"error": "Could not generate hotspots"}), 500

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)
