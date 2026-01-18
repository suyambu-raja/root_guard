// Pulse Irrigation Visualization Component
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Droplet, Clock, Zap } from 'lucide-react';

interface PulseIrrigationProps {
    isActive: boolean;
    mode: 'survival' | 'normal' | 'manual' | 'off';
}

export const PulseIrrigationIndicator: React.FC<PulseIrrigationProps> = ({ isActive, mode }) => {
    const [pulseState, setPulseState] = useState<'on' | 'off'>('off');
    const [countdown, setCountdown] = useState(0);
    const [cycleCount, setCycleCount] = useState(0);

    // Pulse pattern: 10s ON, 50s OFF (PRD specification)
    const PULSE_ON_DURATION = 10;
    const PULSE_OFF_DURATION = 50;
    const TOTAL_CYCLE = PULSE_ON_DURATION + PULSE_OFF_DURATION;

    useEffect(() => {
        if (!isActive || mode !== 'survival') {
            setPulseState('off');
            setCountdown(0);
            return;
        }

        let interval: NodeJS.Timeout;
        let timer = 0;

        interval = setInterval(() => {
            timer++;
            const cyclePosition = timer % TOTAL_CYCLE;

            if (cyclePosition < PULSE_ON_DURATION) {
                setPulseState('on');
                setCountdown(PULSE_ON_DURATION - cyclePosition);
            } else {
                setPulseState('off');
                setCountdown(TOTAL_CYCLE - cyclePosition);
            }

            if (cyclePosition === 0) {
                setCycleCount(prev => prev + 1);
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [isActive, mode]);

    if (!isActive || mode !== 'survival') {
        return null;
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-gradient-to-r from-warning-from/20 to-warning-to/20 backdrop-blur-xl border-2 border-warning-from/50 rounded-2xl p-4 mb-4"
        >
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <motion.div
                        animate={{
                            scale: pulseState === 'on' ? [1, 1.2, 1] : 1,
                            rotate: pulseState === 'on' ? [0, 360] : 0,
                        }}
                        transition={{
                            duration: pulseState === 'on' ? 1 : 0,
                            repeat: pulseState === 'on' ? Infinity : 0,
                        }}
                    >
                        <Zap className={`h-6 w-6 ${pulseState === 'on' ? 'text-warning-to' : 'text-gray-400'}`} />
                    </motion.div>
                    <div>
                        <h3 className="text-white font-bold">🛡️ Survival Mode Active</h3>
                        <p className="text-white/70 text-xs">Pulse irrigation conserving water</p>
                    </div>
                </div>
                <div className="text-right">
                    <div className="text-xs text-white/70">Cycle #{cycleCount}</div>
                </div>
            </div>

            {/* Pulse Pattern Visualization */}
            <div className="relative h-16 bg-white/10 rounded-lg overflow-hidden mb-3">
                <AnimatePresence>
                    {pulseState === 'on' && (
                        <motion.div
                            initial={{ width: '0%' }}
                            animate={{ width: '100%' }}
                            exit={{ width: '0%' }}
                            transition={{ duration: PULSE_ON_DURATION, ease: 'linear' }}
                            className="absolute inset-0 bg-gradient-to-r from-water-from to-water-to"
                        >
                            {/* Water flow animation */}
                            <motion.div
                                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                                animate={{ x: [-100, 400] }}
                                transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                            />
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Center status indicator */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <motion.div
                        animate={{
                            scale: pulseState === 'on' ? [1, 1.1, 1] : 1,
                        }}
                        transition={{ duration: 0.5, repeat: Infinity }}
                        className="flex items-center gap-2"
                    >
                        <Droplet className={`h-5 w-5 ${pulseState === 'on' ? 'text-white' : 'text-white/40'}`} />
                        <span className={`font-bold ${pulseState === 'on' ? 'text-white' : 'text-white/40'}`}>
                            {pulseState === 'on' ? 'IRRIGATING' : 'PAUSED'}
                        </span>
                    </motion.div>
                </div>
            </div>

            {/* Countdown and Pattern Info */}
            <div className="grid grid-cols-3 gap-3">
                <div className="bg-white/10 rounded-lg p-2 text-center">
                    <Clock className="h-4 w-4 mx-auto mb-1 text-white/70" />
                    <div className="text-lg font-bold text-white">{countdown}s</div>
                    <div className="text-xs text-white/70">
                        {pulseState === 'on' ? 'Until pause' : 'Until next'}
                    </div>
                </div>

                <div className="bg-white/10 rounded-lg p-2 text-center">
                    <Droplet className="h-4 w-4 mx-auto mb-1 text-water-to" />
                    <div className="text-lg font-bold text-white">{PULSE_ON_DURATION}s</div>
                    <div className="text-xs text-white/70">ON time</div>
                </div>

                <div className="bg-white/10 rounded-lg p-2 text-center">
                    <div className="h-4 w-4 mx-auto mb-1 rounded-full bg-gray-400" />
                    <div className="text-lg font-bold text-white">{PULSE_OFF_DURATION}s</div>
                    <div className="text-xs text-white/70">OFF time</div>
                </div>
            </div>

            {/* Water Conservation Stats */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mt-3 p-2 bg-success-from/20 rounded-lg border border-success-to/30"
            >
                <div className="flex items-center justify-between text-xs">
                    <span className="text-white/80">💧 Water Conservation:</span>
                    <span className="text-success-to font-bold">~60% savings vs continuous</span>
                </div>
            </motion.div>
        </motion.div>
    );
};
