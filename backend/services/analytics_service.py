from sqlalchemy.orm import Session
from sqlalchemy import desc, func
from models.database import SessionLocal
from models.sensor import SensorReading, IrrigationSession, Alert
from datetime import datetime, timedelta
from typing import Dict, List, Optional
import statistics

class AnalyticsService:
    def __init__(self, db: Session):
        self.db = db
    
    async def get_water_usage_stats(self, days: int = 7) -> Dict:
        """Calculate water usage statistics for the specified period"""
        start_date = datetime.utcnow() - timedelta(days=days)
        
        sessions = self.db.query(IrrigationSession).filter(
            IrrigationSession.started_at >= start_date
        ).all()
        
        total_water = sum(s.estimated_volume_liters or 0 for s in sessions)
        total_sessions = len(sessions)
        avg_per_session = total_water / total_sessions if total_sessions > 0 else 0
        
        # Calculate daily breakdown
        daily_usage = {}
        for session in sessions:
            date_key = session.started_at.date()
            if date_key not in daily_usage:
                daily_usage[date_key] = {
                    'water_liters': 0,
                    'sessions': 0,
                    'duration_minutes': 0
                }
            daily_usage[date_key]['water_liters'] += session.estimated_volume_liters or 0
            daily_usage[date_key]['sessions'] += 1
            daily_usage[date_key]['duration_minutes'] += session.duration_minutes or 0
        
        return {
            'total_water_liters': round(total_water, 1),
            'total_sessions': total_sessions,
            'avg_per_session': round(avg_per_session, 1),
            'daily_breakdown': daily_usage,
            'period_days': days
        }
    
    async def calculate_cost_savings(self, days: int = 7) -> Dict:
        """Calculate water and cost savings based on efficiency improvements"""
        stats = await self.get_water_usage_stats(days)
        
        # PRD assumptions
        EFFICIENCY_IMPROVEMENT = 0.40  # 40% water savings
        COST_PER_LITER = 0.05  # ₹0.05 per liter
        LABOR_COST_SAVED_PER_DAY = 50  # ₹50/day saved on manual checking
        
        total_water = stats['total_water_liters']
        
        # Calculate what would have been used without smart irrigation
        water_without_system = total_water / (1 - EFFICIENCY_IMPROVEMENT)
        water_saved = water_without_system - total_water
        
        # Cost savings
        water_cost_saved = water_saved * COST_PER_LITER
        labor_cost_saved = days * LABOR_COST_SAVED_PER_DAY
        total_savings = water_cost_saved + labor_cost_saved
        
        # ROI calculation (assuming system cost ₹20,000)
        SYSTEM_COST = 20000
        daily_savings = total_savings / days
        payback_days = SYSTEM_COST / daily_savings if daily_savings > 0 else 0
        
        return {
            'water_saved_liters': round(water_saved, 1),
            'water_cost_saved': round(water_cost_saved, 2),
            'labor_cost_saved': round(labor_cost_saved, 2),
            'total_savings': round(total_savings, 2),
            'efficiency_percent': int(EFFICIENCY_IMPROVEMENT * 100),
            'daily_savings': round(daily_savings, 2),
            'payback_period_days': round(payback_days, 0),
            'payback_period_months': round(payback_days / 30, 1),
            'period_days': days
        }
    
    async def get_efficiency_metrics(self, days: int = 7) -> Dict:
        """Calculate irrigation efficiency metrics"""
        start_date = datetime.utcnow() - timedelta(days=days)
        
        # Get sensor readings
        readings = self.db.query(SensorReading).filter(
            SensorReading.timestamp >= start_date
        ).all()
        
        if not readings:
            return {
                'avg_soil_moisture': 0,
                'optimal_moisture_percent': 0,
                'avg_water_level': 0,
                'avg_flow_rate': 0
            }
        
        # Calculate averages
        avg_soil_moisture = statistics.mean(r.soil_moisture for r in readings)
        avg_water_level = statistics.mean(r.water_level for r in readings)
        avg_flow_rate = statistics.mean(r.flow_rate for r in readings)
        
        # Calculate how often soil moisture is in optimal range (40-70%)
        optimal_readings = sum(1 for r in readings if 40 <= r.soil_moisture <= 70)
        optimal_percent = (optimal_readings / len(readings)) * 100
        
        return {
            'avg_soil_moisture': round(avg_soil_moisture, 1),
            'optimal_moisture_percent': round(optimal_percent, 1),
            'avg_water_level': round(avg_water_level, 1),
            'avg_flow_rate': round(avg_flow_rate, 1),
            'total_readings': len(readings)
        }
    
    async def get_alert_summary(self, days: int = 7) -> Dict:
        """Get summary of alerts for the period"""
        start_date = datetime.utcnow() - timedelta(days=days)
        
        alerts = self.db.query(Alert).filter(
            Alert.created_at >= start_date
        ).all()
        
        critical_count = sum(1 for a in alerts if a.alert_type == 'critical')
        warning_count = sum(1 for a in alerts if a.alert_type == 'warning')
        info_count = sum(1 for a in alerts if a.alert_type == 'info')
        dismissed_count = sum(1 for a in alerts if a.is_dismissed)
        
        return {
            'total_alerts': len(alerts),
            'critical': critical_count,
            'warning': warning_count,
            'info': info_count,
            'dismissed': dismissed_count,
            'active': len(alerts) - dismissed_count
        }
    
    async def get_comprehensive_analytics(self, days: int = 7) -> Dict:
        """Get all analytics in one call"""
        water_stats = await self.get_water_usage_stats(days)
        cost_savings = await self.calculate_cost_savings(days)
        efficiency = await self.get_efficiency_metrics(days)
        alerts = await self.get_alert_summary(days)
        
        return {
            'water_usage': water_stats,
            'cost_savings': cost_savings,
            'efficiency': efficiency,
            'alerts': alerts,
            'period_days': days
        }
