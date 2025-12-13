'use client';

import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { useEffect, useState } from 'react';
import { DSIResult } from '@/lib/utils/dsiCalculator';

export interface StabilityGaugeProps {
  dsi: DSIResult;
  isDexOffline?: boolean;
  lastCalculated?: Date;
}

/**
 * StabilityGauge - Visual gauge for Djed Stability Index (DSI)
 * 
 * Features:
 * - Animated circular gauge (speedometer-style)
 * - Animated score counter
 * - Color-coded based on health (green/yellow/red)
 * - Shows breakdown on hover
 * - Handles DEX offline state gracefully
 */
export function StabilityGauge({ dsi, isDexOffline = false, lastCalculated }: StabilityGaugeProps) {
  const [isHovered, setIsHovered] = useState(false);
  const motionScore = useMotionValue(0);
  const displayScore = useTransform(motionScore, (latest) => Math.round(latest));

  // Animate score on mount or when it changes
  useEffect(() => {
    const controls = animate(motionScore, dsi.score, {
      duration: 1.5,
      ease: 'easeOut',
    });

    return controls.stop;
  }, [dsi.score, motionScore]);

  // Circle parameters for SVG gauge
  const radius = 70;
  const strokeWidth = 12;
  const circumference = 2 * Math.PI * radius;
  const progress = (dsi.score / 100) * circumference;
  const offset = circumference - progress;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6 }}
      className="relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Card Container */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 hover:border-[#39FF14]/40 p-6 sm:p-8 relative transition-all duration-300">
        {/* Header with green bullet */}
        <div className="flex items-center gap-2 mb-6">
          <div className="w-1.5 h-1.5 bg-[#39FF14] rounded-sm" aria-hidden="true"></div>
          <h3 className="text-gray-400 font-mono text-xs uppercase tracking-widest">
            STABILITY INDEX
          </h3>
        </div>

        {/* Gauge Visualization */}
        <div className="flex flex-col items-center justify-center mb-6">
          {/* SVG Circle Gauge */}
          <div className="relative w-48 h-48 flex items-center justify-center">
            <svg
              className="transform -rotate-90"
              width="200"
              height="200"
              viewBox="0 0 200 200"
            >
              {/* Background circle */}
              <circle
                cx="100"
                cy="100"
                r={radius}
                fill="none"
                stroke="rgba(255, 255, 255, 0.1)"
                strokeWidth={strokeWidth}
              />
              {/* Progress circle */}
              <motion.circle
                cx="100"
                cy="100"
                r={radius}
                fill="none"
                stroke={dsi.color}
                strokeWidth={strokeWidth}
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                strokeLinecap="round"
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset: offset }}
                transition={{ duration: 1.5, ease: 'easeOut' }}
                style={{
                  filter: `drop-shadow(0 0 8px ${dsi.color})`,
                }}
              />
            </svg>

            {/* Score Display (centered) */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <motion.div
                className="text-5xl font-mono font-black"
                style={{ color: dsi.color }}
              >
                {displayScore.get()}
              </motion.div>
              <div className="text-[#A3A3A3] text-xs font-mono mt-1">/ 100</div>
            </div>
          </div>

          {/* Label */}
          <motion.div
            className="text-center mt-4"
            animate={{
              textShadow: dsi.score >= 80 ? [
                `0 0 10px ${dsi.color}`,
                `0 0 20px ${dsi.color}`,
                `0 0 10px ${dsi.color}`,
              ] : '0 0 0px transparent',
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            <p
              className="text-2xl font-mono font-black uppercase tracking-wider"
              style={{ color: dsi.color }}
            >
              {dsi.label}
            </p>
            <p className="text-[#A3A3A3] text-xs font-mono uppercase tracking-widest mt-2">
              SYSTEM OPTIMAL
            </p>
          </motion.div>
        </div>

        {/* DEX Offline Warning */}
        {isDexOffline && (
          <div className="bg-purple-500/10 border border-purple-500/30 p-3 rounded">
            <p className="text-purple-400 text-xs font-mono text-center">
              ⚠️ DEX feed offline - Limited peg data
            </p>
            {lastCalculated && (
              <p className="text-[#A3A3A3] text-xs font-mono text-center mt-1">
                Last calculated: {formatTimeAgo(lastCalculated)}
              </p>
            )}
          </div>
        )}

        {/* Breakdown (shows on hover) */}
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{
            opacity: isHovered ? 1 : 0,
            height: isHovered ? 'auto' : 0,
          }}
          transition={{ duration: 0.3 }}
          className="overflow-hidden border-t border-[#E5E5E5]/10 pt-4"
        >
          <p className="text-[#A3A3A3] text-xs font-mono uppercase tracking-widest mb-3">
            BREAKDOWN
          </p>
          <div className="space-y-2">
            <div className="flex justify-between text-sm font-mono">
              <span className="text-[#A3A3A3]">Reserve Ratio:</span>
              <span className="text-[#E5E5E5]">{dsi.breakdown.ratioScore}/50</span>
            </div>
            <div className="flex justify-between text-sm font-mono">
              <span className="text-[#A3A3A3]">Peg Stability:</span>
              <span className="text-[#E5E5E5]">{dsi.breakdown.pegScore}/30</span>
            </div>
            <div className="flex justify-between text-sm font-mono">
              <span className="text-[#A3A3A3]">Trend Factor:</span>
              <span className="text-[#E5E5E5]">{dsi.breakdown.trendScore}/20</span>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

/**
 * Format time difference in human-readable format
 */
function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffSecs = Math.floor(diffMs / 1000);

  if (diffMins < 1) {
    return `${diffSecs}s ago`;
  } else if (diffMins < 60) {
    return `${diffMins}m ago`;
  } else {
    const diffHours = Math.floor(diffMins / 60);
    return `${diffHours}h ago`;
  }
}
