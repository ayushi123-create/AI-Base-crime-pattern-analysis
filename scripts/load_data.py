import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import random
from backend.app.services.database import get_db_connection

def generate_sample_data(num_records=100):
    crime_types = ['THEFT', 'ROBBERY', 'BURGLARY', 'ASSAULT', 'CYBER CRIME', 'FRAUD', 'PROPERTY DAMAGE']
    locations = [
        (28.6139, 77.2090), # Delhi
        (19.0760, 72.8777), # Mumbai
        (12.9716, 77.5946), # Bangalore
        (13.0827, 80.2707), # Chennai
        (22.5726, 88.3639)  # Kolkata
    ]
    
    data = []
    start_date = datetime.now() - timedelta(days=365)
    
    for i in range(num_records):
        loc = random.choice(locations)
        lat = loc[0] + random.uniform(-0.05, 0.05)
        lng = loc[1] + random.uniform(-0.05, 0.05)
        
        crime = {
            'crime_id': f'C{100000 + i}',
            'crime_type': random.choice(crime_types),
            'description': 'Sample crime description for testing.',
            'occurrence_date': (start_date + timedelta(days=random.randint(0, 365))).strftime('%Y-%m-%d %H:%M:%S'),
            'latitude': lat,
            'longitude': lng,
            'location_description': 'STREET',
            'arrest': random.choice([True, False]),
            'domestic': random.choice([True, False]),
            'district': random.randint(1, 25),
            'ward': random.randint(1, 50),
            'community_area': random.randint(1, 77)
        }
        data.append(crime)
    
    return data

def insert_to_mysql(data):
    connection = get_db_connection()
    if not connection:
        return
    
    cursor = connection.cursor()
    query = """
    INSERT INTO crimes 
    (crime_id, crime_type, description, occurrence_date, latitude, longitude, location_description, arrested, domestic, district, ward, community_area)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """
    
    try:
        for crime in data:
            values = (
                crime['crime_id'], crime['crime_type'], crime['description'], 
                crime['occurrence_date'], crime['latitude'], crime['longitude'],
                crime['location_description'], int(crime['arrest']), int(crime['domestic']),
                crime['district'], crime['ward'], crime['community_area']
            )
            cursor.execute(query, values)
        
        connection.commit()
        print(f"Successfully inserted {len(data)} records.")
    except Exception as e:
        print(f"Error inserting data: {e}")
    finally:
        cursor.close()
        connection.close()

if __name__ == "__main__":
    from backend.app.services.database import init_db
    print("Initializing database...")
    init_db()
    print("Generating sample crime data...")
    sample_data = generate_sample_data(200)
    print("Inserting data into MySQL...")
    insert_to_mysql(sample_data)
