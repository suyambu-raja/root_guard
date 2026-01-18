// src/pages/Index.tsx - Clean UI Dashboard
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { useRealSensorData } from '@/hooks/useRealSensorData';
import { PulseIrrigationIndicator } from '@/components/PulseIrrigationIndicator';
import {
  CheckCircle,
  Droplet,
  Waves,
  Activity,
  Wind,
  Sprout,
  Leaf,
  Shield,
  RefreshCw
} from 'lucide-react';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

const CircularProgress = ({ value, label, subLabel }: { value: number, label: string, subLabel: string }) => {
  const radius = 100; // Increased size
  const stroke = 12;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (value / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center py-4">
      <div className="relative flex items-center justify-center">
        <svg
          height={radius * 2}
          width={radius * 2}
          className="transform -rotate-90"
        >
          {/* Background circle */}
          <circle
            stroke="#e5e7eb"
            strokeWidth={stroke}
            fill="transparent"
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />
          {/* Progress circle */}
          <circle
            stroke="#10b981"
            fill="transparent"
            strokeWidth={stroke}
            strokeDasharray={circumference + ' ' + circumference}
            style={{ strokeDashoffset, transition: 'stroke-dashoffset 0.5s ease-in-out' }}
            strokeLinecap="round"
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />
        </svg>
        <div className="absolute flex flex-col items-center text-center">
          <span className="text-5xl font-bold text-gray-800">{value}</span>
        </div>
      </div>
      <span className="text-sm text-gray-500 font-medium mt-4 text-center max-w-[200px]">{label}</span>
      <div className="mt-4">
        <div className="bg-green-100 text-green-800 px-6 py-2 rounded-full flex items-center gap-2 font-medium">
          <CheckCircle className="w-5 h-5 text-green-600" />
          {subLabel}
        </div>
      </div>
    </div>
  );
};

