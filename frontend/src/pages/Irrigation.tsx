import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { useRealSensorData } from '@/hooks/useRealSensorData';
import { useToast } from '@/components/ui/use-toast';
import { apiService } from '@/services/api';
import { formatTime, formatDuration } from '@/utils/dateFormatter';
import { useQuery } from '@tanstack/react-query';
import { Droplet, Play, Pause, Timer, Settings, Clock, Activity, Shield } from 'lucide-react';
import { PulseIrrigationIndicator } from '@/components/PulseIrrigationIndicator';

export const Irrigation: React.FC = () => {
  const { t } = useTranslation();
  const { irrigationStatus, updateIrrigation } = useRealSensorData();

  const [duration, setDuration] = useState([5]); // Minutes, using array for Slider component
  const [isStarting, setIsStarting] = useState(false);

  // Fetch real irrigation history
  const { data: irrigationHistory = [], isLoading: historyLoading } = useQuery({
    queryKey: ['irrigationHistory'],
    queryFn: () => apiService.getIrrigationHistory(10),
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Process session data for display
  const recentSessions = irrigationHistory.map(session => ({
    id: session.id,
    time: formatTime(session.started_at),
    duration: session.duration_minutes || 0,
    volume: session.estimated_volume_liters || 0,
    mode: session.mode,
    status: session.ended_at ? 'completed' : 'active',
    trigger: session.trigger_reason || 'Manual'
  }));

  const { toast } = useToast();
  const [updatingMode, setUpdatingMode] = useState<string | null>(null);

  const handleModeChange = async (mode: 'normal' | 'survival' | 'manual') => {
    setUpdatingMode(mode);
    try {
      if (mode === 'manual') {
        await updateIrrigation({ mode: 'manual', auto_mode: false });
        toast({
          title: t('irrigation.modeUpdated'),
          description: t('irrigation.manualModeActivated'),
          variant: "default",
          className: "bg-agriculture-blue text-white"
        });
      } else {
        await updateIrrigation({ mode, auto_mode: true });
        toast({
          title: t('irrigation.modeUpdated'),
          description: mode === 'normal' ? t('irrigation.normalModeActivated') : t('irrigation.survivalModeActivated'),
          variant: "default",
          className: mode === 'normal' ? "bg-agriculture-green text-white" : "bg-orange-500 text-white"
        });
      }
    } catch (error) {
      console.error('Failed to change mode:', error);
      toast({
        title: t('common.error'),
        description: t('irrigation.failedToUpdateMode'),
        variant: "destructive",
      });
    } finally {
      setUpdatingMode(null);
    }
  };

  const handleStartIrrigation = async () => {
    setIsStarting(true);
    try {
      await updateIrrigation({
        is_irrigating: true,
        mode: 'manual',
        auto_mode: false
      });
      // In a real app, you'd set a timer for the duration
    } catch (error) {
      console.error('Failed to start irrigation:', error);
    } finally {
      setIsStarting(false);
    }
  };

  const getModeColor = (mode: string) => {
    switch (mode) {
      case 'normal': return 'bg-agriculture-green';
      case 'survival': return 'bg-orange-500';
      case 'manual': return 'bg-agriculture-blue';
      default: return 'bg-gray-500';
    }
  };

  const getSessionModeIcon = (mode: string) => {
    switch (mode) {
      case 'survival': return '🛡️';
      case 'manual': return '👤';
      default: return '🤖';
    }
  };

  return (
    <div className="p-4 space-y-6 pb-20">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-2xl font-bold text-agriculture-green">🌿 {t('nav.irrigation')}</h1>
        <p className="text-gray-600 mt-1">{t('irrigation.subtitle')}</p>
      </motion.div>

      {/* Current Mode Display */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <div className="text-sm text-gray-600 mb-2">{t('irrigation.currentMode')}</div>
              <Badge className={`${getModeColor(irrigationStatus?.mode || 'normal')} text-white text-lg px-4 py-2`}>
                {irrigationStatus?.mode === 'normal' ? t('irrigation.normal') :
                  irrigationStatus?.mode === 'survival' ? t('irrigation.survival') :
                    irrigationStatus?.mode === 'manual' ? t('irrigation.manualMode') :
                      (irrigationStatus?.mode?.toUpperCase() || 'NORMAL')}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Mode Toggle Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-agriculture-green">
              <Settings className="h-5 w-5" />
              {t('irrigation.modes')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={() => handleModeChange('normal')}
                disabled={updatingMode !== null}
                variant={irrigationStatus?.mode === 'normal' ? 'default' : 'outline'}
                className={`transition-all duration-200 focus:ring-4 focus:ring-agriculture-green/20 ${irrigationStatus?.mode === 'normal' ? 'bg-agriculture-green hover:bg-agriculture-green/90' : ''}`}
                aria-label="Switch to normal irrigation mode"
              >
                {updatingMode === 'normal' ? <Activity className="h-4 w-4 animate-spin mr-2" /> : '🤖'} {t('irrigation.normal')}
              </Button>
              <Button
                onClick={() => handleModeChange('survival')}
                disabled={updatingMode !== null}
                variant={irrigationStatus?.mode === 'survival' ? 'default' : 'outline'}
                className={irrigationStatus?.mode === 'survival' ? 'bg-orange-500 hover:bg-orange-600' : 'border-orange-500 text-orange-600'}
              >
                {updatingMode === 'survival' ? <Activity className="h-4 w-4 animate-spin mr-2" /> : '🛡️'} {t('irrigation.survival')}
              </Button>
            </div>
            <Button
              onClick={() => handleModeChange('manual')}
              disabled={updatingMode !== null}
              variant={irrigationStatus?.mode === 'manual' ? 'default' : 'outline'}
              className={`w-full ${irrigationStatus?.mode === 'manual' ? 'bg-agriculture-blue hover:bg-agriculture-blue/90' : ''}`}
            >
              {updatingMode === 'manual' ? <Activity className="h-4 w-4 animate-spin mr-2" /> : '👤'} {t('irrigation.manualMode')}
            </Button>
          </CardContent>
        </Card>
      </motion.div>

      {/* Pulse Irrigation Indicator */}
      <PulseIrrigationIndicator
        isActive={irrigationStatus?.is_irrigating || false}
        mode={irrigationStatus?.mode || 'off'}
      />

      {/* Manual Control */}
      {irrigationStatus?.mode === 'manual' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-agriculture-blue">
                <Timer className="h-5 w-5" />
                {t('irrigation.manualControl')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Duration Slider */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium">{t('irrigation.duration')}</span>
                  <span className="text-lg font-bold text-agriculture-blue">{duration[0]} {t('common.min')}</span>
                </div>
                <Slider
                  value={duration}
                  onValueChange={setDuration}
                  max={30}
                  min={3}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>3 min</span>
                  <span>30 min</span>
                </div>
              </div>

              {/* Start Button */}
              <Button
                onClick={handleStartIrrigation}
                disabled={irrigationStatus?.is_irrigating || isStarting}
                className="w-full h-12 text-lg font-bold bg-agriculture-blue hover:bg-agriculture-blue/90"
              >
                {irrigationStatus?.is_irrigating ? (
                  <>
                    <Pause className="h-5 w-5 mr-2" />
                    {t('irrigation.running')}
                  </>
                ) : (
                  <>
                    <Play className="h-5 w-5 mr-2" />
                    {t('irrigation.start')}
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Real-time Pump Status */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${irrigationStatus?.is_irrigating ? 'bg-agriculture-green animate-pulse' : 'bg-gray-300'}`}></div>
                <span className="font-medium">{t('irrigation.pumpStatus')}</span>
              </div>
              <Badge variant={irrigationStatus?.is_irrigating ? 'default' : 'secondary'}>
                {irrigationStatus?.is_irrigating ? t('irrigation.active') : t('irrigation.inactive')}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Recent Sessions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-agriculture-green">
              <Clock className="h-5 w-5" />
              {t('irrigation.recentSessions')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {historyLoading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg animate-pulse">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-gray-300 rounded"></div>
                      <div className="space-y-1">
                        <div className="w-16 h-4 bg-gray-300 rounded"></div>
                        <div className="w-20 h-3 bg-gray-300 rounded"></div>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="w-12 h-4 bg-gray-300 rounded"></div>
                      <div className="w-8 h-3 bg-gray-300 rounded"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : recentSessions.length === 0 ? (
              <div className="text-center py-6 text-gray-500">
                <Timer className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>{t('irrigation.noSessions')}</p>
                <p className="text-sm">{t('irrigation.startFirst')}</p>
              </div>
            ) : (
              recentSessions.map((session, index) => (
                <motion.div
                  key={session.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className="text-sm"
                      role="img"
                      aria-label={`${session.mode} mode irrigation`}
                    >
                      {getSessionModeIcon(session.mode)}
                    </span>
                    <div>
                      <div className="font-medium text-sm flex items-center gap-2">
                        {session.time}
                        {session.status === 'active' && (
                          <Badge variant="default" className="text-xs px-1.5 py-0.5 bg-agriculture-green">
                            ACTIVE
                          </Badge>
                        )}
                      </div>
                      <div className="text-xs text-gray-600">{session.mode} mode • {session.trigger}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-sm">
                      {session.status === 'active' ? 'Running...' : formatDuration(session.duration)}
                    </div>
                    <div className="text-xs text-agriculture-blue">
                      {session.volume > 0 ? `${session.volume}L` : '--'}
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};