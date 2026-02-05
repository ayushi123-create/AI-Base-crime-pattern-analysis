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
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    role ENUM('ADMIN', 'ANALYST', 'VIEWER') DEFAULT 'VIEWER',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