const MetricCard = ({
  icon: Icon,
  title,
  value,
  unit = '',
  subtext = '',
  statusColor = 'bg-green-500',
  progressValue = 0,
  iconBg = 'bg-gray-100'
}: any) => {
  return (
    <Card className="border-none shadow-sm hover:shadow-md transition-shadow duration-200">
      <CardContent className="p-5">
        <div className="flex justify-between items-start mb-4">
          <div className={`p-3 rounded-xl ${iconBg}`}>
            <Icon className="w-6 h-6 text-gray-700" />
          </div>
          <div className={`w-2.5 h-2.5 rounded-full ${statusColor}`}></div>
        </div>

        <div className="mb-1">
          <h3 className="text-gray-500 font-medium text-sm">{title}</h3>
        </div>

        <div className="flex items-baseline gap-1 mb-3">
          <span className="text-3xl font-bold text-gray-900">{value}</span>
          {unit && <span className="text-gray-500 text-sm ml-1">{unit}</span>}
        </div>

        {subtext && (
          <div className="text-lg font-bold text-gray-800 mb-2">{subtext}</div>
        )}

        {progressValue > 0 && (
          <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full ${statusColor.replace('bg-', 'bg-')}`}
              style={{ width: `${progressValue}%`, backgroundColor: statusColor.includes('green') ? '#10b981' : statusColor.includes('amber') ? '#f59e0b' : '#3b82f6' }}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export const Index: React.FC = () => {
  const { t } = useTranslation();
  const isOnline = useOnlineStatus();
  const {
    sensorData,
    healthScore,
    irrigationStatus,
    updateIrrigation,
    refreshData,
    isLoading
  } = useRealSensorData();

  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshData();
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleIrrigateNow = async () => {
    try {
      await updateIrrigation({ is_irrigating: true, mode: 'manual' });
    } catch (error) {
      console.error('Failed to start irrigation:', error);
    }
  };

  const handleSurvivalMode = async () => {
    try {
      await updateIrrigation({ mode: 'survival', auto_mode: true });
    } catch (error) {
      console.error('Failed to activate survival mode:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white px-4 py-3 flex items-center justify-between border-b shadow-sm sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <div className="bg-green-600 p-2 rounded-lg text-white">
            <Leaf className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900 leading-tight">RootGuard</h1>
            <p className="text-xs text-gray-500">Smart Irrigation</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <div className={`w-3 h-3 rounded-full ${isOnline ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <RefreshCw className={`w-5 h-5 text-gray-500 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 md:space-y-0 md:grid md:grid-cols-12 md:gap-8">

        {/* Left Column: Status & Actions */}
        <div className="md:col-span-4 space-y-6">
          {/* Borewell Status Card */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 h-fit">
            <h2 className="text-center text-gray-500 font-medium mb-1 text-lg">Borewell Status</h2>
            <CircularProgress
              value={healthScore?.score || 0}
              label={t('dashboard.subtitle') || "Health Score"}
              subLabel={t('alerts.allSystemsNormal') || "System operating normally"}
            />
          </div>

          {/* Quick Actions */}
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-4">{t('dashboard.actions') || "Quick Actions"}</h2>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={handleIrrigateNow}
                disabled={irrigationStatus?.is_irrigating}
                className={`p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center gap-2 transition-all ${irrigationStatus?.is_irrigating ? 'bg-blue-50 text-blue-400' : 'bg-white hover:bg-blue-50 text-blue-600'}`}
              >
                <div className={`p-3 rounded-full ${irrigationStatus?.is_irrigating ? 'bg-blue-100' : 'bg-blue-100'}`}>
                  <Droplet className="w-6 h-6" />
                </div>
                <span className="font-medium text-sm">{irrigationStatus?.is_irrigating ? t('dashboard.irrigating') : t('dashboard.startWatering')}</span>
              </button>

              <button
                onClick={handleSurvivalMode}
                className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center gap-2 hover:bg-orange-50 transition-all text-orange-600"
              >
                <div className="p-3 rounded-full bg-orange-100">
                  <Shield className="w-6 h-6" />
                </div>
                <span className="font-medium text-sm">{t('dashboard.saveWater')}</span>
              </button>
            </div>
          </div>

          {/* Pulse Indicator (Conditional) - Moved here for PC layout flow */}
          <div className="hidden md:block">
            <PulseIrrigationIndicator
              isActive={irrigationStatus?.is_irrigating || false}
              mode={irrigationStatus?.mode || 'off'}
            />
          </div>
        </div>

        {/* Right Column: Sensors & Indicators */}
        <div className="md:col-span-8 space-y-6">

          {/* Mobile-only Pulse Indicator location */}
          <div className="md:hidden">
            <PulseIrrigationIndicator
              isActive={irrigationStatus?.is_irrigating || false}
              mode={irrigationStatus?.mode || 'off'}
            />
          </div>

          {/* Live Sensors Grid */}
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-4">{t('dashboard.title') || "Live Sensors"}</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">

              {/* Water Level */}
              <MetricCard
                icon={Droplet}
                title={t('dashboard.waterLevel')}
                value={sensorData?.water_level ?? '--'}
                unit="%"
                progressValue={sensorData?.water_level || 0}
                statusColor="bg-green-500"
                iconBg="bg-green-50"
              />

              {/* Flow Rate */}
              <MetricCard
                icon={Waves}
                title={t('dashboard.flowRate')}
                value={sensorData?.flow_rate ?? '--'}
                unit="L/min"
                statusColor="bg-green-500"
                iconBg="bg-blue-50"
              />

              {/* Turbidity */}
              <MetricCard
                icon={Activity} // Eye icon replacement
                title={t('dashboard.waterQuality')}
                value={sensorData?.turbidity ?? '--'}
                unit="% clear"
                progressValue={sensorData?.turbidity || 0}
                statusColor="bg-green-500"
                iconBg="bg-gray-100"
              />

              {/* Vibration / Pump Status */}
              <MetricCard
                icon={Activity}
                title={t('dashboard.pumpStatus')}
                value=""
                subtext={sensorData?.vibration_status === 'low' ? t('dashboard.normal') : t('dashboard.alert')}
                statusColor={sensorData?.vibration_status === 'low' ? 'bg-green-500' : 'bg-red-500'}
                iconBg="bg-green-50"
              />

              {/* Soil Moisture */}
              <MetricCard
                icon={Sprout}
                title={t('dashboard.soilMoisture')}
                value={sensorData?.soil_moisture ?? '--'}
                unit="%"
                progressValue={sensorData?.soil_moisture || 0}
                statusColor="bg-amber-500"
                iconBg="bg-orange-50"
              />

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};