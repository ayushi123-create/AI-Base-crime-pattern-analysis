import pandas as pd
from sklearn.cluster import KMeans
import joblib
import os
from backend.app.services.database import get_db_connection

class HotspotModel:
    def __init__(self, n_clusters=5):
        self.n_clusters = n_clusters
        self.model = KMeans(n_clusters=self.n_clusters, random_state=42)
        self.model_path = 'models/hotspot_model.joblib'

    def train_from_db(self):
        connection = get_db_connection()
        if not connection:
            print("Failed to connect to database for training.")
            return
        
        try:
            query = "SELECT latitude, longitude FROM crimes WHERE latitude IS NOT NULL AND longitude IS NOT NULL"
            df = pd.read_sql(query, connection)
            
            if len(df) < self.n_clusters:
                print("Not enough data to train clusters.")
                return
            
            # Train model
            self.model.fit(df[['latitude', 'longitude']])
            
            # Save model
            os.makedirs('models', exist_ok=True)
            joblib.dump(self.model, self.model_path)
            print(f"Hotspot model trained and saved to {self.model_path}")
            
            return self.model.cluster_centers_
        except Exception as e:
            print(f"Error training hotspot model: {e}")
        finally:
            connection.close()

    def get_hotspots(self):
        if os.path.exists(self.model_path):
            self.model = joblib.load(self.model_path)
            return self.model.cluster_centers_
        else:
            return self.train_from_db()

if __name__ == "__main__":
    model = HotspotModel(n_clusters=10)
    centers = model.train_from_db()
    if centers is not None:
        print("Hotspot Centers:")
        print(centers)
