from sqlalchemy import Column, Integer, Float, String, DateTime, Boolean, Text, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .database import Base

class SensorReading(Base):
    __tablename__ = "sensor_readings"
    
    id = Column(Integer, primary_key=True, index=True)
    water_level = Column(Float, nullable=False)  # 0-100%
    flow_rate = Column(Float, nullable=False)    # L/min
    turbidity = Column(Float, nullable=False)    # 0-100% clarity
    vibration_status = Column(String(10), nullable=False)  # 'low' or 'high'
    soil_moisture = Column(Float, nullable=False)  # 0-100%
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    alerts = relationship("Alert", back_populates="sensor_reading")
    
    def to_dict(self):
        return {
            "id": self.id,
            "water_level": self.water_level,
            "flow_rate": self.flow_rate,
            "turbidity": self.turbidity,
            "vibration_status": self.vibration_status,
            "soil_moisture": self.soil_moisture,
            "timestamp": self.timestamp
        }

class SensorData(Base):
    __tablename__ = "sensor_data_summary"
    
    id = Column(Integer, primary_key=True, index=True)
    health_score = Column(Float, nullable=False)
    health_status = Column(String(20), nullable=False)  # 'normal', 'warning', 'critical'
    health_message = Column(String(200), nullable=False)
    last_reading_id = Column(Integer, ForeignKey("sensor_readings.id"), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    last_reading = relationship("SensorReading")

class IrrigationControl(Base):
    __tablename__ = "irrigation_control"
    
    id = Column(Integer, primary_key=True, index=True)
    mode = Column(String(20), nullable=False)  # 'normal', 'survival', 'manual', 'off'
    is_irrigating = Column(Boolean, default=False)
    auto_mode = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

class IrrigationSession(Base):
    __tablename__ = "irrigation_sessions"
    
    id = Column(Integer, primary_key=True, index=True)
    mode = Column(String(20), nullable=False)  # 'normal', 'survival', 'manual'
    started_at = Column(DateTime(timezone=True), server_default=func.now())
    ended_at = Column(DateTime(timezone=True), nullable=True)
    duration_minutes = Column(Integer, nullable=True)  # Calculated when session ends
    estimated_volume_liters = Column(Float, nullable=True)  # Estimated water volume used
    trigger_reason = Column(Text, nullable=True)  # Why this session started
    sensor_reading_id = Column(Integer, ForeignKey("sensor_readings.id"), nullable=True)
    
    # Relationships
    sensor_reading = relationship("SensorReading")
    alerts = relationship("Alert", back_populates="irrigation_session")
    
    def to_dict(self):
        return {
            "id": self.id,
            "mode": self.mode,
            "started_at": self.started_at,
            "ended_at": self.ended_at,
            "duration_minutes": self.duration_minutes,
            "estimated_volume_liters": self.estimated_volume_liters,
            "trigger_reason": self.trigger_reason,
            "sensor_reading_id": self.sensor_reading_id
        }

class Alert(Base):
    __tablename__ = "alerts"
    
    id = Column(Integer, primary_key=True, index=True)
    alert_type = Column(String(20), nullable=False)  # 'critical', 'warning', 'info'
    message = Column(Text, nullable=False)
    is_dismissed = Column(Boolean, default=False)
    sensor_reading_id = Column(Integer, ForeignKey("sensor_readings.id"), nullable=True)
    irrigation_session_id = Column(Integer, ForeignKey("irrigation_sessions.id"), nullable=True)  # Link to irrigation session if applicable
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    dismissed_at = Column(DateTime(timezone=True), nullable=True)
    
    # Relationships
    sensor_reading = relationship("SensorReading", back_populates="alerts")
    irrigation_session = relationship("IrrigationSession", back_populates="alerts")
    
    def to_dict(self):
        return {
            "id": self.id,
            "alert_type": self.alert_type,
            "message": self.message,
            "is_dismissed": self.is_dismissed,
            "sensor_reading_id": self.sensor_reading_id,
            "irrigation_session_id": self.irrigation_session_id,
            "created_at": self.created_at,
            "dismissed_at": self.dismissed_at
        }

class Settings(Base):
    __tablename__ = "settings"
    
    id = Column(Integer, primary_key=True, index=True)
    
    # Farm Settings
    farm_name = Column(String(100), default="My Farm")
    borewell_depth = Column(Float, default=150.0)
    crop_type = Column(String(50), default="sugarcane")
    location = Column(String(100), default="Tamil Nadu")
    
    # Notification Settings
    critical_alert = Column(Boolean, default=True)
    warning_alert = Column(Boolean, default=True)
    sms_alert = Column(Boolean, default=False)
    push_enabled = Column(Boolean, default=True)
    
    # Thresholds
    dry_level = Column(Float, default=40.0)
    optimal_level = Column(Float, default=65.0)
    
    # Pi Settings
    pi_ip = Column(String(50), default="192.168.1.100")
    pi_port = Column(Integer, default=8000)
    
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    def to_dict(self):
        return {
            "id": self.id,
            "farm_name": self.farm_name,
            "borewell_depth": self.borewell_depth,
            "crop_type": self.crop_type,
            "location": self.location,
            "critical_alert": self.critical_alert,
            "warning_alert": self.warning_alert,
            "sms_alert": self.sms_alert,
            "push_enabled": self.push_enabled,
            "dry_level": self.dry_level,
            "optimal_level": self.optimal_level,
            "pi_ip": self.pi_ip,
            "pi_port": self.pi_port,
            "updated_at": self.updated_at
        }