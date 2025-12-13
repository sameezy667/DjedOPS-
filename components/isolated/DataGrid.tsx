'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export interface DataGridProps {
  reserveRatio: number;
  baseReserves: number;
  oraclePrice: number;
  onInspectProtocol?: () => void;
}

/**
 * DataGrid - Isolated component for displaying protocol metrics
 * 
 * Displays key Djed protocol metrics with terminal-inspired styling:
 * - Reserve ratio percentage
 * - Base reserves in ERG
 * - Oracle price in USD
 * 
 * Features:
 * - Monospace typography for all numbers
 * - Corner L-bracket decorations
 * - Animated count-up effect on initial load
 * - Green glow text shadow on values
 * 
 * This component is isolated and accepts only props (no global state).
 */
export function DataGrid({ reserveRatio, baseReserves, oraclePrice, onInspectProtocol }: DataGridProps) {
  const [displayRatio, setDisplayRatio] = useState(0);
  const [displayReserves, setDisplayReserves] = useState(0);
  const [displayPrice, setDisplayPrice] = useState(0);

  // Animated count-up effect on mount
  useEffect(() => {
    const duration = 1000; // 1 second
    const steps = 60;
    const interval = duration / steps;

    let currentStep = 0;
    const timer = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;

      setDisplayRatio(reserveRatio * progress);
      setDisplayReserves(baseReserves * progress);
      setDisplayPrice(oraclePrice * progress);

      if (currentStep >= steps) {
        clearInterval(timer);
        setDisplayRatio(reserveRatio);
        setDisplayReserves(baseReserves);
        setDisplayPrice(oraclePrice);
      }
    }, interval);

    return () => clearInterval(timer);
  }, [reserveRatio, baseReserves, oraclePrice]);

  // Format large numbers with commas and appropriate units
  const formatReserves = (value: number): string => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(2)}M`;
    } else if (value >= 1000) {
      return `${(value / 1000).toFixed(2)}K`;
    }
    return value.toFixed(2);
  };

  // Format price with exactly 2 decimal places and USD indicator
  const formatPrice = (value: number): string => {
    return `$${value.toFixed(2)}`;
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
      {/* Reserve Ratio Metric */}
      <MetricCard
        label="RESERVE RATIO"
        value={`${displayRatio.toFixed(2)}%`}
        onInspect={onInspectProtocol}
        hasInspector={true}
      />

      {/* Base Reserves Metric */}
      <MetricCard
        label="BASE RESERVES"
        value={`${formatReserves(displayReserves)} ERG`}
      />

      {/* Oracle Price Metric */}
      <MetricCard
        label="ORACLE PRICE"
        value={formatPrice(displayPrice)}
      />
    </div>
  );
}

interface MetricCardProps {
  label: string;
  value: string;
  onInspect?: () => void;
  hasInspector?: boolean;
}

function MetricCard({ label, value, onInspect, hasInspector }: MetricCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative bg-transparent border border-[#39FF14]/30 hover:border-[#39FF14]/60 p-6 min-h-[100px] transition-all duration-300 group"
      role="article"
      aria-label={`${label}: ${value}`}
    >
      {/* Corner brackets */}
      <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-[#39FF14]/60"></div>
      <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-[#39FF14]/60"></div>
      <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-[#39FF14]/60"></div>
      <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-[#39FF14]/60"></div>

      {/* Inspector Icon (top right) */}
      {hasInspector && onInspect && (
        <button
          onClick={onInspect}
          className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 hover:border-cyan-500/60 rounded transition-all group/btn"
          title="Inspect Protocol Logic"
        >
          <svg 
            className="w-3 h-3 text-cyan-400 group-hover/btn:text-cyan-300" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" 
            />
          </svg>
        </button>
      )}

      {/* Content */}
      <div className="flex flex-col justify-between h-full">
        <div className="text-neutral-500 text-[10px] font-mono tracking-widest uppercase mb-3">
          {label}
        </div>
        <div className="text-[#39FF14] text-2xl sm:text-3xl lg:text-4xl font-mono font-bold break-all group-hover:text-bloom-green transition-all">
          {value}
        </div>
      </div>
    </motion.div>
  );
}
