// Realistic mock data for irrigation system demonstration
export interface MockSensorReading {
  water_level: number;
  soil_moisture: number;
  flow_rate: number;
  turbidity: number;
  vibration_status: 'low' | 'medium' | 'high';
  ph_level: number;
  temperature: number;
  timestamp: Date;
}

export interface BorewellMaintenance {
  overall_health: number; // 0-100
  pump_efficiency: number;
  filter_condition: number;
  pipe_integrity: number;
  electrical_system: number;
  last_maintenance: Date;
  next_maintenance: Date;
  critical_issues: string[];
  warnings: string[];
}

// Realistic borewell scenarios based on Indian agriculture
const scenarios = {
  normal_operation: {
    water_level: 75,
    soil_moisture: 65,
    flow_rate: 12.5,
    turbidity: 2.1,
    vibration_status: 'low' as const,
    ph_level: 6.8,
    temperature: 24.5
  },
  dry_season: {
    water_level: 45,
    soil_moisture: 25,
    flow_rate: 8.2,
    turbidity: 4.5,
    vibration_status: 'medium' as const,
    ph_level: 7.2,
    temperature: 32.1
  },
  monsoon_season: {
    water_level: 95,
    soil_moisture: 85,
    flow_rate: 18.7,
    turbidity: 1.2,
    vibration_status: 'low' as const,
    ph_level: 6.5,
    temperature: 22.3
  },
  maintenance_needed: {
    water_level: 35,
    soil_moisture: 40,
    flow_rate: 6.1,
    turbidity: 8.9,
    vibration_status: 'high' as const,
    ph_level: 7.8,
    temperature: 28.7
  },
  critical_condition: {
    water_level: 15,
    soil_moisture: 15,
    flow_rate: 2.3,
    turbidity: 15.2,
    vibration_status: 'high' as const,
    ph_level: 8.2,
    temperature: 35.4
  }
};

// Current scenario rotation (changes based on time)
export const getCurrentScenario = (): keyof typeof scenarios => {
  const hour = new Date().getHours();
  
  // Simulate different conditions throughout the day
  if (hour >= 6 && hour < 10) return 'normal_operation'; // Morning
  if (hour >= 10 && hour < 14) return 'dry_season'; // Hot midday
  if (hour >= 14 && hour < 18) return 'maintenance_needed'; // Afternoon stress
  if (hour >= 18 && hour < 22) return 'monsoon_season'; // Evening relief
  return 'normal_operation'; // Night
};

// Add realistic variations to base values
const addRealisticVariation = (baseValue: number, variation: number = 0.1): number => {
  const variance = baseValue * variation;
  return baseValue + (Math.random() - 0.5) * variance * 2;
};

export const generateMockSensorData = (): MockSensorReading => {
  const currentScenario = getCurrentScenario();
  const baseData = scenarios[currentScenario];
  
  return {
    water_level: Math.max(0, Math.min(100, addRealisticVariation(baseData.water_level, 0.05))),
    soil_moisture: Math.max(0, Math.min(100, addRealisticVariation(baseData.soil_moisture, 0.08))),
    flow_rate: Math.max(0, addRealisticVariation(baseData.flow_rate, 0.12)),
    turbidity: Math.max(0, addRealisticVariation(baseData.turbidity, 0.15)),
    vibration_status: baseData.vibration_status,
    ph_level: Math.max(4, Math.min(10, addRealisticVariation(baseData.ph_level, 0.03))),
    temperature: addRealisticVariation(baseData.temperature, 0.04),
    timestamp: new Date()
  };
};

