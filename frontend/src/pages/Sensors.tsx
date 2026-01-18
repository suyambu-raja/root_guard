import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useRealSensorData } from '@/hooks/useRealSensorData';
import { AnimatedSensorCard, WaterLevelCard, FlowRateCard, TurbidityCard, SoilMoistureCard } from '@/components/AnimatedSensorCard';
import { Activity, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { apiService } from '@/services/api';
import { LineChart, Line, ResponsiveContainer, Tooltip } from 'recharts';

export const Sensors: React.FC = () => {
  const { t } = useTranslation();
  const { sensorData, isLoading } = useRealSensorData();

  // Fetch sensor history for trends
  const { data: sensorHistory = [] } = useQuery({
    queryKey: ['sensorHistory'],
    queryFn: () => apiService.getSensorHistory(20),
    refetchInterval: 30000,
  });

  // Calculate trends
  const trends = useMemo(() => {
    if (sensorHistory.length < 2) return {};

    const latest = sensorHistory[0];
    const previous = sensorHistory[1];

    return {
      waterLevel: latest.water_level - previous.water_level,
      flowRate: latest.flow_rate - previous.flow_rate,
      turbidity: latest.turbidity - previous.turbidity,
      soilMoisture: latest.soil_moisture - previous.soil_moisture,
    };
  }, [sensorHistory]);

  const getTrendIcon = (trend: number) => {
    if (trend > 0.5) return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (trend < -0.5) return <TrendingDown className="h-4 w-4 text-red-600" />;
    return <Minus className="h-4 w-4 text-gray-400" />;
  };

  const getTrendColor = (trend: number) => {
    if (trend > 0.5) return 'text-green-600';
    if (trend < -0.5) return 'text-red-600';
    return 'text-gray-400';
  };

  // Prepare mini chart data
  const waterLevelData = sensorHistory.slice(0, 10).reverse().map(r => ({ value: r.water_level }));
  const flowRateData = sensorHistory.slice(0, 10).reverse().map(r => ({ value: r.flow_rate }));
  const turbidityData = sensorHistory.slice(0, 10).reverse().map(r => ({ value: r.turbidity }));
  const soilMoistureData = sensorHistory.slice(0, 10).reverse().map(r => ({ value: r.soil_moisture }));

  return (
    <div className="p-4 space-y-6 pb-20">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-2xl font-bold text-agriculture-green">{t('nav.sensors')}</h1>
        <p className="text-gray-600 mt-1">Monitor all system sensors in real-time</p>
      </motion.div>

      <motion.div
        className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        {/* Water Level Card with Trend */}
        <Card className="relative overflow-hidden">
          {isLoading && (
            <div className="absolute top-0 left-0 h-1 w-full bg-gray-200">
              <motion.div
                className="h-full bg-agriculture-blue"
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 1, ease: "easeInOut" }}
              />
            </div>
          )}
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center justify-between text-agriculture-green">
              <span>💧 Water Level</span>
              {trends.waterLevel !== undefined && (
                <div className="flex items-center gap-1">
                  {getTrendIcon(trends.waterLevel)}
                  <span className={`text-xs ${getTrendColor(trends.waterLevel)}`}>
                    {trends.waterLevel > 0 ? '+' : ''}{trends.waterLevel.toFixed(1)}%
                  </span>
                </div>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <motion.div
              className="text-3xl font-bold text-agriculture-blue mb-2"
              animate={{ scale: sensorData?.water_level ? [1, 1.05, 1] : 1 }}
              transition={{ duration: 0.3 }}
            >
              {sensorData?.water_level ?? '--'}%
            </motion.div>
            {waterLevelData.length > 0 && (
              <ResponsiveContainer width="100%" height={40}>
                <LineChart data={waterLevelData}>
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#1976D2"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Tooltip />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Flow Rate Card with Trend */}
        <Card className="relative overflow-hidden">
          {isLoading && (
            <div className="absolute top-0 left-0 h-1 w-full bg-gray-200">
              <motion.div
                className="h-full bg-agriculture-blue"
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 1, ease: "easeInOut" }}
              />
            </div>
          )}
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center justify-between text-agriculture-green">
              <span>🌊 Flow Rate</span>
              {trends.flowRate !== undefined && (
                <div className="flex items-center gap-1">
                  {getTrendIcon(trends.flowRate)}
                  <span className={`text-xs ${getTrendColor(trends.flowRate)}`}>
                    {trends.flowRate > 0 ? '+' : ''}{trends.flowRate.toFixed(1)}
                  </span>
                </div>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <motion.div
              className="text-3xl font-bold text-agriculture-blue mb-2"
              animate={{ scale: sensorData?.flow_rate ? [1, 1.05, 1] : 1 }}
              transition={{ duration: 0.3 }}
            >
              {sensorData?.flow_rate ?? '--'} L/min
            </motion.div>
            {flowRateData.length > 0 && (
              <ResponsiveContainer width="100%" height={40}>
                <LineChart data={flowRateData}>
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#00BCD4"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Tooltip />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Turbidity Card with Trend */}
        <Card className="relative overflow-hidden">
          {isLoading && (
            <div className="absolute top-0 left-0 h-1 w-full bg-gray-200">
              <motion.div
                className="h-full bg-agriculture-blue"
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 1, ease: "easeInOut" }}
              />
            </div>
          )}
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center justify-between text-agriculture-green">
              <span>💨 Turbidity</span>
              {trends.turbidity !== undefined && (
                <div className="flex items-center gap-1">
                  {getTrendIcon(trends.turbidity)}
                  <span className={`text-xs ${getTrendColor(trends.turbidity)}`}>
                    {trends.turbidity > 0 ? '+' : ''}{trends.turbidity.toFixed(1)}%
                  </span>
                </div>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <motion.div
              className="text-3xl font-bold text-agriculture-blue mb-2"
              animate={{ scale: sensorData?.turbidity ? [1, 1.05, 1] : 1 }}
              transition={{ duration: 0.3 }}
            >
              {sensorData?.turbidity ?? '--'}%
            </motion.div>
            {turbidityData.length > 0 && (
              <ResponsiveContainer width="100%" height={40}>
                <LineChart data={turbidityData}>
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#9C27B0"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Tooltip />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Vibration Card */}
        <Card className="relative overflow-hidden">
          {isLoading && (
            <div className="absolute top-0 left-0 h-1 w-full bg-gray-200">
              <motion.div
                className="h-full bg-agriculture-blue"
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 1, ease: "easeInOut" }}
              />
            </div>
          )}
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2 text-agriculture-green">
              <Activity className="h-4 w-4" /> {t('sensors.vibration')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <motion.div
              className="text-2xl font-bold text-agriculture-blue mb-2"
              animate={{
                scale: sensorData?.vibration_status ? [1, 1.05, 1] : 1,
              }}
              transition={{ duration: 0.3 }}
            >
              {sensorData?.vibration_status === 'high' ? t('sensors.high') :
                sensorData?.vibration_status === 'low' ? t('sensors.normal') : '--'}
            </motion.div>
            <div className="h-2 mt-2 w-full bg-gray-200 rounded-full overflow-hidden">
              <motion.div
                className={`h-full ${sensorData?.vibration_status === 'high' ? 'bg-red-500' : 'bg-agriculture-green'
                  }`}
                initial={{ width: "0%" }}
                animate={{ width: sensorData?.vibration_status === 'high' ? '100%' : '30%' }}
                transition={{ duration: 0.8, ease: "easeInOut" }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {sensorData?.vibration_status === 'high'
                ? '⚠️ Check pump motor'
                : '✓ Operating normally'}
            </p>
          </CardContent>
        </Card>

        {/* Soil Moisture Card with Trend */}
        <Card className="relative overflow-hidden">
          {isLoading && (
            <div className="absolute top-0 left-0 h-1 w-full bg-gray-200">
              <motion.div
                className="h-full bg-agriculture-blue"
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 1, ease: "easeInOut" }}
              />
            </div>
          )}
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center justify-between text-agriculture-green">
              <span>🌱 Soil Moisture</span>
              {trends.soilMoisture !== undefined && (
                <div className="flex items-center gap-1">
                  {getTrendIcon(trends.soilMoisture)}
                  <span className={`text-xs ${getTrendColor(trends.soilMoisture)}`}>
                    {trends.soilMoisture > 0 ? '+' : ''}{trends.soilMoisture.toFixed(1)}%
                  </span>
                </div>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <motion.div
              className="text-3xl font-bold text-agriculture-blue mb-2"
              animate={{ scale: sensorData?.soil_moisture ? [1, 1.05, 1] : 1 }}
              transition={{ duration: 0.3 }}
            >
              {sensorData?.soil_moisture ?? '--'}%
            </motion.div>
            {soilMoistureData.length > 0 && (
              <ResponsiveContainer width="100%" height={40}>
                <LineChart data={soilMoistureData}>
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#4CAF50"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Tooltip />
                </LineChart>
              </ResponsiveContainer>
            )}
            <p className="text-xs text-gray-500 mt-2">
              {sensorData?.soil_moisture && sensorData.soil_moisture < 40
                ? '🏜️ Dry - Irrigation recommended'
                : '💚 Optimal moisture level'}
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};