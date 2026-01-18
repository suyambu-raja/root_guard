import { motion, AnimatePresence } from 'framer-motion';
import { Power, Droplets, Zap, Hand, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { IrrigationMode } from '@/types';
import { cn } from '@/lib/utils';

interface IrrigationControlProps {
  mode: IrrigationMode;
  isIrrigating: boolean;
  onModeChange: (mode: IrrigationMode) => void;
  onToggleIrrigation: () => void;
}

const modes: { id: IrrigationMode; label: string; icon: React.ElementType; description: string }[] = [
  { id: 'normal', label: 'Normal', icon: Droplets, description: 'Standard irrigation cycle' },
  { id: 'survival', label: 'Survival', icon: Zap, description: '10s on / 50s off pulse' },
  { id: 'manual', label: 'Manual', icon: Hand, description: 'Direct control' },
  { id: 'off', label: 'Off', icon: XCircle, description: 'Irrigation disabled' },
];

export const IrrigationControl = ({
  mode,
  isIrrigating,
  onModeChange,
  onToggleIrrigation,
}: IrrigationControlProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="glass-card rounded-xl p-6"
    >
      <h3 className="font-display font-semibold text-lg mb-4">Irrigation Control</h3>
      
      {/* Mode Selection */}
      <div className="grid grid-cols-2 gap-2 mb-6">
        {modes.map((m) => {
          const Icon = m.icon;
          const isActive = mode === m.id;
          
          return (
            <button
              key={m.id}
              onClick={() => onModeChange(m.id)}
              className={cn(
                'relative p-3 rounded-lg border-2 transition-all duration-200 text-left',
                isActive
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/50 bg-transparent'
              )}
            >
              <div className="flex items-center gap-2 mb-1">
                <Icon className={cn('w-4 h-4', isActive ? 'text-primary' : 'text-muted-foreground')} />
                <span className={cn('font-medium text-sm', isActive ? 'text-primary' : 'text-foreground')}>
                  {m.label}
                </span>
              </div>
              <span className="text-xs text-muted-foreground">{m.description}</span>
              
              {isActive && (
                <motion.div
                  layoutId="activeMode"
                  className="absolute inset-0 border-2 border-primary rounded-lg"
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                />
              )}
            </button>
          );
        })}
      </div>
      
      {/* Power Button */}
      <div className="flex flex-col items-center">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onToggleIrrigation}
          disabled={mode === 'off'}
          className={cn(
            'relative w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300',
            mode === 'off'
              ? 'bg-muted cursor-not-allowed'
              : isIrrigating
              ? 'bg-success shadow-lg shadow-success/30'
              : 'bg-primary shadow-lg shadow-primary/30'
          )}
        >
          <AnimatePresence mode="wait">
            {isIrrigating && mode !== 'off' && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: [1, 1.2, 1] }}
                exit={{ scale: 0 }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                className="absolute inset-0 rounded-full bg-success/20"
              />
            )}
          </AnimatePresence>
          
          <Power
            className={cn(
              'w-10 h-10 relative z-10',
              mode === 'off' ? 'text-muted-foreground' : 'text-white'
            )}
          />
        </motion.button>
        
        <span className={cn(
          'mt-3 font-medium text-sm',
          isIrrigating ? 'text-success' : mode === 'off' ? 'text-muted-foreground' : 'text-foreground'
        )}>
          {mode === 'off' ? 'Disabled' : isIrrigating ? 'Irrigating...' : 'Tap to Start'}
        </span>
        
        {mode === 'survival' && isIrrigating && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-2 flex items-center gap-2 text-xs text-accent font-medium"
          >
            <Zap className="w-3 h-3" />
            Pulse Mode Active
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};