// Calculate borewell maintenance status
export const generateBorewellMaintenance = (sensorData: MockSensorReading): BorewellMaintenance => {
  // Calculate component health based on sensor readings
  const pump_efficiency = sensorData.vibration_status === 'low' ? 85 + Math.random() * 10 :
                         sensorData.vibration_status === 'medium' ? 65 + Math.random() * 15 :
                         40 + Math.random() * 20;

  const filter_condition = sensorData.turbidity < 3 ? 80 + Math.random() * 15 :
                          sensorData.turbidity < 8 ? 60 + Math.random() * 20 :
                          30 + Math.random() * 25;

  const pipe_integrity = sensorData.flow_rate > 10 ? 85 + Math.random() * 10 :
                        sensorData.flow_rate > 5 ? 70 + Math.random() * 15 :
                        45 + Math.random() * 20;

  const electrical_system = sensorData.vibration_status === 'high' ? 60 + Math.random() * 15 :
                           85 + Math.random() * 10;

  // Overall health is weighted average
  const overall_health = (
    pump_efficiency * 0.3 +
    filter_condition * 0.25 +
    pipe_integrity * 0.25 +
    electrical_system * 0.2
  );

  // Generate issues based on component health
  const critical_issues: string[] = [];
  const warnings: string[] = [];

  if (pump_efficiency < 50) critical_issues.push('Pump motor bearing failure detected');
  else if (pump_efficiency < 70) warnings.push('Pump efficiency declining');

  if (filter_condition < 40) critical_issues.push('Filter blockage critical - immediate cleaning required');
  else if (filter_condition < 60) warnings.push('Filter needs cleaning soon');

  if (pipe_integrity < 50) critical_issues.push('Possible pipe leakage detected');
  else if (pipe_integrity < 70) warnings.push('Monitor pipe condition');

  if (electrical_system < 65) critical_issues.push('Electrical connection issues');
  else if (electrical_system < 80) warnings.push('Check electrical connections');

  return {
    overall_health: Math.round(overall_health),
    pump_efficiency: Math.round(pump_efficiency),
    filter_condition: Math.round(filter_condition),
    pipe_integrity: Math.round(pipe_integrity),
    electrical_system: Math.round(electrical_system),
    last_maintenance: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000), // 25 days ago
    next_maintenance: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
    critical_issues,
    warnings
  };
};

// Realistic irrigation history
export const generateIrrigationHistory = () => {
  const sessions = [];
  const now = new Date();
  
  // Generate last 10 sessions over the past few days
  for (let i = 0; i < 10; i++) {
    const hoursAgo = (i * 4) + Math.random() * 3; // Every 4 hours with variation
    const startTime = new Date(now.getTime() - hoursAgo * 60 * 60 * 1000);
    const duration = 5 + Math.random() * 10; // 5-15 minutes
    const volume = duration * (10 + Math.random() * 8); // Realistic volume based on flow
    
    const modes = ['manual', 'auto', 'survival'];
    const mode = modes[Math.floor(Math.random() * modes.length)];
    
    sessions.push({
      id: i + 1,
      mode,
      started_at: startTime.toISOString(),
      ended_at: new Date(startTime.getTime() + duration * 60 * 1000).toISOString(),
      duration_minutes: Math.round(duration),
      estimated_volume_liters: Math.round(volume),
      trigger_reason: mode === 'manual' ? 'User initiated' : 
                     mode === 'survival' ? 'Critical soil moisture' : 
                     'Scheduled irrigation'
    });
  }
  
  return sessions.reverse(); // Most recent first
};

// Realistic alerts based on conditions
export const generateRealisticAlerts = (sensorData: MockSensorReading, maintenance: BorewellMaintenance) => {
  const alerts = [];
  let alertId = 1;

  // Critical maintenance issues
  if (maintenance.overall_health < 50) {
    alerts.push({
      id: alertId++,
      alert_type: 'critical',
      message: `Borewell maintenance critical: ${maintenance.overall_health}% health`,
      created_at: new Date(Date.now() - 15 * 60 * 1000).toISOString(), // 15 mins ago
      is_dismissed: false
    });
  }

  // Low water level
  if (sensorData.water_level < 30) {
    alerts.push({
      id: alertId++,
      alert_type: 'critical',
      message: `Water level critically low: ${Math.round(sensorData.water_level)}%`,
      created_at: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
      is_dismissed: false
    });
  }

  // High turbidity
  if (sensorData.turbidity > 10) {
    alerts.push({
      id: alertId++,
      alert_type: 'warning',
      message: `High water turbidity detected: ${sensorData.turbidity.toFixed(1)} NTU`,
      created_at: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
      is_dismissed: false
    });
  }

  // Pump vibration
  if (sensorData.vibration_status === 'high') {
    alerts.push({
      id: alertId++,
      alert_type: 'warning',
      message: 'High pump vibration detected - check motor alignment',
      created_at: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
      is_dismissed: false
    });
  }

  // Soil moisture
  if (sensorData.soil_moisture < 25) {
    alerts.push({
      id: alertId++,
      alert_type: 'warning',
      message: `Soil moisture low: ${Math.round(sensorData.soil_moisture)}% - irrigation recommended`,
      created_at: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
      is_dismissed: false
    });
  }

  // pH level issues
  if (sensorData.ph_level > 8.5 || sensorData.ph_level < 6.0) {
    alerts.push({
      id: alertId++,
      alert_type: 'info',
      message: `Water pH level ${sensorData.ph_level.toFixed(1)} - consider treatment`,
      created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
      is_dismissed: false
    });
  }

  return alerts;
};