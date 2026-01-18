import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, CheckCircle, Info, Clock, Shield, X } from 'lucide-react';
import { useRealSensorData } from '@/hooks/useRealSensorData';
import { useToast } from '@/components/ui/use-toast';
import { formatTime, formatRelativeTime, getTimeAriaLabel } from '@/utils/dateFormatter';

interface ExtendedAlert {
  id: number;
  alert_type: 'critical' | 'warning' | 'info';
  message: string;
  created_at: string;
  is_dismissed: boolean;
  time?: string;
  actions?: string[];
}

export const Alerts: React.FC = () => {
  const { t } = useTranslation();
  const { alerts = [], dismissAlert, updateIrrigation } = useRealSensorData();

  // Process real alerts with proper datetime formatting
  const processedAlerts: ExtendedAlert[] = alerts.map(alert => ({
    ...alert,
    time: formatTime(alert.created_at),
    actions: getAlertActions(alert)
  }));

  // Add some demo alerts if no real ones exist
  const enhancedAlerts: ExtendedAlert[] = processedAlerts.length > 0 ? processedAlerts : [
    {
      id: 1,
      alert_type: 'critical',
      message: 'Health score: 45/100',
      created_at: new Date(Date.now() - 5 * 60 * 1000).toISOString(), // 5 minutes ago
      time: formatTime(new Date(Date.now() - 5 * 60 * 1000)),
      is_dismissed: false,
      actions: ['RESOLVE', 'SURVIVAL MODE']
    },
    {
      id: 2,
      alert_type: 'warning',
      message: 'Vibration detected',
      created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
      time: formatTime(new Date(Date.now() - 30 * 60 * 1000)),
      is_dismissed: false,
      actions: ['MARK FIXED']
    },
    {
      id: 3,
      alert_type: 'info',
      message: 'Daily water: 150L saved',
      created_at: new Date(Date.now() - 45 * 60 * 1000).toISOString(), // 45 minutes ago
      time: formatTime(new Date(Date.now() - 45 * 60 * 1000)),
      is_dismissed: true,
      actions: []
    }
  ];

  // Helper function to determine actions for each alert type
  function getAlertActions(alert: any): string[] {
    switch (alert.alert_type) {
      case 'critical':
        return ['RESOLVE', 'SURVIVAL MODE'];
      case 'warning':
        return ['MARK FIXED'];
      case 'info':
        return [];
      default:
        return [];
    }
  }

  const [dismissingAlert, setDismissingAlert] = useState<number | null>(null);

  const newAlerts = enhancedAlerts.filter(alert => !alert.is_dismissed);
  const newAlertsCount = newAlerts.length;

  const handleDismissAlert = async (alertId: number) => {
    setDismissingAlert(alertId);
    try {
      await dismissAlert(alertId);
    } catch (error) {
      console.error('Failed to dismiss alert:', error);
    } finally {
      setDismissingAlert(null);
    }
  };

  const { toast } = useToast();

  const handleSurvivalMode = async () => {
    try {
      await updateIrrigation({ mode: 'survival', auto_mode: true });
      toast({
        title: t('irrigation.modeUpdated'),
        description: t('irrigation.survivalModeActivated'),
        variant: "default",
        className: "bg-orange-500 text-white"
      });
    } catch (error) {
      console.error('Failed to activate survival mode:', error);
      toast({
        title: t('common.error'),
        description: t('irrigation.failedToUpdateMode'),
        variant: "destructive",
      });
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'critical': return '🔴';
      case 'warning': return '🟡';
      case 'info': return 'ℹ️';
      default: return '⚠️';
    }
  };

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'critical': return 'border-red-500 bg-red-50';
      case 'warning': return 'border-yellow-500 bg-yellow-50';
      case 'info': return 'border-blue-500 bg-blue-50';
      default: return 'border-gray-300 bg-gray-50';
    }
  };

  const getTimeColor = (type: string) => {
    switch (type) {
      case 'critical': return 'text-red-600';
      case 'warning': return 'text-yellow-600';
      case 'info': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  const getTranslatedMessage = (message: string): string => {
    try {
      // Try to parse as JSON first
      const data = JSON.parse(message);

      // Check if it's our structured alert format
      if (data && data.key) {
        // Handle nested translation (for reasons)
        if (data.params && data.params.reason_key) {
          const reasonText = t(`alerts.${data.params.reason_key}`, data.params.reason_params) as string;
          return t(`alerts.${data.key}`, { ...data.params, reason: reasonText }) as string;
        }

        // Standard translation
        return t(`alerts.${data.key}`, data.params) as string;
      }

      return message;
    } catch (e) {
      // Not JSON, return original string (backward compatibility)
      return message;
    }
  };


  return (
    <div className="p-4 space-y-6 pb-20">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-2xl font-bold text-agriculture-green">🔔 {t('nav.alerts')}</h1>
        <p className="text-gray-600 mt-1">{t('alerts.subtitle')}</p>
      </motion.div>

      {/* Alert Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        <Card className={newAlertsCount > 0 ? 'border-red-200 bg-red-50' : 'border-green-200 bg-green-50'}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {newAlertsCount > 0 ? (
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                ) : (
                  <CheckCircle className="h-6 w-6 text-green-600" />
                )}
                <div>
                  <div className={`font-bold ${newAlertsCount > 0 ? 'text-red-800' : 'text-green-800'}`}>
                    🔔 {newAlertsCount} {t('alerts.newAlerts')}
                  </div>
                  <div className={`text-sm ${newAlertsCount > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {newAlertsCount > 0 ? t('alerts.attentionRequired') : t('alerts.allSystemsNormal')}
                  </div>
                </div>
              </div>
              {newAlertsCount > 0 && (
                <Badge variant="destructive" className="text-lg px-3 py-1">
                  {newAlertsCount}
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Active Alerts */}
      <div className="space-y-4">
        {newAlertsCount === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertTitle className="text-green-800">{t('alerts.allSystemsNormal')}</AlertTitle>
              <AlertDescription className="text-green-700">
                {t('alerts.noActiveAlerts')}
              </AlertDescription>
            </Alert>
          </motion.div>
        ) : (
          newAlerts.map((alert, index) => (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <Card className={`border-2 ${getAlertColor(alert.alert_type)}`}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{getAlertIcon(alert.alert_type)}</span>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Badge
                            variant={alert.alert_type === 'critical' ? 'destructive' :
                              alert.alert_type === 'warning' ? 'secondary' : 'default'}
                          >
                            {alert.alert_type.toUpperCase()}
                          </Badge>
                          <span
                            className={`text-sm ${getTimeColor(alert.alert_type)} flex items-center gap-1`}
                            title={getTimeAriaLabel(alert.created_at)}
                            aria-label={`Created ${getTimeAriaLabel(alert.created_at)}`}
                          >
                            <Clock className="h-3 w-3" />
                            {alert.time}
                            <span className="sr-only">({formatRelativeTime(alert.created_at)})</span>
                          </span>
                        </div>
                        <p className="font-medium text-gray-800">{getTranslatedMessage(alert.message)}</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDismissAlert(alert.id)}
                      disabled={dismissingAlert === alert.id}
                      className="text-gray-500 hover:text-red-600 focus:ring-2 focus:ring-red-500/20 transition-all duration-200"
                      aria-label={`Dismiss ${alert.alert_type} alert: ${alert.message}`}
                    >
                      {dismissingAlert === alert.id ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                      ) : (
                        <X className="h-4 w-4" />
                      )}
                    </Button>
                  </div>

                  {/* Action Buttons */}
                  {alert.actions && alert.actions.length > 0 && (
                    <div className="flex gap-2 mt-3">
                      {alert.actions.map((action, actionIndex) => (
                        <Button
                          key={actionIndex}
                          variant={action === 'SURVIVAL MODE' ? 'default' : 'outline'}
                          size="sm"
                          onClick={action === 'SURVIVAL MODE' ? handleSurvivalMode : undefined}
                          className={
                            action === 'SURVIVAL MODE'
                              ? 'bg-orange-500 hover:bg-orange-600 text-white'
                              : action === 'RESOLVE'
                                ? 'border-red-500 text-red-600 hover:bg-red-50'
                                : 'border-yellow-500 text-yellow-600 hover:bg-yellow-50'
                          }
                        >
                          {action === 'SURVIVAL MODE' && <Shield className="h-3 w-3 mr-1" />}
                          {action}
                        </Button>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))
        )}
      </div>

      {/* Resolved Alerts History */}
      {enhancedAlerts.some(alert => alert.is_dismissed) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-600">
                <CheckCircle className="h-5 w-5" />
                {t('alerts.resolvedAlerts')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {enhancedAlerts
                .filter(alert => alert.is_dismissed)
                .slice(0, 3)
                .map((alert, index) => (
                  <div key={alert.id} className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                    <span className="text-sm">✓</span>
                    <div className="flex-1">
                      <div className="text-sm text-gray-700">{getTranslatedMessage(alert.message)}</div>
                      <div className="text-xs text-gray-500">{alert.time} • {t('alerts.resolved')}</div>
                    </div>
                  </div>
                ))}
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
};