// Enhanced loading spinner with accessibility
import React from 'react';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  label?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  className,
  label = 'Loading...'
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6', 
    lg: 'h-8 w-8'
  };

  return (
    <div 
      className={cn("flex items-center justify-center", className)}
      role="status"
      aria-label={label}
    >
      <div className={cn(
        "animate-spin rounded-full border-2 border-gray-300 border-t-agriculture-green",
        sizeClasses[size]
      )} />
      <span className="sr-only">{label}</span>
    </div>
  );
};