from sqlalchemy.orm import Session
from sqlalchemy import desc, and_
from models.database import SessionLocal
from models.sensor import SensorReading, SensorData, Alert
from schemas.sensor_schemas import SensorDataResponse, HealthScoreResponse, AlertResponse, AlertCreate
from datetime import datetime, timedelta
import random
import math
import json
from typing import Optional, List

class SensorService:
    def __init__(self, db: Session):
        self.db = db
    
    async def generate_sensor_reading(self) -> SensorReading:
        """Generate realistic sensor data with variations"""
        
        # Get last reading for smooth transitions
        last_reading = self.db.query(SensorReading).order_by(desc(SensorReading.timestamp)).first()
        
        if last_reading:
            # Create realistic variations based on previous reading
            water_level = self._vary_value(last_reading.water_level, 2.0, 0, 100)
            flow_rate = self._vary_value(last_reading.flow_rate, 1.0, 0, 20)
            turbidity = self._vary_value(last_reading.turbidity, 1.5, 0, 100)
            soil_moisture = self._vary_value(last_reading.soil_moisture, 3.0, 0, 100)
        else:
            # Initial values
            water_level = random.uniform(60, 80)
            flow_rate = random.uniform(8, 15)
            turbidity = random.uniform(75, 95)
            soil_moisture = random.uniform(35, 55)
        
        # Vibration is usually low, occasionally high
        vibration_status = "high" if random.random() < 0.05 else "low"
        
        # Create new reading
        new_reading = SensorReading(
            water_level=round(water_level, 1),
            flow_rate=round(flow_rate, 1),
            turbidity=round(turbidity, 1),
            vibration_status=vibration_status,
            soil_moisture=round(soil_moisture, 1),
            timestamp=datetime.utcnow()
        )
        
        self.db.add(new_reading)
        self.db.commit()
        self.db.refresh(new_reading)
        
        # Update health score
        await self._update_health_score(new_reading)
        
        return new_reading
    
    def _vary_value(self, current: float, max_change: float, min_val: float, max_val: float) -> float:
        """Create realistic value variations"""
        change = random.uniform(-max_change, max_change)
        new_value = current + change
        return max(min_val, min(max_val, new_value))
    
    async def _update_health_score(self, reading: SensorReading):
        """Calculate and store health score based on sensor reading"""
        
        # Health score calculation weights
        water_score = reading.water_level * 0.25
        turbidity_score = reading.turbidity * 0.25
        vibration_score = (100 if reading.vibration_status == "low" else 30) * 0.25
        flow_score = min((reading.flow_rate / 15) * 100, 100) * 0.25
        
        total_score = water_score + turbidity_score + vibration_score + flow_score
        
        # Determine status and message
        if total_score >= 80:
            status = "normal"
            message = "System operating normally"
        elif total_score >= 50:
            status = "warning"
            message = "Maintenance recommended soon"
        else:
            status = "critical"
            message = "Critical - Immediate attention required"
        
        # Store or update health data
        health_data = self.db.query(SensorData).first()
        if health_data:
            health_data.health_score = round(total_score)
            health_data.health_status = status
            health_data.health_message = message
            health_data.last_reading_id = reading.id
            health_data.updated_at = datetime.utcnow()
        else:
            health_data = SensorData(
                health_score=round(total_score),
                health_status=status,
                health_message=message,
                last_reading_id=reading.id
            )
            self.db.add(health_data)
        
        self.db.commit()
    
    async def get_latest_reading(self) -> Optional[SensorDataResponse]:
        """Get the most recent sensor reading"""
        reading = self.db.query(SensorReading).order_by(desc(SensorReading.timestamp)).first()
        if reading:
            return SensorDataResponse(
                water_level=reading.water_level,
                flow_rate=reading.flow_rate,
                turbidity=reading.turbidity,
                vibration_status=reading.vibration_status,
                soil_moisture=reading.soil_moisture,
                timestamp=reading.timestamp
            )
        return None
    
    async def get_reading_history(self, limit: int = 100) -> List[SensorDataResponse]:
        """Get historical sensor readings"""
        readings = self.db.query(SensorReading).order_by(desc(SensorReading.timestamp)).limit(limit).all()
        return [
            SensorDataResponse(
                water_level=r.water_level,
                flow_rate=r.flow_rate,
                turbidity=r.turbidity,
                vibration_status=r.vibration_status,
                soil_moisture=r.soil_moisture,
                timestamp=r.timestamp
            ) for r in readings
        ]
    
    async def calculate_health_score(self) -> Optional[HealthScoreResponse]:
        """Get current health score"""
        health_data = self.db.query(SensorData).first()
        if health_data:
            return HealthScoreResponse(
                score=int(health_data.health_score),
                status=health_data.health_status,
                message=health_data.health_message
            )
        return None
    
    async def check_and_create_alerts(self, reading: SensorReading):
        """Check sensor reading and create alerts if needed"""
        alerts_to_create = []
        
        # Critical water level
        if reading.water_level < 20:
            alerts_to_create.append(AlertCreate(
                alert_type="critical",
                message=json.dumps({"key": "alert_critical_water", "params": {"level": reading.water_level}}),
                sensor_reading_id=reading.id
            ))
        elif reading.water_level < 35:
            alerts_to_create.append(AlertCreate(
                alert_type="warning",
                message=json.dumps({"key": "alert_low_water", "params": {"level": reading.water_level}}),
                sensor_reading_id=reading.id
            ))
        
        # Turbidity issues
        if reading.turbidity < 50:
            alerts_to_create.append(AlertCreate(
                alert_type="warning",
                message=json.dumps({"key": "alert_poor_water", "params": {"turbidity": reading.turbidity}}),
                sensor_reading_id=reading.id
            ))
        
        # High vibration
        if reading.vibration_status == "high":
            alerts_to_create.append(AlertCreate(
                alert_type="critical",
                message=json.dumps({"key": "alert_high_vibration", "params": {}}),
                sensor_reading_id=reading.id
            ))
        
        # Low soil moisture
        if reading.soil_moisture < 25:
            alerts_to_create.append(AlertCreate(
                alert_type="info",
                message=json.dumps({"key": "alert_low_moisture", "params": {"moisture": reading.soil_moisture}}),
                sensor_reading_id=reading.id
            ))
        
        # Create alerts
        for alert_data in alerts_to_create:
            # Check if similar alert exists in last 10 minutes
            recent_similar = self.db.query(Alert).filter(
                and_(
                    Alert.message == alert_data.message,
                    Alert.created_at > datetime.utcnow() - timedelta(minutes=10),
                    Alert.is_dismissed == False
                )
            ).first()
            
            if not recent_similar:
                new_alert = Alert(
                    alert_type=alert_data.alert_type,
                    message=alert_data.message,
                    sensor_reading_id=alert_data.sensor_reading_id
                )
                self.db.add(new_alert)
        
        self.db.commit()
    
    async def get_active_alerts(self, limit: int = 10) -> List[AlertResponse]:
        """Get active (non-dismissed) alerts"""
        alerts = self.db.query(Alert).filter(
            Alert.is_dismissed == False
        ).order_by(desc(Alert.created_at)).limit(limit).all()
        
        return [
            AlertResponse(
                id=alert.id,
                alert_type=alert.alert_type,
                message=alert.message,
                created_at=alert.created_at,
                is_dismissed=alert.is_dismissed
            ) for alert in alerts
        ]
    
    async def dismiss_alert(self, alert_id: int) -> bool:
        """Dismiss a specific alert"""
        alert = self.db.query(Alert).filter(Alert.id == alert_id).first()
        if alert:
            alert.is_dismissed = True
            alert.dismissed_at = datetime.utcnow()
            self.db.commit()
            return True
        return False