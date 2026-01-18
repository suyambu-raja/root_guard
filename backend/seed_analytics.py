import asyncio
from datetime import datetime, timedelta
import random
import json
from sqlalchemy.orm import Session
from models.database import SessionLocal, engine, Base
from models.sensor import SensorReading, IrrigationSession, Alert, IrrigationControl

def seed_data():
    db = SessionLocal()
    try:
        print("Seeding database with historical data...")
        
        # Clear existing data to avoid duplicates if re-run (optional, be careful)
        # db.query(SensorReading).delete()
        # db.query(IrrigationSession).delete()
        
        # 1. Ensure IrrigationControl exists
        control = db.query(IrrigationControl).first()
        if not control:
            control = IrrigationControl(mode="normal", auto_mode=True, is_irrigating=False)
            db.add(control)
        
        end_date = datetime.utcnow()
        start_date = end_date - timedelta(days=7)
        
        current_time = start_date
        
        print("Generating 7 days of sensor readings and sessions...")
        
        while current_time <= end_date:
            # Generate Sensor Readings (every hour)
            is_daytime = 6 <= current_time.hour <= 18
            
            # Simulate realistic values
            soil_moisture = random.uniform(30, 80)
            if not is_daytime:
                soil_moisture += 5 # moister at night usually
                
            water_level = random.uniform(40, 95)
            
            reading = SensorReading(
                water_level=water_level,
                flow_rate=random.uniform(0, 5) if random.random() > 0.8 else 0, # Occasional flow
                turbidity=random.uniform(0, 10), # Clear water
                vibration_status="low",
                soil_moisture=soil_moisture,
                timestamp=current_time
            )
            db.add(reading)
            db.flush() # Get ID
            
            # Simulate Irrigation Sessions (mostly when soil is dry)
            if soil_moisture < 40 and is_daytime and random.random() > 0.3:
                duration = random.randint(15, 45)
                volume = duration * 15 # ~15L/min
                
                session_end = current_time + timedelta(minutes=duration)
                
                session = IrrigationSession(
                    mode="normal" if random.random() > 0.2 else "manual",
                    started_at=current_time,
                    ended_at=session_end,
                    duration_minutes=duration,
                    estimated_volume_liters=volume,
                    trigger_reason="Low soil moisture" if soil_moisture < 40 else "Manual testing",
                    sensor_reading_id=reading.id
                )
                db.add(session)
                
                # Maybe add an alert
                if random.random() > 0.9:
                    alert = Alert(
                        alert_type="info",
                        message=json.dumps({
                            "key": "alert_auto_irrigation_started", 
                            "params": {
                                "reason_key": "reason_low_moisture", 
                                "reason_params": {"moisture": int(soil_moisture)}
                            }
                        }),
                        created_at=current_time,
                        is_dismissed=True,
                        sensor_reading_id=reading.id,
                        irrigation_session_id=session.id
                    )
                    db.add(alert)
            
            current_time += timedelta(hours=1)
            
        db.commit()
        print("✅ Database seeded successfully!")
        
    except Exception as e:
        print(f"❌ Error seeding data: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_data()
