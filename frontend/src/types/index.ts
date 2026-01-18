// src/types/index.ts

// API Types (from backend)
export interface SensorData {
  water_level: number;
  flow_rate: number;
  turbidity: number;
  vibration_status: 'low' | 'high';
  soil_moisture: number;
  timestamp: string;
}

export interface HealthScore {
  score: number;
  status: 'normal' | 'warning' | 'critical';
  message: string;
}

export interface IrrigationStatus {
  mode: 'normal' | 'survival' | 'manual' | 'off';
  is_irrigating: boolean;
  auto_mode: boolean;
  last_updated: string;
}

export interface Alert {
  id: number;
  alert_type: 'critical' | 'warning' | 'info';
  message: string;
  created_at: string;
  is_dismissed: boolean;
}

// Component Types (for UI)
export interface UISensorData {
  waterLevel: number; // 0-100%
  flowRate: number; // 0-20 L/min
  turbidity: number; // 0-100% clarity
  vibrationStatus: 'low' | 'high';
  soilMoisture: number; // 0-100%
  timestamp: Date;
}

// Common types
export type IrrigationMode = 'normal' | 'survival' | 'manual' | 'off';
export type AlertType = 'critical' | 'warning' | 'info';