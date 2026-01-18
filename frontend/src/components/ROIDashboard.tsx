// ROI Dashboard Component
import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { IndianRupee, TrendingUp, Droplets, Calendar, Target, Award } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

interface CostSavings {
    water_saved_liters: number;
    water_cost_saved: number;
    labor_cost_saved: number;
    total_savings: number;
    efficiency_percent: number;
    daily_savings: number;
    payback_period_days: number;
    payback_period_months: number;
    period_days: number;
}

export const ROIDashboard: React.FC = () => {
    const { data: costSavings, isLoading } = useQuery<CostSavings>({
        queryKey: ['costSavings'],
        queryFn: async () => {
            const baseUrl = import.meta.env.VITE_API_URL || 'https://root-guard-2.onrender.com';
            const response = await fetch(`${baseUrl}/api/analytics/cost-savings?days=7`);
            if (!response.ok) throw new Error('Failed to fetch cost savings');
            return response.json();
        },
        refetchInterval: 60000, // Refresh every minute
    });

    if (isLoading || !costSavings) {
        return (
            <div className="flex items-center justify-center h-48">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-agriculture-green"></div>
            </div>
        );
    }

    const SYSTEM_COST = 20000; // ₹20,000 as per PRD
    const roiPercent = ((costSavings.total_savings / SYSTEM_COST) * 100).toFixed(1);

    return (
        <div className="space-y-4">
            {/* Hero ROI Card */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
            >
                <Card className="bg-gradient-to-br from-agriculture-green via-agriculture-lightGreen to-agriculture-green text-white overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32" />
                    <CardContent className="p-6 relative z-10">
                        <div className="flex items-start justify-between mb-4">
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <IndianRupee className="h-6 w-6" />
                                    <span className="text-lg font-medium opacity-90">Total Savings (7 Days)</span>
                                </div>
                                <motion.div
                                    className="text-5xl font-bold mb-2"
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ delay: 0.2, type: 'spring' }}
                                >
                                    ₹{costSavings.total_savings.toFixed(0)}
                                </motion.div>
                                <div className="text-sm opacity-90">
                                    ₹{costSavings.daily_savings.toFixed(0)}/day average
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="bg-white/20 rounded-full px-4 py-2 backdrop-blur-sm">
                                    <TrendingUp className="h-5 w-5 inline mr-1" />
                                    <span className="font-bold">{roiPercent}%</span>
                                </div>
                                <div className="text-xs mt-1 opacity-80">ROI this week</div>
                            </div>
                        </div>

                        {/* Breakdown */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
                                <Droplets className="h-4 w-4 mb-1 opacity-80" />
                                <div className="text-sm opacity-80">Water Cost Saved</div>
                                <div className="text-xl font-bold">₹{costSavings.water_cost_saved.toFixed(0)}</div>
                            </div>
                            <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
                                <Calendar className="h-4 w-4 mb-1 opacity-80" />
                                <div className="text-sm opacity-80">Labor Saved</div>
                                <div className="text-xl font-bold">₹{costSavings.labor_cost_saved.toFixed(0)}</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Payback Period */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
            >
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-agriculture-green">
                            <Target className="h-5 w-5" />
                            Payback Period
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div>
                                <div className="flex items-baseline gap-2 mb-2">
                                    <span className="text-4xl font-bold text-agriculture-blue">
                                        {costSavings.payback_period_months}
                                    </span>
                                    <span className="text-gray-600">months</span>
                                    <span className="text-sm text-gray-500">
                                        ({costSavings.payback_period_days} days)
                                    </span>
                                </div>
                                <p className="text-sm text-gray-600">
                                    At current savings rate, system cost (₹{SYSTEM_COST.toLocaleString()}) will be recovered in{' '}
                                    <span className="font-bold text-agriculture-green">
                                        {costSavings.payback_period_months} months
                                    </span>
                                </p>
                            </div>

                            {/* Progress bar */}
                            <div className="relative">
                                <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                                    <motion.div
                                        className="h-full bg-gradient-to-r from-agriculture-green to-agriculture-lightGreen"
                                        initial={{ width: '0%' }}
                                        animate={{ width: `${Math.min((costSavings.total_savings / SYSTEM_COST) * 100, 100)}%` }}
                                        transition={{ duration: 1, delay: 0.5 }}
                                    />
                                </div>
                                <div className="flex justify-between text-xs text-gray-600 mt-1">
                                    <span>₹0</span>
                                    <span>₹{costSavings.total_savings.toFixed(0)} saved</span>
                                    <span>₹{SYSTEM_COST.toLocaleString()}</span>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Water Savings */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
            >
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-agriculture-blue">
                            <Droplets className="h-5 w-5" />
                            Water Conservation Impact
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="text-center p-4 bg-blue-50 rounded-lg">
                                <Droplets className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                                <div className="text-3xl font-bold text-blue-600 mb-1">
                                    {costSavings.water_saved_liters.toFixed(0)}L
                                </div>
                                <div className="text-sm text-gray-600">Water Saved</div>
                            </div>
                            <div className="text-center p-4 bg-green-50 rounded-lg">
                                <Award className="h-8 w-8 mx-auto mb-2 text-green-600" />
                                <div className="text-3xl font-bold text-green-600 mb-1">
                                    {costSavings.efficiency_percent}%
                                </div>
                                <div className="text-sm text-gray-600">Efficiency Gain</div>
                            </div>
                        </div>

                        <div className="mt-4 p-3 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200">
                            <p className="text-sm text-gray-700 text-center">
                                🌍 <span className="font-bold">Environmental Impact:</span> Saved water equivalent to{' '}
                                <span className="font-bold text-agriculture-green">
                                    {(costSavings.water_saved_liters / 1000).toFixed(1)} cubic meters
                                </span>{' '}
                                - enough for a family's daily needs!
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Comparison */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
            >
                <Card>
                    <CardHeader>
                        <CardTitle className="text-agriculture-green">📊 vs Manual Irrigation</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                <span className="text-sm text-gray-600">Water Usage</span>
                                <span className="font-bold text-agriculture-green">↓ {costSavings.efficiency_percent}% less</span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                <span className="text-sm text-gray-600">Labor Time</span>
                                <span className="font-bold text-agriculture-green">↓ 80% reduction</span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                <span className="text-sm text-gray-600">Crop Yield</span>
                                <span className="font-bold text-agriculture-green">↑ 15-20% improvement</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
};
