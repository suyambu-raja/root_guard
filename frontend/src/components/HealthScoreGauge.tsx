import { motion } from 'framer-motion';
import { HealthScore } from '@/types';

interface HealthScoreGaugeProps {
  healthScore: HealthScore;
}

export const HealthScoreGauge = ({ healthScore }: HealthScoreGaugeProps) => {
  const { score, status, message } = healthScore;
  
  const circumference = 2 * Math.PI * 45; // radius = 45
  const progress = ((100 - score) / 100) * circumference;
  
  const getGradientColors = () => {
    switch (status) {
      case 'normal':
        return { start: 'hsl(142, 76%, 36%)', end: 'hsl(152, 65%, 42%)' };
      case 'warning':
        return { start: 'hsl(38, 92%, 50%)', end: 'hsl(45, 90%, 55%)' };
      case 'critical':
        return { start: 'hsl(0, 72%, 51%)', end: 'hsl(10, 75%, 55%)' };
    }
  };
  
  const colors = getGradientColors();
  const gradientId = `health-gradient-${status}`;
  
  return (
    <div className="flex flex-col items-center">
      <div className="relative w-40 h-40">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={colors.start} />
              <stop offset="100%" stopColor={colors.end} />
            </linearGradient>
          </defs>
          
          {/* Background circle */}
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            className="text-muted"
          />
          
          {/* Progress circle */}
          <motion.circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke={`url(#${gradientId})`}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: progress }}
            transition={{ duration: 1.5, ease: "easeOut" }}
          />
        </svg>
        
        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            key={score}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-4xl font-display font-bold"
            style={{ color: colors.start }}
          >
            {score}
          </motion.span>
          <span className="text-sm text-muted-foreground font-medium">Health Score</span>
        </div>
      </div>
      
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`mt-4 px-4 py-2 rounded-full text-sm font-semibold ${
          status === 'normal' 
            ? 'bg-success/10 text-success' 
            : status === 'warning' 
            ? 'bg-warning/10 text-warning' 
            : 'bg-destructive/10 text-destructive'
        }`}
      >
        {status === 'normal' ? '✓ ' : status === 'warning' ? '⚠ ' : '⚠ '}
        {message}
      </motion.div>
    </div>
  );
};
