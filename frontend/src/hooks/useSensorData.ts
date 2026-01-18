import { useState, useEffect, useCallback } from 'react';

export interface SensorData {
  waterLevel: number; // 0-100%
  flowRate: number; // 0-20 L/min
  turbidity: number; // 0-100% clarity
  vibrationStatus: 'low' | 'high';
  soilMoisture: number; // 0-100%
  timestamp: Date;
}

export interface HealthScore {
  score: number; // 0-100
  status: 'normal' | 'warning' | 'critical';
  message: string;
}

export type IrrigationMode = 'normal' | 'survival' | 'manual' | 'off';

const calculateHealthScore = (data: SensorData): HealthScore => {
  const waterLevelScore = data.waterLevel * 0.25;
  const turbidityScore = data.turbidity * 0.25;
  const vibrationScore = (data.vibrationStatus === 'low' ? 100 : 30) * 0.25;
  const flowRateScore = Math.min((data.flowRate / 15) * 100, 100) * 0.25;
  
  const score = Math.round(waterLevelScore + turbidityScore + vibrationScore + flowRateScore);
  
  let status: HealthScore['status'];
  let message: string;
  
  if (score >= 80) {
    status = 'normal';
    message = 'System operating normally';
  } else if (score >= 50) {
    status = 'warning';
    message = 'Maintenance recommended soon';
  } else {
    status = 'critical';
    message = 'Critical - Survival mode activated';
  }
  
  return { score, status, message };
};

// Simulate realistic sensor data with slight variations
const generateSensorData = (prevData?: SensorData): SensorData => {
  const variance = (base: number, range: number) => {
    const change = (Math.random() - 0.5) * range;
    return Math.max(0, Math.min(100, base + change));
  };
  
  const baseWaterLevel = prevData?.waterLevel ?? 72;
  const baseFlowRate = prevData?.flowRate ?? 12;
  const baseTurbidity = prevData?.turbidity ?? 85;
  const baseSoilMoisture = prevData?.soilMoisture ?? 45;
  
  return {
    waterLevel: Math.round(variance(baseWaterLevel, 3)),
    flowRate: Math.round(variance(baseFlowRate, 1) * 10) / 10,
    turbidity: Math.round(variance(baseTurbidity, 2)),
    vibrationStatus: Math.random() > 0.95 ? 'high' : 'low',
    soilMoisture: Math.round(variance(baseSoilMoisture, 4)),
    timestamp: new Date(),
  };
};

export const useSensorData = () => {
  const [sensorData, setSensorData] = useState<SensorData>(generateSensorData());
  const [healthScore, setHealthScore] = useState<HealthScore>(() => calculateHealthScore(sensorData));
  const [irrigationMode, setIrrigationMode] = useState<IrrigationMode>('normal');
  const [isIrrigating, setIsIrrigating] = useState(false);
  const [alerts, setAlerts] = useState<Array<{ id: string; type: 'critical' | 'warning' | 'info'; message: string; time: Date }>>([]);

  // Update sensor data every 30 seconds (simulated)
  useEffect(() => {
    const interval = setInterval(() => {
      setSensorData(prev => {
        const newData = generateSensorData(prev);
        const newHealth = calculateHealthScore(newData);
        setHealthScore(newHealth);
        
        // Auto-activate survival mode on critical
        if (newHealth.status === 'critical' && irrigationMode === 'normal') {
          setIrrigationMode('survival');
          setAlerts(prev => [{
            id: Date.now().toString(),
            type: 'critical',
            message: 'Survival mode activated - Low water resources detected',
            time: new Date()
          }, ...prev.slice(0, 9)]);
        }
        
        return newData;
      });
    }, 5000); // 5 seconds for demo, would be 30 in production

    return () => clearInterval(interval);
  }, [irrigationMode]);

  const toggleIrrigation = useCallback(() => {
    if (irrigationMode === 'off') {
      setIsIrrigating(false);
      return;
    }
    
    setIsIrrigating(prev => !prev);
    setAlerts(prev => [{
      id: Date.now().toString(),
      type: 'info',
      message: isIrrigating ? 'Irrigation stopped' : `Irrigation started (${irrigationMode} mode)`,
      time: new Date()
    }, ...prev.slice(0, 9)]);
  }, [irrigationMode, isIrrigating]);

  const changeMode = useCallback((mode: IrrigationMode) => {
    setIrrigationMode(mode);
    if (mode === 'off') {
      setIsIrrigating(false);
    }
    setAlerts(prev => [{
      id: Date.now().toString(),
      type: 'info',
      message: `Mode changed to ${mode.toUpperCase()}`,
      time: new Date()
    }, ...prev.slice(0, 9)]);
  }, []);

  const dismissAlert = useCallback((id: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== id));
  }, []);

  return {
    sensorData,
    healthScore,
    irrigationMode,
    isIrrigating,
    alerts,
    toggleIrrigation,
    changeMode,
    dismissAlert,
  };
};
