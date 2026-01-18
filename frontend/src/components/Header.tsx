import { motion } from 'framer-motion';
import { Leaf, Wifi, WifiOff, Battery } from 'lucide-react';

interface HeaderProps {
  isConnected?: boolean;
  batteryLevel?: number;
}

export const Header = ({ isConnected = true, batteryLevel = 85 }: HeaderProps) => {
  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="sticky top-0 z-50 glass-card border-b border-border/50 px-4 py-3"
    >
      <div className="flex items-center justify-between max-w-4xl mx-auto">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl gradient-bg-primary">
            <Leaf className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-display font-bold text-lg leading-none">RootGuard</h1>
            <span className="text-xs text-muted-foreground">Smart Irrigation</span>
          </div>
        </div>

        {/* Status indicators */}
        <div className="flex items-center gap-4">
          {/* Connection status */}
          <div className="flex items-center gap-1.5">
            {isConnected ? (
              <Wifi className="w-4 h-4 text-success" />
            ) : (
              <WifiOff className="w-4 h-4 text-destructive" />
            )}
            <span className="text-xs font-medium hidden sm:inline">
              {isConnected ? 'Connected' : 'Offline'}
            </span>
          </div>

          {/* Battery */}
          <div className="flex items-center gap-1.5">
            <Battery
              className={`w-4 h-4 ${
                batteryLevel > 50 ? 'text-success' : batteryLevel > 20 ? 'text-warning' : 'text-destructive'
              }`}
            />
            <span className="text-xs font-medium">{batteryLevel}%</span>
          </div>

          {/* Live indicator */}
          <div className="flex items-center gap-1.5">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-success"></span>
            </span>
            <span className="text-xs font-medium text-success">LIVE</span>
          </div>
        </div>
      </div>
    </motion.header>
  );
};
