// 2026 Glassmorphism Card Component
import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'hero' | 'success' | 'warning' | 'critical';
  hover?: boolean;
  glow?: boolean;
}

export const GlassCard: React.FC<GlassCardProps> = ({ 
  children, 
  className,
  variant = 'default',
  hover = true,
  glow = false
}) => {
  const variants = {
    default: 'bg-white/25 border-white/20',
    hero: 'bg-gradient-to-br from-hero-from/30 to-hero-to/30 border-hero-from/30',
    success: 'bg-gradient-to-br from-success-from/30 to-success-to/30 border-success-from/30',
    warning: 'bg-gradient-to-br from-warning-from/30 to-warning-to/30 border-warning-from/30',
    critical: 'bg-gradient-to-br from-critical-from/30 to-critical-to/30 border-critical-from/30',
  };

  const glowVariants = {
    default: '',
    hero: 'shadow-glow',
    success: 'shadow-glow-green',
    warning: 'shadow-[0px_0px_20px_rgba(255,236,210,0.5)]',
    critical: 'shadow-glow-critical',
  };

  return (
    <motion.div
      className={cn(
        // Base glassmorphism styles
        'backdrop-blur-xl border rounded-3xl p-6 shadow-glass',
        variants[variant],
        glow && glowVariants[variant],
        hover && 'hover:shadow-2xl hover:scale-[1.02] transition-all duration-300',
        'relative overflow-hidden',
        className
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={hover ? { y: -4 } : undefined}
    >
      {/* Shimmer effect overlay */}
      <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      
      {children}
    </motion.div>
  );
};