CREATE DATABASE IF NOT EXISTS crime_db;
USE crime_db;

CREATE TABLE IF NOT EXISTS crimes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    crime_id VARCHAR(50) UNIQUE,
    crime_type VARCHAR(100) NOT NULL,
    description TEXT,
    occurrence_date DATETIME,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    location_description VARCHAR(255),
    arrestED BOOLEAN DEFAULT FALSE,
    domestic BOOLEAN DEFAULT FALSE,
    district INT,
    ward INT,
    community_area INT,
    updated_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS users (
    user_id INTEGER PRIMARY KEY AUTOINCREMENT,
    username VARCHAR(50) UNIQUE,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(15),
    password VARCHAR(255) NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('admin', 'officer')),
    station VARCHAR(100),
    badge_number VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
