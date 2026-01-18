from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, List, Literal

class SensorDataResponse(BaseModel):
    water_level: float = Field(..., ge=0, le=100, description="Water level percentage")
    flow_rate: float = Field(..., ge=0, description="Flow rate in L/min")
    turbidity: float = Field(..., ge=0, le=100, description="Water clarity percentage")
    vibration_status: Literal["low", "high"] = Field(..., description="Vibration status")
    soil_moisture: float = Field(..., ge=0, le=100, description="Soil moisture percentage")
    timestamp: datetime = Field(..., description="Reading timestamp")

    class Config:
        from_attributes = True

class HealthScoreResponse(BaseModel):
    score: int = Field(..., ge=0, le=100, description="Health score 0-100")
    status: Literal["normal", "warning", "critical"] = Field(..., description="Health status")
    message: str = Field(..., description="Health status message")

    class Config:
        from_attributes = True

class IrrigationControlRequest(BaseModel):
    mode: Optional[Literal["normal", "survival", "manual", "off"]] = None
    is_irrigating: Optional[bool] = None
    auto_mode: Optional[bool] = None

class IrrigationStatusResponse(BaseModel):
    mode: str = Field(..., description="Current irrigation mode")
    is_irrigating: bool = Field(..., description="Whether system is currently irrigating")
    auto_mode: bool = Field(..., description="Whether auto mode is enabled")
    last_updated: datetime = Field(..., description="Last update timestamp")

    class Config:
        from_attributes = True

class AlertResponse(BaseModel):
    id: int
    alert_type: Literal["critical", "warning", "info"]
    message: str
    created_at: datetime
    is_dismissed: bool = False

    class Config:
        from_attributes = True

class IrrigationSessionResponse(BaseModel):
    id: int
    mode: str
    started_at: datetime
    ended_at: Optional[datetime] = None
    duration_minutes: Optional[int] = None
    estimated_volume_liters: Optional[float] = None
    trigger_reason: Optional[str] = None
    
    class Config:
        from_attributes = True

class AlertCreate(BaseModel):
    alert_type: Literal["critical", "warning", "info"]
    message: str
    sensor_reading_id: Optional[int] = None
    irrigation_session_id: Optional[int] = None