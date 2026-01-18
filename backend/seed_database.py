"""
Database Seeding Script for RootGuard Bot
Generates realistic mock data for sensors, irrigation sessions, and alerts
"""

from models.database import SessionLocal, engine, Base
from models.sensor import SensorReading, IrrigationControl, IrrigationSession, Alert
from datetime import datetime, timedelta
import random
import math

def clear_database():
    """Clear all existing data"""
    db = SessionLocal()
    try:
        db.query(Alert).delete()
        db.query(IrrigationSession).delete()
        db.query(IrrigationControl).delete()
        db.query(SensorReading).delete()
        db.commit()
        print("✓ Database cleared")
    finally:
        db.close()

def seed_sensor_readings(db, num_readings=150):
    """Generate realistic sensor readings over the past 7 days"""
    print(f"Generating {num_readings} sensor readings...")
    
    # Start from 7 days ago
    start_time = datetime.utcnow() - timedelta(days=7)
    time_increment = timedelta(minutes=5)  # Reading every 5 minutes
    
    # Initial values
    water_level = 75.0
    flow_rate = 12.0
    turbidity = 85.0
    soil_moisture = 55.0
    
    readings = []
    for i in range(num_readings):
        timestamp = start_time + (time_increment * i)
        
        # Simulate realistic patterns
        hour = timestamp.hour
        
        # Water level: decreases during day, increases after irrigation
        water_level += random.uniform(-2, 1)
        water_level = max(15, min(95, water_level))
        
        # Flow rate: varies based on irrigation activity
        if random.random() < 0.1:  # 10% chance of irrigation
            flow_rate = random.uniform(10, 18)
        else:
            flow_rate = random.uniform(0, 3)
        
        # Turbidity: generally high, occasional dips
        turbidity += random.uniform(-3, 2)
        turbidity = max(40, min(98, turbidity))
        
        # Soil moisture: decreases during day (6am-6pm), increases after irrigation
        if 6 <= hour <= 18:
            soil_moisture += random.uniform(-4, 1)  # Drying during day
        else:
            soil_moisture += random.uniform(-1, 2)  # Stable at night
        
        # If irrigation is happening, increase soil moisture
        if flow_rate > 5:
            soil_moisture += random.uniform(3, 8)
        
        soil_moisture = max(20, min(85, soil_moisture))
        
        # Vibration: mostly low, occasionally high
        vibration_status = "high" if random.random() < 0.03 else "low"
        
        reading = SensorReading(
            water_level=round(water_level, 1),
            flow_rate=round(flow_rate, 1),
            turbidity=round(turbidity, 1),
            vibration_status=vibration_status,
            soil_moisture=round(soil_moisture, 1),
            timestamp=timestamp
        )
        readings.append(reading)
    
    db.bulk_save_objects(readings)
    db.commit()
    print(f"✓ Created {num_readings} sensor readings")
    return readings

def seed_irrigation_sessions(db, sensor_readings):
    """Generate irrigation sessions based on sensor data"""
    print("Generating irrigation sessions...")
    
    sessions = []
    modes = ['normal', 'survival', 'manual']
    
    # Create 20-30 irrigation sessions over the past week
    num_sessions = random.randint(20, 30)
    
    for i in range(num_sessions):
        mode = random.choice(modes)
        
        # Random start time in the past week
        days_ago = random.uniform(0, 7)
        started_at = datetime.utcnow() - timedelta(days=days_ago)
        
        # Duration varies by mode
        if mode == 'survival':
            duration = random.randint(3, 8)  # Shorter in survival mode
        elif mode == 'manual':
            duration = random.randint(5, 15)
        else:  # normal
            duration = random.randint(8, 20)
        
        ended_at = started_at + timedelta(minutes=duration)
        
        # Calculate estimated volume (flow rate * duration)
        avg_flow_rate = random.uniform(10, 15)
        estimated_volume = round(avg_flow_rate * duration, 1)
        
        # Trigger reason
        if mode == 'survival':
            trigger_reason = "Low water level - Survival mode activated"
        elif mode == 'manual':
            trigger_reason = "Manual irrigation started by user"
        else:
            trigger_reason = f"Auto irrigation - Soil moisture below threshold"
        
        session = IrrigationSession(
            mode=mode,
            started_at=started_at,
            ended_at=ended_at,
            duration_minutes=duration,
            estimated_volume_liters=estimated_volume,
            trigger_reason=trigger_reason,
            sensor_reading_id=random.choice(sensor_readings).id if sensor_readings else None
        )
        sessions.append(session)
    
    db.bulk_save_objects(sessions)
    db.commit()
    print(f"✓ Created {len(sessions)} irrigation sessions")
    return sessions

