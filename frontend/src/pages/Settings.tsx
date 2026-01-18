import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { Globe, Bell, Wifi, Database, CheckCircle, AlertTriangle, Smartphone, Tractor, TestTube } from 'lucide-react';

export const Settings: React.FC = () => {
  const { t } = useTranslation();

  // Farm settings state
  const [farmSettings, setFarmSettings] = useState({
    farmName: 'Ramaswamy Farm',
    borewellDepth: '150',
    cropType: 'sugarcane',
    location: 'Thoothukudi, Tamil Nadu'
  });

  // Notification settings
  const [notifications, setNotifications] = useState({
    critical: true,
    warning: true,
    sms: false,
    pushEnabled: true
  });

  // Threshold settings
  const [thresholds, setThresholds] = useState({
    dryLevel: '40',
    optimalLevel: '65'
  });

  // Connection settings
  const [piSettings, setPiSettings] = useState({
    ip: '192.168.1.100',
    port: '8000',
    status: 'connected'
  });

  const [testingConnection, setTestingConnection] = useState(false);

  const handleTestConnection = async () => {
    setTestingConnection(true);
    // Simulate connection test
    setTimeout(() => {
      setTestingConnection(false);
      // In real app, this would actually test the Pi connection
    }, 2000);
  };

  const cropOptions = [
    { value: 'sugarcane', label: '🌾 Sugarcane', icon: '🌾' },
    { value: 'rice', label: '🌾 Rice', icon: '🌾' },
    { value: 'cotton', label: '🌱 Cotton', icon: '🌱' },
    { value: 'wheat', label: '🌾 Wheat', icon: '🌾' },
    { value: 'corn', label: '🌽 Corn', icon: '🌽' }
  ];

  return (
    <div className="p-4 space-y-6 pb-20">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-2xl font-bold text-agriculture-green">⚙️ {t('nav.settings')}</h1>
        <p className="text-gray-600 mt-1">{t('settings.subtitle')}</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="space-y-4"
      >
        {/* Farm Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-agriculture-green">
              <Tractor className="h-5 w-5" />
              {t('settings.farmSettings')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="farmName">{t('settings.farmName')}</Label>
              <Input
                id="farmName"
                value={farmSettings.farmName}
                onChange={(e) => setFarmSettings(prev => ({ ...prev, farmName: e.target.value }))}
                className="font-medium"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="borewellDepth">{t('settings.borewellDepth')}</Label>
              <Input
                id="borewellDepth"
                value={farmSettings.borewellDepth}
                onChange={(e) => setFarmSettings(prev => ({ ...prev, borewellDepth: e.target.value }))}
                className="font-medium"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cropType">{t('settings.cropType')}</Label>
              <Select
                value={farmSettings.cropType}
                onValueChange={(value) => setFarmSettings(prev => ({ ...prev, cropType: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {cropOptions.map((crop) => (
                    <SelectItem key={crop.value} value={crop.value}>
                      {crop.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">{t('settings.location')}</Label>
              <Input
                id="location"
                value={farmSettings.location}
                onChange={(e) => setFarmSettings(prev => ({ ...prev, location: e.target.value }))}
                className="font-medium"
              />
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-agriculture-green">
              <Bell className="h-5 w-5" />
              {t('settings.notifications')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <span className="font-medium">{t('settings.criticalAlerts')}</span>
              </div>
              <Switch
                checked={notifications.critical}
                onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, critical: checked }))}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <span className="font-medium">{t('settings.warningAlerts')}</span>
              </div>
              <Switch
                checked={notifications.warning}
                onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, warning: checked }))}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Smartphone className="h-4 w-4 text-gray-600" />
                <span className="font-medium">{t('settings.smsAlerts')}</span>
              </div>
              <Switch
                checked={notifications.sms}
                onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, sms: checked }))}
              />
            </div>
          </CardContent>
        </Card>

        {/* Soil Moisture Thresholds */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-agriculture-green">
              <TestTube className="h-5 w-5" />
              {t('settings.thresholds')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dryLevel">{t('settings.dryLevel')}</Label>
                <Input
                  id="dryLevel"
                  value={thresholds.dryLevel}
                  onChange={(e) => setThresholds(prev => ({ ...prev, dryLevel: e.target.value }))}
                  className="font-medium"
                />
                <p className="text-xs text-gray-500">{t('settings.triggerDesc')}</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="optimalLevel">{t('settings.optimalLevel')}</Label>
                <Input
                  id="optimalLevel"
                  value={thresholds.optimalLevel}
                  onChange={(e) => setThresholds(prev => ({ ...prev, optimalLevel: e.target.value }))}
                  className="font-medium"
                />
                <p className="text-xs text-gray-500">{t('settings.targetDesc')}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Language Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-agriculture-green">
              <Globe className="h-5 w-5" />
              {t('settings.language')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{t('settings.interfaceLang')}</p>
                <p className="text-sm text-gray-600">Tamil / English</p>
              </div>
              <LanguageSwitcher />
            </div>
          </CardContent>
        </Card>

        {/* Raspberry Pi Connection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-agriculture-green">
              <Wifi className="h-5 w-5" />
              {t('settings.raspberryPi')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Pi IP: {piSettings.ip}:{piSettings.port}</p>
                <div className="flex items-center gap-2 mt-1">
                  <div className={`w-2 h-2 rounded-full ${piSettings.status === 'connected' ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                  <span className="text-sm text-gray-600 capitalize">{piSettings.status}</span>
                </div>
              </div>
              <Badge variant={piSettings.status === 'connected' ? 'default' : 'destructive'}>
                {piSettings.status === 'connected' ? t('settings.online') : t('settings.offline')}
              </Badge>
            </div>

            <Button
              onClick={handleTestConnection}
              disabled={testingConnection}
              className="w-full bg-agriculture-blue hover:bg-agriculture-blue/90"
            >
              {testingConnection ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {t('settings.testing')}
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  {t('settings.testConnection')}
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* System Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-agriculture-green">
              <Database className="h-5 w-5" />
              {t('settings.systemInfo')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">{t('settings.appVersion')}:</span>
              <span className="font-medium">v1.0.0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">{t('settings.deviceId')}:</span>
              <span className="font-medium">RG-TKD-001</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">{t('settings.project')}:</span>
              <span className="font-medium">Thoothukudi Hackathon 2025</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">{t('settings.team')}:</span>
              <span className="font-medium">Prathyusha Engineering College</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">{t('settings.lastSync')}:</span>
              <span className="font-medium text-agriculture-green">{t('settings.justNow')}</span>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};