// src/services/api.ts
const API_BASE_URL = 'http://127.0.0.1:8000';

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
  irrigation_session_id?: number;
}

export interface IrrigationSession {
  id: number;
  mode: string;
  started_at: string;
  ended_at?: string;
  duration_minutes?: number;
  estimated_volume_liters?: number;
  trigger_reason?: string;
}

class ApiService {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    try {
      const url = `${this.baseUrl}${endpoint}`;
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Request failed: ${error}`);
      }

      return response.json();
    } catch (error) {
      // Handle network errors gracefully
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Unable to connect to the server. Please check your connection and ensure the backend is running.');
      }
      throw error;
    }
  }

  // Health check
  healthCheck() {
    return this.request<{ status: string }>('/health');
  }

  // Sensor data
  getLatestSensorData() {
    return this.request<SensorData>('/api/sensors/latest');
  }

  getSensorHistory(limit: number = 100) {
    return this.request<SensorData[]>(`/api/sensors/history?limit=${limit}`);
  }

  // Health score
  getHealthScore() {
    return this.request<HealthScore>('/api/health-score');
  }

  // Irrigation
  getIrrigationStatus() {
    return this.request<IrrigationStatus>('/api/irrigation/status');
  }

  updateIrrigationControl(data: {
    mode?: 'normal' | 'survival' | 'manual' | 'off';
    is_irrigating?: boolean;
    auto_mode?: boolean;
  }) {
    return this.request<IrrigationStatus>('/api/irrigation/control', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Alerts
  getActiveAlerts(limit: number = 10) {
    return this.request<Alert[]>(`/api/alerts?limit=${limit}`);
  }

  dismissAlert(alertId: number) {
    return this.request<{ message: string }>(`/api/alerts/${alertId}`, {
      method: 'DELETE',
    });
  }

  // Irrigation history
  getIrrigationHistory(limit: number = 10) {
    return this.request<IrrigationSession[]>(`/api/irrigation/history?limit=${limit}`);
  }

  // Analytics endpoints
  getWaterUsageStats(days: number = 7) {
    return this.request<any>(`/api/analytics/water-usage?days=${days}`);
  }

  getCostSavings(days: number = 7) {
    return this.request<any>(`/api/analytics/cost-savings?days=${days}`);
  }

  getEfficiencyMetrics(days: number = 7) {
    return this.request<any>(`/api/analytics/efficiency?days=${days}`);
  }

  getComprehensiveAnalytics(days: number = 7) {
    return this.request<any>(`/api/analytics/comprehensive?days=${days}`);
  }
}

export const apiService = new ApiService();