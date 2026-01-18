// src/hooks/useRealSensorData.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '@/services/api';
import { SensorData, HealthScore, IrrigationStatus, Alert } from '@/types';
import { useOnlineStatus } from './useOnlineStatus';
import { useState } from 'react';

export const useRealSensorData = () => {
  const queryClient = useQueryClient();
  const isOnline = useOnlineStatus();
  // Enable auto-refresh by default as requested, 15 seconds interval
  const [autoRefresh, setAutoRefresh] = useState(true);
  const REFRESH_INTERVAL = 10000; // 10 seconds

  // Fetch sensor data
  const sensorQuery = useQuery<SensorData>({
    queryKey: ['sensorData'],
    queryFn: async () => {
      try {
        const data = await apiService.getLatestSensorData();
        return data;
      } catch (error) {
        console.error('Error fetching sensor data:', error);
        throw error;
      }
    },
    enabled: isOnline,
    refetchInterval: autoRefresh ? REFRESH_INTERVAL : false,
    retry: (failureCount, error) => {
      // Don't retry if it's a connection error
      if (error?.message?.includes('Unable to connect')) {
        return false;
      }
      return failureCount < 2;
    },
  });

  // Fetch health score
  const healthQuery = useQuery<HealthScore>({
    queryKey: ['healthScore'],
    queryFn: async () => {
      try {
        const data = await apiService.getHealthScore();
        console.log('Fetched health score:', data);
        return data;
      } catch (error) {
        console.error('Error fetching health score:', error);
        throw error;
      }
    },
    enabled: isOnline,
    refetchInterval: autoRefresh ? REFRESH_INTERVAL : false,
    retry: (failureCount, error) => {
      if (error?.message?.includes('Unable to connect')) return false;
      return failureCount < 2;
    },
  });

  // Fetch irrigation status
  const irrigationQuery = useQuery<IrrigationStatus>({
    queryKey: ['irrigationStatus'],
    queryFn: apiService.getIrrigationStatus,
    enabled: isOnline,
    refetchInterval: autoRefresh ? REFRESH_INTERVAL : false,
    retry: (failureCount, error) => {
      if (error?.message?.includes('Unable to connect')) return false;
      return failureCount < 2;
    },
  });

  // Fetch alerts
  const alertsQuery = useQuery<Alert[]>({
    queryKey: ['alerts'],
    queryFn: () => apiService.getActiveAlerts(10),
    enabled: isOnline,
    refetchInterval: autoRefresh ? REFRESH_INTERVAL : false,
    retry: (failureCount, error) => {
      if (error?.message?.includes('Unable to connect')) return false;
      return failureCount < 2;
    },
  });

  // Update irrigation
  const updateIrrigation = useMutation({
    mutationFn: (data: { mode?: 'normal' | 'survival' | 'manual' | 'off'; is_irrigating?: boolean; auto_mode?: boolean }) =>
      apiService.updateIrrigationControl(data),
    onSuccess: (newItem) => {
      queryClient.setQueryData(['irrigationStatus'], newItem);
      queryClient.invalidateQueries({ queryKey: ['irrigationStatus'] });
    },
  });

  // Dismiss alert
  const dismissAlert = useMutation({
    mutationFn: (alertId: number) => apiService.dismissAlert(alertId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
    },
  });

  // Refresh all data
  const refreshData = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['sensorData'] }),
      queryClient.invalidateQueries({ queryKey: ['healthScore'] }),
      queryClient.invalidateQueries({ queryKey: ['irrigationStatus'] }),
      queryClient.invalidateQueries({ queryKey: ['alerts'] }),
    ]);
  };

  return {
    sensorData: sensorQuery.data,
    healthScore: healthQuery.data,
    irrigationStatus: irrigationQuery.data,
    alerts: alertsQuery.data || [],
    isLoading: sensorQuery.isLoading || healthQuery.isLoading ||
      irrigationQuery.isLoading || alertsQuery.isLoading,
    isHealthLoading: healthQuery.isLoading, // Explicit loading state for health
    error: sensorQuery.error || healthQuery.error ||
      irrigationQuery.error || alertsQuery.error,
    refreshData,
    updateIrrigation: updateIrrigation.mutateAsync,
    dismissAlert: dismissAlert.mutateAsync,
    autoRefresh,
    setAutoRefresh,
  };
};