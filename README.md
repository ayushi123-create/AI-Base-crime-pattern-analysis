# AI-Powered Crime Pattern Analysis

A final year project that uses Machine Learning to analyze and predict crime patterns, visualized through an interactive web dashboard.

## 🌟 Features
- **Interactive Map**: Visualize crime hotspots using Leaflet.js.
- **Data Analytics**: Charts and statistics for crime types and trends.
- **AI Hotspot Detection**: K-Means clustering to identify high-risk areas.
- **MySQL Integration**: Persistent storage for large-scale crime data.
- **Modern UI**: Sleek, premium dark-mode dashboard.

## 🛠️ Tech Stack
- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Backend**: Python (Flask), MySQL
- **Machine Learning**: Scikit-Learn, Pandas
- **Visualization**: Leaflet.js, Chart.js

## 🚀 Quick Start
1. Install requirements: `pip install -r requirements.txt`
2. Set up MySQL database `crime_db`.
3. Configure `.env` with your DB credentials.
4. Seed data: `python scripts/load_data.py`
5. Run app: `python app.py`

## 📁 Project Structure
- `backend/`: API logic, ML models, and DB services.
- `frontend/`: UI templates and static assets (CSS/JS).
- `scripts/`: Data loading and preprocessing scripts.
- `models/`: Saved machine learning models.
- `data/`: Raw and processed datasets.
