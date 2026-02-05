# AI-Based Crime Pattern Analysis & Prediction System 🛡️

**Project Domain:** Data Science & Web Development (BCA Hons Final Year Project)  
**Developer Details:** Ayushi (Final Year Student)

---

## 📌 Project Overview
This undergraduate project is a comprehensive Law Enforcement Dashboard designed to help police departments centralize crime data, visualize hotspots, and use predictive analytics to improve public safety. It combines modern web technologies with AI-driven concepts to provide a "command-center" experience.

## 🚀 Key Features (The "WOW" Factors)
This system includes several professional-grade modules designed to impress examiners:

1.  **🔮 AI Safety Score Predictor**: Calculates a **Safety Index (1.0 - 10.0)** for any location in India based on historical data density using a mock-clustering algorithm.
2.  **🚨 Emergency SOS Panic System**: A high-visibility, pulsing alert system for simulated rapid police dispatch.
3.  **🌙 Night Watch Stealth Mode**: A tactical, high-contrast UI (Amber/Black theme) designed for field officers working at night.
4.  **📥 Professional Data Export**: One-click download of all crime records into a **CSV/Excel** file for auditing.
5.  **📡 Live Dispatch Feed**: An automated, scrolling feed on the dashboard showing real-time mock incident updates.
6.  **🗺️ Interactive Mapping**: Uses **Leaflet.js** to map every crime record with custom-styled markers and heatmaps.

---

## 🛠️ Technical Stack (Local & Secure)
This project is built using a **100% Local Stack** to ensure data privacy and ease of deployment without external cloud costs.

| Component | Technology Used |
| :--- | :--- |
| **Frontend** | HTML5, Vanilla CSS3 (Custom Design), JavaScript (ES6+) |
| **Backend** | Python 3.x, Flask (Micro-framework) |
| **Database** | SQLite 3 (Default) / MySQL Compatible |
| **Visualization** | Leaflet.js (Maps), Chart.js (Analytics) |
| **Design** | Premium Dark Mode with Glassmorphism effects |

---

## 📂 Project Structure
```text
├── app.py                # Main Flask Application (Routes & Logic)
├── schema.sql           # Database Table Definitions
├── backend/
│   └── app/services/    # Database connection & initialization
├── frontend/
│   ├── templates/       # HTML Pages (index.html, register.html)
│   └── static/          # CSS, JS, and Images
├── scripts/             # Data loading & mock generation tools
└── crime_data.db        # Local SQLite Database file
```

---

## 👨‍🏫 Examiner's Q&A (How to explain to your Professor)

**Q1: Why use Python/Flask?**  
*Answer:* Flask is lightweight and perfect for building secure REST APIs. Python is the industry standard for Data Science and AI, making it the best choice for a crime analysis project.

**Q2: How does the AI Prediction work?**  
*Answer:* The system analyzes the "Density" of crimes in a specific region. Higher density results in a lower Safety Score. In a real-world scenario, this would be replaced with a trained K-Means or Random Forest model.

**Q3: Is the data secure?**  
*Answer:* Yes. All data is stored in a local SQLite database with unique IDs for every record. Only authorized officers can access the Administrative and Reporting features.

**Q4: What is the benefit of "Night Watch Mode"?**  
*Answer:* It's a UX (User Experience) feature. Blue light from screens can hinder night vision; our tactical amber theme protects an officer's eyes during night patrols.

---

## ⚙️ How to Run the Project
1.  **Install Requirements**: `pip install -r requirements.txt`
2.  **Initialize Database**: `python scripts/load_data.py`
3.  **Run Server**: `python app.py`
4.  **Access App**: Open `http://localhost:5000` in your browser.

---

**© 2026 Ayushi - Final Year BCA Project**
