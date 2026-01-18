// 2026 Glassmorphism Health Meter with Hero Gradient
import React from 'react';
import { motion } from 'framer-motion';

interface HealthMeterGlassProps {
  healthScore: number;
  size?: number;
}

export const HealthMeterGlass: React.FC<HealthMeterGlassProps> = ({ 
  healthScore, 
  size = 200 
}) => {
  // Dynamic gradient based on health score
  const getHealthGradient = (score: number) => {
    if (score >= 80) return 'from-success-from to-success-to';
    if (score >= 60) return 'from-warning-from to-warning-to';
    return 'from-critical-from to-critical-to';
  };

  const getGlowColor = (score: number) => {
    if (score >= 80) return 'shadow-glow-green';
    if (score >= 60) return 'shadow-[0px_0px_30px_rgba(255,154,0,0.6)]';
    return 'shadow-glow-critical';
  };

  const circumference = 2 * Math.PI * 90; // r=90
  const strokeDashoffset = circumference - (healthScore / 100) * circumference;

  return (
    <div className="flex items-center justify-center">
      <motion.div
        className={`relative rounded-full p-8 bg-gradient-to-br ${getHealthGradient(healthScore)} ${getGlowColor(healthScore)} animate-pulse-glow`}
        style={{ width: size, height: size }}
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      >
        {/* Glass overlay */}
        <div className="absolute inset-0 rounded-full bg-white/20 backdrop-blur-xl border border-white/30" />
        
        {/* Floating particles */}
        <div className="absolute inset-0 rounded-full overflow-hidden">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-white/50 rounded-full"
              style={{
                left: `${20 + (i * 15)}%`,
                top: `${30 + (i * 10)}%`,
              }}
              animate={{
                y: [-10, 10, -10],
                opacity: [0.3, 0.8, 0.3],
              }}
              transition={{
                duration: 2 + i * 0.3,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
          ))}
        </div>

        {/* SVG Circle */}
        <svg
          className="absolute inset-0 w-full h-full transform -rotate-90"
          viewBox="0 0 200 200"
        >
          {/* Background circle */}
          <circle
            cx="100"
            cy="100"
            r="90"
            fill="none"
            stroke="rgba(255,255,255,0.2)"
            strokeWidth="8"
            strokeLinecap="round"
          />
          
          {/* Progress circle */}
          <motion.circle
            cx="100"
            cy="100"
            r="90"
            fill="none"
            stroke="rgba(255,255,255,0.9)"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
            filter="drop-shadow(0 0 10px rgba(255,255,255,0.5))"
          />
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white">
            <motion.div
              className="text-4xl font-bold mb-1"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, duration: 0.6 }}
            >
              {healthScore}
            </motion.div>
            <motion.div
              className="text-sm font-medium opacity-90"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.4 }}
            >
              Health Score
            </motion.div>
            <motion.div
              className="text-xs opacity-75"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.0, duration: 0.4 }}
            >
              {healthScore >= 80 ? 'Excellent' : 
               healthScore >= 60 ? 'Good' : 
               healthScore >= 40 ? 'Warning' : 'Critical'}
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};