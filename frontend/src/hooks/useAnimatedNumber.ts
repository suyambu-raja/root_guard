import { useState, useEffect } from 'react';

interface UseAnimatedNumberOptions {
  duration?: number; // Animation duration in milliseconds
  decimals?: number; // Number of decimal places
  easing?: (t: number) => number; // Easing function
}

const defaultEasing = (t: number) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;

export const useAnimatedNumber = (
  target: number | undefined,
  options: UseAnimatedNumberOptions = {}
) => {
  const { duration = 800, decimals = 1, easing = defaultEasing } = options;
  const [current, setCurrent] = useState(target || 0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (target === undefined || target === current) return;

    setIsAnimating(true);
    const startValue = current;
    const startTime = Date.now();
    const change = target - startValue;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      const easedProgress = easing(progress);
      const newValue = startValue + (change * easedProgress);
      
      setCurrent(newValue);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setCurrent(target);
        setIsAnimating(false);
      }
    };

    requestAnimationFrame(animate);
  }, [target, duration, easing]);

  return {
    value: Number(current.toFixed(decimals)),
    isAnimating,
  };
};

export const useAnimatedPercentage = (target: number | undefined, options?: UseAnimatedNumberOptions) => {
  return useAnimatedNumber(target, { decimals: 1, ...options });
};

export const useAnimatedInteger = (target: number | undefined, options?: UseAnimatedNumberOptions) => {
  return useAnimatedNumber(target, { decimals: 0, ...options });
};