// apps/web/src/lib/motion.tsx
// Production-quality motion tokens, easing functions, and animated helpers for HeatCredit

"use client";

import React, { useEffect, useState, useRef } from "react";
import { type Variants, useReducedMotion } from "framer-motion";

/**
 * Standard Motion Design Tokens
 */
export const MOTION_TOKENS = {
  duration: {
    instant: 0,
    fast: 0.15,
    normal: 0.25,
    medium: 0.35,
    slow: 0.5,
    meter: 0.65,
  },
  ease: {
    // Custom cubic bezier: rapid initial response with smooth glide into rest
    premium: [0.16, 1, 0.3, 1] as const,
    gentle: [0.4, 0, 0.2, 1] as const,
    spring: { type: "spring", stiffness: 320, damping: 28 } as const,
    softSpring: { type: "spring", stiffness: 200, damping: 24 } as const,
  },
};

/**
 * Page & Container Entrance Variants
 */
export const pageContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.02,
    },
  },
};

export const fadeUpItemVariants: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: MOTION_TOKENS.duration.normal,
      ease: MOTION_TOKENS.ease.premium,
    },
  },
};

export const staggerListVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.04,
      delayChildren: 0.03,
    },
  },
};

/**
 * Interactive Card Hover Variants
 */
export const interactiveCardVariants: Variants = {
  initial: { y: 0, scale: 1 },
  hover: {
    y: -2,
    transition: {
      duration: MOTION_TOKENS.duration.fast,
      ease: MOTION_TOKENS.ease.premium,
    },
  },
  tap: {
    scale: 0.99,
    transition: { duration: 0.1 },
  },
};

/**
 * Button Press Variants
 */
export const buttonTapVariants: Variants = {
  tap: {
    scale: 0.98,
    transition: { duration: 0.08 },
  },
};

/**
 * Animated Number Counter
 * Smoothly interpolates numeric values when scores, costs, or telemetry change.
 * Respects reduced-motion preferences immediately.
 */
export function AnimatedNumber({
  value,
  prefix = "",
  suffix = "",
  decimals = 0,
  formatLocale = false,
  className = "",
}: {
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  formatLocale?: boolean;
  className?: string;
}) {
  const shouldReduceMotion = useReducedMotion();
  const [displayValue, setDisplayValue] = useState(value);
  const prevValueRef = useRef(value);
  const animFrameRef = useRef<number | null>(null);

  useEffect(() => {
    if (shouldReduceMotion) {
      setDisplayValue(value);
      prevValueRef.current = value;
      return;
    }

    const startValue = prevValueRef.current;
    const endValue = value;
    if (startValue === endValue) return;

    const startTime = performance.now();
    const duration = 500; // ms

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Ease out cubic
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      const current = startValue + (endValue - startValue) * easeProgress;

      setDisplayValue(current);

      if (progress < 1) {
        animFrameRef.current = requestAnimationFrame(animate);
      } else {
        setDisplayValue(endValue);
        prevValueRef.current = endValue;
      }
    };

    animFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [value, shouldReduceMotion]);

  const formatted = decimals > 0 ? displayValue.toFixed(decimals) : Math.round(displayValue);
  const finalString = formatLocale ? Number(formatted).toLocaleString() : formatted;

  return (
    <span className={`tabular-nums ${className}`}>
      {prefix}
      {finalString}
      {suffix}
    </span>
  );
}

/**
 * Animated Meter Bar
 * Smooth visual meter with accessible values.
 */
export function AnimatedMeter({
  value,
  max = 100,
  colorClass = "bg-primary",
  bgClass = "bg-muted/60",
  heightClass = "h-2",
  className = "",
}: {
  value: number;
  max?: number;
  colorClass?: string;
  bgClass?: string;
  heightClass?: string;
  className?: string;
}) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={max}
      className={`w-full ${bgClass} ${heightClass} rounded-full overflow-hidden ${className}`}
    >
      <div
        className={`${colorClass} h-full rounded-full transition-all duration-500 ease-out`}
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
}
