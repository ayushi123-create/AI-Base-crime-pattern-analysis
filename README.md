# AI-Powered Crime Pattern Analysis System 🛡️

A comprehensive web-based application designed for law enforcement agencies to analyze, predict, and visualize crime patterns using Machine Learning and Geospatial mapping.

## 🎓 For the External Examiner / Teacher
This project satisfies the requirements for a Final Year Project (BCA Hons.) by integrating:
- **Data Engineering**: Handling crime records and spatial data.
- **AI/ML Integration**: Using KMeans Clustering to identify geographic hotspots.
- **Full-Stack Development**: Flask (Backend), MySQL (Database), and modern HTML/CSS/JS (Frontend).
- **Interactive Visualization**: Leaflet.js maps and Chart.js analytics.

---

## 🛠️ Prerequisites & Installation

### 1. Software Needed
Before running the project, ensure you have the following installed:
- **Python 3.8+**
- **MySQL Server** (XAMPP or standalone MySQL Workbench)
- **Git** (for version control)

### 2. Database Setup
1. Open your MySQL client (e.g., PHPMyAdmin or MySQL Workbench).
2. Create a new database named `crime_db`.
3. Import the `schema.sql` file provided in the root directory to create the tables.
4. Update the `.env` file with your MySQL credentials:
   ```env
   MYSQL_HOST=localhost
   MYSQL_USER=root
   MYSQL_PASSWORD=your_password
   MYSQL_DATABASE=crime_db
   ```

### 3. Python Environment Setup
Open your terminal/command prompt in the project folder and run:
```bash
# Install all required libraries
pip install -r requirements.txt
```

---

## 🚀 How to Run the Project

### Step 1: Initialize Sample Data
If you want to see the dashboard with data immediately, run the script to generate 200+ sample Indian crime records:
```bash
python scripts/load_data.py
```

### Step 2: Start the Web Server
Run the Flask application:
```bash
python app.py
```

### Step 3: Access the Dashboard
Open your browser and go to:
**[http://localhost:5000](http://localhost:5000)**

---

## 📂 Project Structure (Where is What?)

- **`app.py`**: The "Brain" of the project. It handles all website routes and API connections.
- **`frontend/`**: Contains everything you see on the screen.
  - `templates/`: HTML files (Dashboard, Login, Register).
  - `static/css/`: Premium styling and dark-mode themes.
  - `static/js/main.js`: Handles interactivity, map rendering, and API calls.
- **`backend/app/services/`**: Contains the logic for connecting to the MySQL database.
- **`backend/app/models/`**: Contains the AI code for KMeans Hotspot detection.
- **`scripts/load_data.py`**: A helper tool to instantly populate your DB with data for your demo.
- **`schema.sql`**: The blueprint for your MySQL database.

---

## 🔮 Key Features to Explain to Your Teacher

1.  **Police Officer Registration**: Secure portal for law enforcement to create accounts.
2.  **Crime Data Entry**: A real-time form to submit incident type, location, and coordinates.
3.  **AI Predictive Analytics**: A specialized map that uses clustering algorithms to predict high-risk zones.
4.  **Geographic Heatmaps**: Visualizes density of crimes across different regions of India.
5.  **Dynamic Filtering**: The "Reports" section allows officers to filter through thousands of records by crime type instantly.

---

## 💡 AI/ML Model Detail
The system uses the **KMeans Clustering** algorithm from the `scikit-learn` library. It analyzes the `Latitude` and `Longitude` of every crime record to find clusters (areas with high crime density). These clusters are then pushed to the frontend and visualized as "Red Circles" on the Prediction Map to warn authorities.

---

### Developed By
- **Ayushi Shah** (Team Lead)
- **Zeel Sorathiya**
- **Devki Prajapati**

*Under the guidance of Prof. Neha Samsir & Ravi Ribadiya*
