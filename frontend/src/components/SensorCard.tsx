import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SensorCardProps {
  title: string;
  value: string | number;
  unit: string;
  icon: LucideIcon;
  status?: 'normal' | 'warning' | 'critical';
  progress?: number; // 0-100 for progress bar
  trend?: 'up' | 'down' | 'stable';
  delay?: number;
}

export const SensorCard = ({
  title,
  value,
  unit,
  icon: Icon,
  status = 'normal',
  progress,
  trend,
  delay = 0,
}: SensorCardProps) => {
  const getStatusColor = () => {
    switch (status) {
      case 'normal':
        return 'bg-success';
      case 'warning':
        return 'bg-warning';
      case 'critical':
        return 'bg-destructive';
    }
  };

  const getProgressColor = () => {
    if (!progress) return 'bg-primary';
    if (progress >= 60) return 'bg-success';
    if (progress >= 30) return 'bg-warning';
    return 'bg-destructive';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="glass-card rounded-xl p-5 hover:shadow-lg transition-shadow duration-300"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-primary/10">
            <Icon className="w-5 h-5 text-primary" />
          </div>
          <span className="font-medium text-muted-foreground text-sm">{title}</span>
        </div>
        <div className={cn('w-2.5 h-2.5 rounded-full', getStatusColor())} />
      </div>
      
      <div className="flex items-baseline gap-1.5 mb-3">
        <motion.span
          key={value}
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          className="text-3xl font-display font-bold text-foreground"
        >
          {value}
        </motion.span>
        <span className="text-muted-foreground text-sm">{unit}</span>
        {trend && (
          <span className={cn(
            'ml-2 text-xs font-medium',
            trend === 'up' ? 'text-success' : trend === 'down' ? 'text-destructive' : 'text-muted-foreground'
          )}>
            {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'}
          </span>
        )}
      </div>
      
      {progress !== undefined && (
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1, delay: delay + 0.3 }}
            className={cn('h-full rounded-full', getProgressColor())}
          />
        </div>
      )}
    </motion.div>
  );
};
