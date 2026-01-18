from sqlalchemy.orm import Session
from sqlalchemy import desc
from models.database import SessionLocal
from models.sensor import IrrigationControl, SensorReading, Alert, IrrigationSession
from schemas.sensor_schemas import IrrigationControlRequest, IrrigationStatusResponse, IrrigationSessionResponse
from datetime import datetime
import json
from typing import Optional, List

class IrrigationService:
    def __init__(self, db: Session):
        self.db = db
    
    async def get_current_status(self) -> IrrigationStatusResponse:
        """Get current irrigation system status"""
        control = self.db.query(IrrigationControl).order_by(desc(IrrigationControl.updated_at)).first()
        
        if not control:
            # Create default control settings
            control = IrrigationControl(
                mode="normal",
                is_irrigating=False,
                auto_mode=True
            )
            self.db.add(control)
            self.db.commit()
            self.db.refresh(control)
        
        return IrrigationStatusResponse(
            mode=control.mode,
            is_irrigating=control.is_irrigating,
            auto_mode=control.auto_mode,
            last_updated=control.updated_at
        )
    
    async def update_control(self, request: IrrigationControlRequest) -> IrrigationStatusResponse:
        """Update irrigation control settings"""
        control = self.db.query(IrrigationControl).order_by(desc(IrrigationControl.updated_at)).first()
        
        if not control:
            control = IrrigationControl(
                mode="normal",
                is_irrigating=False,
                auto_mode=True
            )
            self.db.add(control)
        
        # Track irrigation status changes for session management
        was_irrigating = control.is_irrigating
        new_irrigating = request.is_irrigating if request.is_irrigating is not None else control.is_irrigating
        
        # Update fields if provided
        if request.mode is not None:
            control.mode = request.mode
            # Auto-stop irrigation if mode is set to 'off'
            if request.mode == "off":
                control.is_irrigating = False
                new_irrigating = False
        
        if request.is_irrigating is not None:
            # Only allow irrigation if mode is not 'off'
            if control.mode != "off":
                control.is_irrigating = request.is_irrigating
                new_irrigating = request.is_irrigating
            else:
                control.is_irrigating = False
                new_irrigating = False
        
        if request.auto_mode is not None:
            control.auto_mode = request.auto_mode
        
        control.updated_at = datetime.utcnow()
        
        # Handle irrigation session tracking
        session_id = None
        if not was_irrigating and new_irrigating:
            # Starting irrigation - create new session
            session = IrrigationSession(
                mode=control.mode,
                trigger_reason="Manual start" if control.mode == "manual" else f"Auto start ({control.mode} mode)"
            )
            self.db.add(session)
            self.db.flush()  # Get the session ID
            session_id = session.id
        
        elif was_irrigating and not new_irrigating:
            # Stopping irrigation - end current session
            current_session = self.db.query(IrrigationSession).filter(
                IrrigationSession.ended_at.is_(None)
            ).order_by(desc(IrrigationSession.started_at)).first()
            
            if current_session:
                current_session.ended_at = datetime.utcnow()
                duration = (current_session.ended_at - current_session.started_at).total_seconds() / 60
                current_session.duration_minutes = int(duration)
                # Estimate water volume (rough calculation: 15L/min average flow)
                current_session.estimated_volume_liters = round(duration * 15, 1)
                session_id = current_session.id
        
        self.db.commit()
        self.db.refresh(control)
        
        # Create alerts with session linking
        if request.mode is not None:
            alert = Alert(
                alert_type="info",
                message=json.dumps({"key": "alert_mode_changed", "params": {"mode": control.mode.upper()}}),
                irrigation_session_id=session_id
            )
            self.db.add(alert)
        
        if request.is_irrigating is not None:
            status_text = "started" if control.is_irrigating else "stopped"
            alert = Alert(
                alert_type="info",
                message=json.dumps({"key": "alert_irrigation_status", "params": {"status": status_text, "mode": control.mode}}),
                irrigation_session_id=session_id
            )
            self.db.add(alert)
        
        self.db.commit()
        
        return IrrigationStatusResponse(
            mode=control.mode,
            is_irrigating=control.is_irrigating,
            auto_mode=control.auto_mode,
            last_updated=control.updated_at
        )
    
    async def get_irrigation_history(self, limit: int = 10) -> List[IrrigationSessionResponse]:
        """Get recent irrigation sessions"""
        sessions = self.db.query(IrrigationSession).order_by(
            desc(IrrigationSession.started_at)
        ).limit(limit).all()
        
        return [
            IrrigationSessionResponse(
                id=session.id,
                mode=session.mode,
                started_at=session.started_at,
                ended_at=session.ended_at,
                duration_minutes=session.duration_minutes,
                estimated_volume_liters=session.estimated_volume_liters,
                trigger_reason=session.trigger_reason
            ) for session in sessions
        ]
    
    async def check_auto_irrigation(self, sensor_reading: SensorReading):
        """Check if automatic irrigation should be triggered"""
        control = self.db.query(IrrigationControl).order_by(desc(IrrigationControl.updated_at)).first()
        
        if not control or not control.auto_mode or control.mode == "off":
            return
        
        should_irrigate = False
        reason = ""
        reason_key = ""
        reason_params = {}
        
        # Auto irrigation logic based on mode and sensor data
        if control.mode == "normal":
            # Normal mode: irrigate if soil moisture < 40% and water level > 30%
            if sensor_reading.soil_moisture < 40 and sensor_reading.water_level > 30:
                should_irrigate = True
                reason = f"Low soil moisture: {sensor_reading.soil_moisture}%"
                reason_key = "reason_low_moisture"
                reason_params = {"moisture": sensor_reading.soil_moisture}
        
        elif control.mode == "survival":
            # Survival mode: conserve water, only irrigate if critically low
            if sensor_reading.soil_moisture < 20 and sensor_reading.water_level > 50:
                should_irrigate = True
                reason = f"Critical soil moisture in survival mode: {sensor_reading.soil_moisture}%"
                reason_key = "reason_critical_moisture_survival"
                reason_params = {"moisture": sensor_reading.soil_moisture}
        
        # Don't irrigate if water level is too low
        if should_irrigate and sensor_reading.water_level < 25:
            should_irrigate = False
            # reason = f"Insufficient water level: {sensor_reading.water_level}%" 
            # Not needed as we just don't start
        
        # Don't irrigate if high vibration (pump issues)
        if should_irrigate and sensor_reading.vibration_status == "high":
            should_irrigate = False
            # reason = "High vibration detected - pump safety stop"
        
        # Update irrigation status if needed
        if should_irrigate and not control.is_irrigating:
            control.is_irrigating = True
            control.updated_at = datetime.utcnow()
            
            alert = Alert(
                alert_type="info",
                message=json.dumps({
                    "key": "alert_auto_irrigation_started", 
                    "params": {"reason_key": reason_key, "reason_params": reason_params}
                }),
                sensor_reading_id=sensor_reading.id
            )
            self.db.add(alert)
        
        elif not should_irrigate and control.is_irrigating and control.mode != "manual":
            # Stop irrigation if conditions no longer require it (except manual mode)
            if control.mode == "normal" and sensor_reading.soil_moisture > 60:
                control.is_irrigating = False
                control.updated_at = datetime.utcnow()
                
                alert = Alert(
                    alert_type="info",
                    message=json.dumps({
                        "key": "alert_auto_irrigation_stopped", 
                        "params": {
                            "reason_key": "reason_moisture_sufficient", 
                            "reason_params": {"moisture": sensor_reading.soil_moisture}
                        }
                    }),
                    sensor_reading_id=sensor_reading.id
                )
                self.db.add(alert)
            
            elif control.mode == "survival" and sensor_reading.soil_moisture > 35:
                control.is_irrigating = False
                control.updated_at = datetime.utcnow()
                
                alert = Alert(
                    alert_type="info",
                    message=json.dumps({
                        "key": "alert_survival_irrigation_stopped",
                         "params": {
                             "reason_key": "reason_target_reached", 
                             "reason_params": {"moisture": sensor_reading.soil_moisture}
                         }
                    }),
                    sensor_reading_id=sensor_reading.id
                )
                self.db.add(alert)
        
        # Auto-switch to survival mode if health score is critical
        if sensor_reading.water_level < 30 and control.mode == "normal":
            control.mode = "survival"
            control.updated_at = datetime.utcnow()
            
            alert = Alert(
                alert_type="critical",
                message=json.dumps({"key": "alert_survival_mode_switch", "params": {}}),
                sensor_reading_id=sensor_reading.id
            )
            self.db.add(alert)
        
        self.db.commit()