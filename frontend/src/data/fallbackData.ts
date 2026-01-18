// Fallback data when backend is not available
export const fallbackSensorData = {
  water_level: 75,
  flow_rate: 12.5,
  turbidity: 85,
  vibration_status: 'low' as const,
  soil_moisture: 45,
  timestamp: new Date().toISOString()
};

export const fallbackHealthScore = {
  score: 82,
  status: 'normal' as const,
  message: 'System operating normally (offline mode)'
};

export const fallbackIrrigationStatus = {
  mode: 'normal' as const,
  is_irrigating: false,
  auto_mode: true,
  last_updated: new Date().toISOString()
};

export const fallbackAlerts = [
  {
    id: 1,
    alert_type: 'info' as const,
    message: 'Backend connection unavailable - showing cached data',
    created_at: new Date().toISOString(),
    is_dismissed: false
  }
];