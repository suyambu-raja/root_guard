// Large Orange Borewell Maintenance Status Circle
import React from 'react';
import { motion } from 'framer-motion';
import { Wrench, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

interface BorewellMaintenanceProps {
  maintenanceHealth: number;
  pumpEfficiency: number;
  filterCondition: number;
  pipeIntegrity: number;
  electricalSystem: number;
  criticalIssues: string[];
  warnings: string[];
  nextMaintenance: Date;
  size?: number;
}

export const BorewellMaintenanceCircle: React.FC<BorewellMaintenanceProps> = ({ 
  maintenanceHealth,
  pumpEfficiency,
  filterCondition,
  pipeIntegrity,
  electricalSystem,
  criticalIssues,
  warnings,
  nextMaintenance,
  size = 280 
}) => {
  
  // Dynamic color based on maintenance health
  const getMaintenanceColor = (health: number) => {
    if (health >= 80) return { from: '#f97316', to: '#ea580c' }; // Orange - Good
    if (health >= 60) return { from: '#f59e0b', to: '#d97706' }; // Amber - Warning  
    if (health >= 40) return { from: '#ef4444', to: '#dc2626' }; // Red - Poor
    return { from: '#991b1b', to: '#7f1d1d' }; // Dark Red - Critical
  };

  const colors = getMaintenanceColor(maintenanceHealth);
  const circumference = 2 * Math.PI * 100; // r=100
  const strokeDashoffset = circumference - (maintenanceHealth / 100) * circumference;

  // Days until next maintenance
  const daysUntilMaintenance = Math.ceil((nextMaintenance.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

  // Status text
  const getStatusText = (health: number) => {
    if (health >= 80) return 'Excellent';
    if (health >= 60) return 'Good';
    if (health >= 40) return 'Needs Attention';
    return 'Critical';
  };

  const getStatusIcon = (health: number) => {
    if (health >= 80) return CheckCircle;
    if (health >= 40) return AlertTriangle;
    return AlertTriangle;
  };

  const StatusIcon = getStatusIcon(maintenanceHealth);

  return (
    <div className="flex items-center justify-center">
      <motion.div
        className="relative rounded-full p-8"
        style={{ 
          width: size, 
          height: size,
          background: `linear-gradient(135deg, ${colors.from}20, ${colors.to}20)`
        }}
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ duration: 1, ease: 'easeOut' }}
      >
        {/* Glass overlay */}
        <div className="absolute inset-0 rounded-full bg-white/10 backdrop-blur-xl border border-white/20" />
        
        {/* Floating maintenance icons */}
        <div className="absolute inset-0 rounded-full overflow-hidden">
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-3 h-3 rounded-full"
              style={{
                background: `linear-gradient(45deg, ${colors.from}, ${colors.to})`,
                left: `${20 + (i * 10)}%`,
                top: `${25 + (i * 8)}%`,
              }}
              animate={{
                y: [-15, 15, -15],
                opacity: [0.4, 0.8, 0.4],
                scale: [0.8, 1.2, 0.8],
              }}
              transition={{
                duration: 3 + i * 0.5,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
          ))}
        </div>

        {/* SVG Progress Circle */}
        <svg
          className="absolute inset-0 w-full h-full transform -rotate-90"
          viewBox="0 0 220 220"
        >
          {/* Background circle */}
          <circle
            cx="110"
            cy="110"
            r="100"
            fill="none"
            stroke="rgba(255,255,255,0.2)"
            strokeWidth="12"
            strokeLinecap="round"
          />
          
          {/* Progress circle with gradient */}
          <defs>
            <linearGradient id="maintenanceGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={colors.from} />
              <stop offset="100%" stopColor={colors.to} />
            </linearGradient>
          </defs>
          
          <motion.circle
            cx="110"
            cy="110"
            r="100"
            fill="none"
            stroke="url(#maintenanceGradient)"
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 2, ease: 'easeOut' }}
            filter="drop-shadow(0 0 15px rgba(249, 115, 22, 0.6))"
          />
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white">
            {/* Main maintenance percentage */}
            <motion.div
              className="text-5xl font-bold mb-2"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1, duration: 0.6 }}
              style={{ color: colors.from }}
            >
              {maintenanceHealth}%
            </motion.div>
            
            {/* Status with icon */}
            <motion.div
              className="flex items-center justify-center gap-2 mb-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.3, duration: 0.4 }}
            >
              <StatusIcon className="h-5 w-5" style={{ color: colors.from }} />
              <span className="text-lg font-semibold" style={{ color: colors.from }}>
                {getStatusText(maintenanceHealth)}
              </span>
            </motion.div>
            
            {/* Borewell Health label */}
            <motion.div
              className="text-sm opacity-90 text-white mb-1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5, duration: 0.4 }}
            >
              Borewell Health
            </motion.div>

            {/* Next maintenance countdown */}
            <motion.div
              className="text-xs opacity-75 text-white flex items-center justify-center gap-1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.7, duration: 0.4 }}
            >
              <Clock className="h-3 w-3" />
              <span>
                {daysUntilMaintenance > 0 
                  ? `${daysUntilMaintenance} days to maintenance` 
                  : 'Maintenance overdue'
                }
              </span>
            </motion.div>
          </div>
        </div>

        {/* Component health indicators around the circle */}
        <div className="absolute inset-0">
          {[
            { label: 'Pump', value: pumpEfficiency, angle: 0 },
            { label: 'Filter', value: filterCondition, angle: 90 },
            { label: 'Pipes', value: pipeIntegrity, angle: 180 },
            { label: 'Electric', value: electricalSystem, angle: 270 }
          ].map((component, index) => {
            const x = 110 + 120 * Math.cos((component.angle - 90) * Math.PI / 180);
            const y = 110 + 120 * Math.sin((component.angle - 90) * Math.PI / 180);
            
            return (
              <motion.div
                key={component.label}
                className="absolute transform -translate-x-1/2 -translate-y-1/2"
                style={{ left: `${(x/220) * 100}%`, top: `${(y/220) * 100}%` }}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 2 + index * 0.2, duration: 0.5 }}
              >
                <div className="bg-white/20 backdrop-blur-sm rounded-lg px-2 py-1 text-center">
                  <div className="text-xs text-white font-medium">{component.label}</div>
                  <div 
                    className="text-sm font-bold"
                    style={{ 
                      color: component.value >= 70 ? '#10b981' : 
                             component.value >= 50 ? '#f59e0b' : '#ef4444'
                    }}
                  >
                    {component.value}%
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Critical issues indicator */}
        {criticalIssues.length > 0 && (
          <motion.div
            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold"
            animate={{ 
              scale: [1, 1.2, 1],
              rotate: [0, -10, 10, 0]
            }}
            transition={{ 
              duration: 2, 
              repeat: Infinity,
              ease: 'easeInOut'
            }}
          >
            {criticalIssues.length}
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};