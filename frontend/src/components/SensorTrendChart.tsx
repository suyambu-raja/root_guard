import React from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, ResponsiveContainer } from 'recharts';

interface SensorTrendChartProps {
    data: Array<{ value: number; timestamp: string }>;
    color?: string;
    height?: number;
}

export const SensorTrendChart: React.FC<SensorTrendChartProps> = ({
    data,
    color = '#2E7D32',
    height = 40
}) => {
    // Take last 20 data points for mini chart
    const chartData = data.slice(-20).map(d => ({ value: d.value }));

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="w-full"
        >
            <ResponsiveContainer width="100%" height={height}>
                <LineChart data={chartData}>
                    <Line
                        type="monotone"
                        dataKey="value"
                        stroke={color}
                        strokeWidth={2}
                        dot={false}
                        isAnimationActive={true}
                    />
                </LineChart>
            </ResponsiveContainer>
        </motion.div>
    );
};
