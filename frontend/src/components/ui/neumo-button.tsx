// 2026 Neumorphic Button Component
import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button, ButtonProps } from './button';

interface NeumoButtonProps extends ButtonProps {
  variant?: 'neumo' | 'glass' | 'glow';
  glowColor?: 'blue' | 'green' | 'orange' | 'red';
}

export const NeumoButton: React.FC<NeumoButtonProps> = ({ 
  children, 
  className,
  variant = 'neumo',
  glowColor = 'blue',
  ...props
}) => {
  const variants = {
    neumo: 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 shadow-neumo-light hover:shadow-neumo-inset',
    glass: 'bg-white/25 backdrop-blur-xl border border-white/20 text-white shadow-glass',
    glow: 'bg-gradient-to-r from-hero-from to-hero-to text-white shadow-glow',
  };

  const glowColors = {
    blue: 'hover:shadow-glow',
    green: 'hover:shadow-glow-green',
    orange: 'hover:shadow-[0px_0px_20px_rgba(255,154,0,0.5)]',
    red: 'hover:shadow-glow-critical',
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.95 }}
      transition={{ duration: 0.2 }}
    >
      <Button
        className={cn(
          'rounded-2xl font-semibold transition-all duration-300',
          variants[variant],
          variant === 'glow' && glowColors[glowColor],
          className
        )}
        {...props}
      >
        {children}
      </Button>
    </motion.div>
  );
};