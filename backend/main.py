from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
import uvicorn
from datetime import datetime
import asyncio
from typing import List

from sqlalchemy.orm import Session
from models.database import engine, Base, SessionLocal, get_db
from models.sensor import SensorData, SensorReading, IrrigationControl, Alert, IrrigationSession
from services.sensor_service import SensorService
from services.irrigation_service import IrrigationService
from services.analytics_service import AnalyticsService
from schemas.sensor_schemas import (
    SensorDataResponse, 
    HealthScoreResponse, 
    IrrigationControlRequest,
    IrrigationStatusResponse,
    IrrigationSessionResponse,
    AlertResponse
)

# Create database tables
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    Base.metadata.create_all(bind=engine)
    
    # Start background sensor simulation
    async def simulate_sensors():
        while True:
            try:
                # Create a new session for each iteration to ensure proper cleanup
                db = SessionLocal()
                try:
                    sensor_service = SensorService(db)
                    irrigation_service = IrrigationService(db)
                    
                    # Generate and store sensor data
                    sensor_data = await sensor_service.generate_sensor_reading()
                    
                    # Check irrigation needs
                    await irrigation_service.check_auto_irrigation(sensor_data)
                    
                    # Check for alerts
                    await sensor_service.check_and_create_alerts(sensor_data)
                finally:
                    # Always close the session
                    db.close()
                
            except Exception as e:
                print(f"Sensor simulation error: {e}")
            
            await asyncio.sleep(5)  # Update every 5 seconds
    
    # Start background task
    task = asyncio.create_task(simulate_sensors())
    
    yield
    
    # Shutdown
    task.cancel()

app = FastAPI(
    title="RootGuard Bot API",
    description="Smart Irrigation & Borewell Monitoring System",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:8080",
        "http://localhost:8081",  # Added for new Vite port
        "http://127.0.0.1:5173",
        "http://127.0.0.1:8080",
        "http://127.0.0.1:8081",  # Added for new Vite port
        "https://root-guardian.netlify.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dependency injection
def get_sensor_service(db: Session = Depends(get_db)):
    return SensorService(db)

def get_irrigation_service(db: Session = Depends(get_db)):
    return IrrigationService(db)

def get_analytics_service(db: Session = Depends(get_db)):
    return AnalyticsService(db)

# Health check endpoint
@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.utcnow()}

# Sensor data endpoints
@app.get("/api/sensors/latest", response_model=SensorDataResponse)
async def get_latest_sensor_data(
    sensor_service: SensorService = Depends(get_sensor_service)
):
    """Get the most recent sensor readings"""
    try:
        data = await sensor_service.get_latest_reading()
        if not data:
            raise HTTPException(status_code=404, detail="No sensor data found")
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/sensors/history", response_model=List[SensorDataResponse])
async def get_sensor_history(
    limit: int = 100,
    sensor_service: SensorService = Depends(get_sensor_service)
):
    """Get historical sensor readings"""
    try:
        data = await sensor_service.get_reading_history(limit)
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/health-score", response_model=HealthScoreResponse)
async def get_health_score(
    sensor_service: SensorService = Depends(get_sensor_service)
):
    """Calculate and return the current system health score"""
    try:
        health_score = await sensor_service.calculate_health_score()
        if not health_score:
            raise HTTPException(status_code=404, detail="Unable to calculate health score")
        return health_score
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Irrigation control endpoints
@app.get("/api/irrigation/status", response_model=IrrigationStatusResponse)
async def get_irrigation_status(
    irrigation_service: IrrigationService = Depends(get_irrigation_service)
):
    """Get current irrigation system status"""
    try:
        status = await irrigation_service.get_current_status()
        return status
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/irrigation/control", response_model=IrrigationStatusResponse)
async def control_irrigation(
    control_request: IrrigationControlRequest,
    irrigation_service: IrrigationService = Depends(get_irrigation_service)
):
    """Control irrigation system (mode change, start/stop)"""
    try:
        status = await irrigation_service.update_control(control_request)
        return status
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/irrigation/history", response_model=List[IrrigationSessionResponse])
async def get_irrigation_history(
    limit: int = 10,
    irrigation_service: IrrigationService = Depends(get_irrigation_service)
):
    """Get recent irrigation sessions with datetime info"""
    try:
        history = await irrigation_service.get_irrigation_history(limit)
        return history
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Alerts endpoints
@app.get("/api/alerts", response_model=List[AlertResponse])
async def get_active_alerts(
    limit: int = 10,
    sensor_service: SensorService = Depends(get_sensor_service)
):
    """Get active system alerts"""
    try:
        alerts = await sensor_service.get_active_alerts(limit)
        return alerts
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/api/alerts/{alert_id}")
async def dismiss_alert(
    alert_id: int,
    sensor_service: SensorService = Depends(get_sensor_service)
):
    """Dismiss a specific alert"""
    try:
        success = await sensor_service.dismiss_alert(alert_id)
        if not success:
            raise HTTPException(status_code=404, detail="Alert not found")
        return {"message": "Alert dismissed successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Analytics endpoints
@app.get("/api/analytics/water-usage")
async def get_water_usage(
    days: int = 7,
    analytics_service: AnalyticsService = Depends(get_analytics_service)
):
    """Get water usage statistics for specified period"""
    try:
        stats = await analytics_service.get_water_usage_stats(days)
        return stats
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/analytics/cost-savings")
async def get_cost_savings(
    days: int = 7,
    analytics_service: AnalyticsService = Depends(get_analytics_service)
):
    """Get cost savings and ROI calculations"""
    try:
        savings = await analytics_service.calculate_cost_savings(days)
        return savings
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/analytics/efficiency")
async def get_efficiency_metrics(
    days: int = 7,
    analytics_service: AnalyticsService = Depends(get_analytics_service)
):
    """Get irrigation efficiency metrics"""
    try:
        metrics = await analytics_service.get_efficiency_metrics(days)
        return metrics
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/analytics/comprehensive")
async def get_comprehensive_analytics(
    days: int = 7,
    analytics_service: AnalyticsService = Depends(get_analytics_service)
):
    """Get all analytics data in one call"""
    try:
        analytics = await analytics_service.get_comprehensive_analytics(days)
        return analytics
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(
        "main:app", 
        host="0.0.0.0", 
        port=8000, 
        reload=True,
        log_level="info"
    )