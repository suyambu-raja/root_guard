import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useAnimatedNumber, useAnimatedPercentage } from '@/hooks/useAnimatedNumber';
import { cn } from '@/lib/utils';

interface AnimatedSensorCardProps {
  title: string;
  value?: number;
  unit: string;
  icon: LucideIcon;
  decimals?: number;
  progressValue?: number;
  progressScale?: number; // Scale factor for progress bar (e.g., 10 for flow rate)
  getProgressColor?: (value: number) => string;
  className?: string;
  isLoading?: boolean;
}

const defaultProgressColor = (value: number, progressValue?: number) => {
  const actualValue = progressValue ?? value;
  if (actualValue < 20) return 'bg-red-500';
  if (actualValue < 50) return 'bg-yellow-500';
  return 'bg-green-500';
};

export const AnimatedSensorCard = ({
  title,
  value,
  unit,
  icon: Icon,
  decimals = 1,
  progressValue,
  progressScale = 1,
  getProgressColor = defaultProgressColor,
  className,
  isLoading = false,
}: AnimatedSensorCardProps) => {
  const { value: animatedValue, isAnimating } = useAnimatedNumber(value, { 
    duration: 1000, 
    decimals 
  });
  
  const { value: animatedProgress } = useAnimatedPercentage(
    progressValue ?? (value ? value * progressScale : 0), 
    { duration: 1200 }
  );

  const displayValue = value !== undefined ? animatedValue : '--';
  const progressColorClass = getProgressColor(animatedProgress, progressValue);

  return (
    <Card className={cn("relative overflow-hidden", className)}>
      {/* Subtle loading indicator */}
      {isLoading && (
        <div className="absolute top-0 left-0 h-1 w-full bg-gray-200">
          <motion.div
            className="h-full bg-blue-500"
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 1, ease: "easeInOut" }}
          />
        </div>
      )}
      
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Icon className={cn(
            "h-4 w-4 transition-colors duration-300",
            isAnimating ? "text-blue-500" : "text-current"
          )} />
          {title}
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <motion.div 
          className="text-2xl font-bold"
          animate={{ 
            scale: isAnimating ? [1, 1.05, 1] : 1,
            color: isAnimating ? ["#000000", "#3b82f6", "#000000"] : "#000000"
          }}
          transition={{ duration: 0.3 }}
        >
          {typeof displayValue === 'string' ? displayValue : displayValue}
          {typeof displayValue === 'number' && (
            <span className="text-sm ml-1">{unit}</span>
          )}
          {typeof displayValue === 'string' && unit && (
            <span className="text-sm ml-1"></span>
          )}
        </motion.div>
        
        {(progressValue !== undefined || value !== undefined) && (
          <div className="mt-2">
            <Progress
              value={animatedProgress}
              className={`h-2 ${progressColorClass}`}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Specialized components for different sensor types
export const WaterLevelCard = ({ value, isLoading }: { value?: number; isLoading?: boolean }) => (
  <AnimatedSensorCard
    title="Water Level"
    value={value}
    unit="%"
    icon={() => <span>💧</span>}
    progressValue={value}
    getProgressColor={(val) => {
      if (val < 20) return 'bg-red-500';
      if (val < 50) return 'bg-yellow-500';
      return 'bg-green-500';
    }}
    isLoading={isLoading}
  />
);

export const FlowRateCard = ({ value, isLoading }: { value?: number; isLoading?: boolean }) => (
  <AnimatedSensorCard
    title="Flow Rate"
    value={value}
    unit="L/min"
    icon={() => <span>🌊</span>}
    decimals={2}
    progressValue={value ? value * 10 : 0} // Scale for better visualization
    getProgressColor={(val) => {
      const actualFlow = val / 10;
      if (actualFlow < 2) return 'bg-red-500';
      if (actualFlow < 5) return 'bg-yellow-500';
      return 'bg-green-500';
    }}
    isLoading={isLoading}
  />
);

export const TurbidityCard = ({ value, isLoading }: { value?: number; isLoading?: boolean }) => (
  <AnimatedSensorCard
    title="Turbidity"
    value={value}
    unit="NTU"
    icon={() => <span>👁️</span>}
    progressValue={value}
    getProgressColor={(val) => {
      if (val > 5) return 'bg-red-500';
      if (val > 2) return 'bg-yellow-500';
      return 'bg-green-500';
    }}
    isLoading={isLoading}
  />
);

export const SoilMoistureCard = ({ value, isLoading }: { value?: number; isLoading?: boolean }) => (
  <AnimatedSensorCard
    title="Soil Moisture"
    value={value}
    unit="%"
    icon={() => <span>🌱</span>}
    progressValue={value}
    getProgressColor={(val) => {
      if (val < 30) return 'bg-red-500';
      if (val < 60) return 'bg-yellow-500';
      return 'bg-green-500';
    }}
    isLoading={isLoading}
  />
);