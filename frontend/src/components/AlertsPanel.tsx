import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

interface Alert {
  id: string;
  type: 'critical' | 'warning' | 'info';
  message: string;
  time: Date;
}

interface AlertsPanelProps {
  alerts: Alert[];
  onDismiss: (id: string) => void;
}

export const AlertsPanel = ({ alerts, onDismiss }: AlertsPanelProps) => {
  const getAlertStyles = (type: Alert['type']) => {
    switch (type) {
      case 'critical':
        return {
          bg: 'bg-destructive/10 border-destructive/30',
          icon: AlertCircle,
          iconColor: 'text-destructive',
        };
      case 'warning':
        return {
          bg: 'bg-warning/10 border-warning/30',
          icon: AlertTriangle,
          iconColor: 'text-warning',
        };
      case 'info':
        return {
          bg: 'bg-primary/10 border-primary/30',
          icon: Info,
          iconColor: 'text-primary',
        };
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="glass-card rounded-xl p-5"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display font-semibold text-lg">Recent Alerts</h3>
        {alerts.length > 0 && (
          <span className="text-xs text-muted-foreground">
            {alerts.length} alert{alerts.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      <div className="space-y-2 max-h-64 overflow-y-auto">
        <AnimatePresence mode="popLayout">
          {alerts.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-6 text-muted-foreground text-sm"
            >
              No recent alerts
            </motion.div>
          ) : (
            alerts.map((alert) => {
              const styles = getAlertStyles(alert.type);
              const Icon = styles.icon;

              return (
                <motion.div
                  key={alert.id}
                  layout
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50, height: 0 }}
                  className={cn(
                    'flex items-start gap-3 p-3 rounded-lg border',
                    styles.bg
                  )}
                >
                  <Icon className={cn('w-4 h-4 mt-0.5 shrink-0', styles.iconColor)} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">{alert.message}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {formatDistanceToNow(alert.time, { addSuffix: true })}
                    </p>
                  </div>
                  <button
                    onClick={() => onDismiss(alert.id)}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};