def seed_alerts(db, sensor_readings):
    """Generate alerts based on sensor conditions"""
    print("Generating alerts...")
    
    alerts = []
    alert_types = ['critical', 'warning', 'info']
    
    # Create alerts based on sensor readings
    for reading in random.sample(sensor_readings, min(30, len(sensor_readings))):
        alert_messages = []
        
        # Critical water level
        if reading.water_level < 25:
            alert_messages.append({
                'type': 'critical',
                'message': f'Critical water level: {reading.water_level}%'
            })
        elif reading.water_level < 40:
            alert_messages.append({
                'type': 'warning',
                'message': f'Low water level: {reading.water_level}%'
            })
        
        # Turbidity issues
        if reading.turbidity < 60:
            alert_messages.append({
                'type': 'warning',
                'message': f'Poor water quality: {reading.turbidity}% clarity'
            })
        
        # High vibration
        if reading.vibration_status == 'high':
            alert_messages.append({
                'type': 'critical',
                'message': 'High vibration detected - Check pump motor'
            })
        
        # Low soil moisture
        if reading.soil_moisture < 30:
            alert_messages.append({
                'type': 'info',
                'message': f'Low soil moisture: {reading.soil_moisture}% - Irrigation recommended'
            })
        
        # High soil moisture (over-irrigation)
        if reading.soil_moisture > 75:
            alert_messages.append({
                'type': 'info',
                'message': f'High soil moisture: {reading.soil_moisture}% - Optimal hydration'
            })
        
        # Create alerts
        for alert_msg in alert_messages:
            # Some alerts are dismissed (70% dismissed for older ones)
            is_dismissed = random.random() < 0.7 if (datetime.utcnow() - reading.timestamp).days > 2 else random.random() < 0.3
            
            alert = Alert(
                alert_type=alert_msg['type'],
                message=alert_msg['message'],
                is_dismissed=is_dismissed,
                sensor_reading_id=reading.id,
                created_at=reading.timestamp,
                dismissed_at=reading.timestamp + timedelta(hours=random.randint(1, 12)) if is_dismissed else None
            )
            alerts.append(alert)
    
    db.bulk_save_objects(alerts)
    db.commit()
    print(f"✓ Created {len(alerts)} alerts")
    return alerts

def seed_irrigation_control(db):
    """Set up irrigation control state"""
    print("Setting up irrigation control...")
    
    control = IrrigationControl(
        mode='normal',
        is_irrigating=False,
        auto_mode=True
    )
    db.add(control)
    db.commit()
    print("✓ Irrigation control initialized")
    return control

def main():
    """Main seeding function"""
    print("\n" + "="*50)
    print("RootGuard Bot - Database Seeding")
    print("="*50 + "\n")
    
    # Create tables if they don't exist
    Base.metadata.create_all(bind=engine)
    
    # Clear existing data
    clear_database()
    
    # Create database session
    db = SessionLocal()
    
    try:
        # Seed data in order
        sensor_readings = seed_sensor_readings(db, num_readings=150)
        irrigation_sessions = seed_irrigation_sessions(db, sensor_readings)
        alerts = seed_alerts(db, sensor_readings)
        irrigation_control = seed_irrigation_control(db)
        
        # Print summary
        print("\n" + "="*50)
        print("Seeding Complete!")
        print("="*50)
        print(f"Sensor Readings: {len(sensor_readings)}")
        print(f"Irrigation Sessions: {len(irrigation_sessions)}")
        print(f"Alerts: {len(alerts)}")
        print(f"Active Alerts: {sum(1 for a in alerts if not a.is_dismissed)}")
        print("="*50 + "\n")
        
    except Exception as e:
        print(f"\n❌ Error during seeding: {e}")
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    main()
