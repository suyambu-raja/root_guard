import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart, LineChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { IndianRupee, TrendingUp, Droplets, Calendar, Download, Activity, Zap } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { apiService } from '@/services/api';
import { format, subDays, startOfDay } from 'date-fns';
import { ROIDashboard } from '@/components/ROIDashboard';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';



export const Analytics: React.FC = () => {
  const { t } = useTranslation();

  // Fetch real sensor history
  const { data: sensorHistory = [], isLoading: sensorsLoading } = useQuery({
    queryKey: ['sensorHistory'],
    queryFn: () => apiService.getSensorHistory(100),
    refetchInterval: 30000,
  });

  // Fetch irrigation history
  const { data: irrigationHistory = [], isLoading: irrigationLoading } = useQuery({
    queryKey: ['irrigationHistory'],
    queryFn: () => apiService.getIrrigationHistory(50),
    refetchInterval: 30000,
  });

  // Process sensor data for health trend chart
  const healthTrendData = useMemo(() => {
    if (!sensorHistory.length) return [];

    // Group by hour and calculate average health score
    const last24Hours = sensorHistory.slice(0, 24).reverse();
    return last24Hours.map((reading, index) => {
      // Calculate health score from sensor data
      const waterScore = reading.water_level * 0.25;
      const turbidityScore = reading.turbidity * 0.25;
      const vibrationScore = (reading.vibration_status === 'low' ? 100 : 30) * 0.25;
      const flowScore = Math.min((reading.flow_rate / 15) * 100, 100) * 0.25;
      const score = Math.round(waterScore + turbidityScore + vibrationScore + flowScore);

      return {
        time: format(new Date(reading.timestamp), 'HH:mm'),
        score: score,
        moisture: reading.soil_moisture
      };
    });
  }, [sensorHistory]);

  // Process irrigation data for water usage chart
  const waterUsageData = useMemo(() => {
    if (!irrigationHistory.length) return [];

    // Group by day for last 7 days
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = subDays(new Date(), 6 - i);
      return {
        day: days[date.getDay()],
        date: startOfDay(date),
        waterUsage: 0,
        sessions: 0
      };
    });

    irrigationHistory.forEach(session => {
      const sessionDate = startOfDay(new Date(session.started_at));
      const dayData = last7Days.find(d => d.date.getTime() === sessionDate.getTime());
      if (dayData && session.estimated_volume_liters) {
        dayData.waterUsage += session.estimated_volume_liters;
        dayData.sessions += 1;
      }
    });

    return last7Days.map(d => ({
      day: d.day,
      fullDate: d.date,
      waterUsage: Math.round(d.waterUsage),
      sessions: d.sessions
    }));
  }, [irrigationHistory]);

  // Calculate statistics
  const stats = useMemo(() => {
    const totalWater = irrigationHistory.reduce((sum, s) => sum + (s.estimated_volume_liters || 0), 0);
    const totalSessions = irrigationHistory.length;
    const avgPerSession = totalSessions > 0 ? totalWater / totalSessions : 0;

    // Estimate savings (assuming 30% efficiency improvement)
    const estimatedSavings = totalWater * 0.3;
    const costPerLiter = 0.05; // ₹0.05 per liter
    const moneySaved = Math.round(estimatedSavings * costPerLiter);

    return {
      totalWater: Math.round(totalWater),
      totalSessions,
      avgPerSession: Math.round(avgPerSession),
      waterSaved: Math.round(estimatedSavings),
      moneySaved,
      efficiency: 30
    };
  }, [irrigationHistory]);

  // Soil moisture trend
  const soilMoistureData = useMemo(() => {
    return sensorHistory.slice(0, 20).reverse().map((reading, index) => ({
      time: format(new Date(reading.timestamp), 'HH:mm'),
      moisture: reading.soil_moisture,
      optimal: 65 // Optimal level
    }));
  }, [sensorHistory]);



  const handleExportPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;

    // Header
    doc.setFillColor(46, 125, 50); // agriculture-green
    doc.rect(0, 0, pageWidth, 40, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.text(t('nav.analytics'), 14, 20);
    doc.setFontSize(12);
    doc.text(`${t('analytics.weeklyReport')} - ${format(new Date(), 'PP')}`, 14, 30);
    doc.text('RootGuard Bot', pageWidth - 14, 20, { align: 'right' });

    // Summary Section
    doc.setTextColor(60, 60, 60);
    doc.setFontSize(14);
    doc.text(t('analytics.thisWeekSaved'), 14, 55);

    doc.setFontSize(12);
    doc.text(`${t('analytics.waterSaved')}: ${stats.waterSaved}L`, 14, 65);
    doc.text(`${t('analytics.improvement')}: ${stats.efficiency}%`, 14, 75);
    doc.text(`${t('analytics.totalSessions')}: ${stats.totalSessions}`, 100, 65);
    doc.text(`Total Water Used: ${stats.totalWater}L`, 100, 75);

    // Table Data
    const tableData = waterUsageData.map((day, index) => [
      format(day.fullDate, 'MMM dd'),
      `${day.waterUsage} L`,
      day.sessions,
      `${soilMoistureData[index]?.moisture ? soilMoistureData[index].moisture.toFixed(1) : '-'} %`,
      healthTrendData[index]?.score || '-'
    ]);

    // Generate Table
    autoTable(doc, {
      startY: 90,
      head: [['Date', 'Water Usage', 'Sessions', 'Soil Moisture', 'Health Score']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [46, 125, 50], textColor: 255 },
      styles: { fontSize: 10, cellPadding: 3 },
      alternateRowStyles: { fillColor: [240, 248, 240] }
    });

    // Footer
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(10);
      doc.setTextColor(150);
      doc.text(`Page ${i} of ${pageCount}`, pageWidth / 2, doc.internal.pageSize.height - 10, { align: 'center' });
    }

    // Save
    doc.save(`rootguard-report-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
  };

  const isLoading = sensorsLoading || irrigationLoading;

  return (
    <div className="p-4 space-y-6 pb-20">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-2xl font-bold text-agriculture-green">📈 {t('nav.analytics')}</h1>
        <p className="text-gray-600 mt-1">{t('analytics.subtitle')}</p>
      </motion.div>

      {/* ROI Dashboard Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.05 }}
      >
        <ROIDashboard />
      </motion.div>

      {/* Weekly Savings Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        <Card className="bg-gradient-to-r from-agriculture-green to-agriculture-lightGreen text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <IndianRupee className="h-6 w-6" />
                  <span className="text-lg font-medium">{t('analytics.thisWeekSaved')}</span>
                </div>
                <div className="text-3xl font-bold">₹{stats.moneySaved}</div>
                <div className="text-sm opacity-90 mt-1">{stats.efficiency}% {t('analytics.improvement')}</div>
              </div>
              <div className="text-right">
                <div className="text-sm opacity-90">{t('analytics.totalSessions')}</div>
                <div className="text-2xl font-bold">{stats.totalSessions}</div>
                <div className="text-sm opacity-90">{stats.totalWater}L {t('analytics.waterUsed')}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Health Score Trend */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-agriculture-green">
              <TrendingUp className="h-5 w-5" />
              {t('analytics.healthTrend')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-[200px] flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-agriculture-green"></div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={healthTrendData}>
                  <defs>
                    <linearGradient id="healthGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2E7D32" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#2E7D32" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="score"
                    stroke="#2E7D32"
                    strokeWidth={3}
                    fill="url(#healthGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Soil Moisture Trend */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.25 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-agriculture-blue">
              <Activity className="h-5 w-5" />
              {t('analytics.soilTrend')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-[200px] flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-agriculture-blue"></div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={soilMoistureData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="moisture"
                    stroke="#1976D2"
                    strokeWidth={3}
                    dot={{ fill: '#1976D2', r: 3 }}
                    name="Soil Moisture"
                  />
                  <Line
                    type="monotone"
                    dataKey="optimal"
                    stroke="#4CAF50"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={false}
                    name="Optimal Level"
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Weekly Water Usage */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-agriculture-blue">
              <Droplets className="h-5 w-5" />
              {t('analytics.dailyUsage')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-[200px] flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-agriculture-blue"></div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={waterUsageData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="waterUsage" fill="#1976D2" name="Water Used (L)" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Efficiency Stats */}
      <div className="grid grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Card>
            <CardContent className="p-4 text-center">
              <Zap className="h-6 w-6 mx-auto mb-2 text-agriculture-green" />
              <div className="text-2xl font-bold text-agriculture-green mb-1">{stats.efficiency}%</div>
              <div className="text-xs text-gray-600">{t('analytics.efficiency')}</div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.45 }}
        >
          <Card>
            <CardContent className="p-4 text-center">
              <Droplets className="h-6 w-6 mx-auto mb-2 text-blue-600" />
              <div className="text-2xl font-bold text-blue-600 mb-1">{stats.waterSaved}L</div>
              <div className="text-xs text-gray-600">{t('analytics.waterSaved')}</div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <Card>
            <CardContent className="p-4 text-center">
              <Activity className="h-6 w-6 mx-auto mb-2 text-agriculture-blue" />
              <div className="text-2xl font-bold text-agriculture-blue mb-1">{stats.avgPerSession}L</div>
              <div className="text-xs text-gray-600">{t('analytics.avgSession')}</div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Export Report */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.55 }}
      >
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-agriculture-green" />
                <div>
                  <div className="font-medium">{t('analytics.weeklyReport')}</div>
                  <div className="text-sm text-gray-600">{t('analytics.exportDesc')}</div>
                </div>
              </div>
              <Button
                onClick={handleExportPDF}
                className="bg-agriculture-green hover:bg-agriculture-green/90"
                disabled={isLoading}
              >
                <Download className="h-4 w-4 mr-2" />
                Export PDF
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};