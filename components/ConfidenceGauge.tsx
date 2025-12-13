'use client';

import { motion } from 'framer-motion';
import { calculatePCI, getConfidenceLevel } from '@/lib/calculations';

export interface ConfidenceGaugeProps {
  dsi: number;
  volatility: number;
}

/**
 * ConfidenceGauge - Visual display of Protocol Confidence Index (PCI)
 * 
 * Calculates and displays a 0-100 confidence score based on:
 * - DSI (reserve ratio) health
 * - Price volatility over 24h
 * 
 * Color coding:
 * - 80-100: Green (EXCELLENT)
 * - 50-79: Yellow (CAUTION)
 * - 0-49: Red (CRITICAL)
 */
export function ConfidenceGauge({ dsi, volatility }: ConfidenceGaugeProps) {
  const pci = calculatePCI(dsi, volatility);
  const confidenceLevel = getConfidenceLevel(pci);
  
  // Determine color based on score
  const getColor = () => {
    if (pci >= 80) return {
      text: 'text-green-500',
      bg: 'bg-green-500',
      border: 'border-green-500',
      glow: 'shadow-green-glow',
    };
    if (pci >= 50) return {
      text: 'text-yellow-500',
      bg: 'bg-yellow-500',
      border: 'border-yellow-500',
      glow: 'shadow-yellow-glow',
    };
    return {
      text: 'text-red-500',
      bg: 'bg-red-500',
      border: 'border-red-500',
      glow: 'shadow-red-glow',
    };
  };
  
  const colors = getColor();
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className={`bg-obsidian border-2 ${colors.border} p-4 sm:p-6 relative overflow-hidden`}
    >
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white to-transparent"></div>
      </div>
      
      {/* Content */}
      <div className="relative z-10">
        {/* Label */}
        <h3 className="text-textSecondary text-xs sm:text-sm font-mono mb-2 sm:mb-3 uppercase tracking-wider">
          Protocol Confidence
        </h3>
        
        {/* Circular Progress Gauge */}
        <div className="flex items-center justify-center mb-3 sm:mb-4">
          <div className="relative w-32 h-32 sm:w-40 sm:h-40">
            {/* Background circle */}
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 160 160">
              {/* Background track */}
              <circle
                cx="80"
                cy="80"
                r="70"
                fill="none"
                stroke="currentColor"
                strokeWidth="8"
                className="text-gray-800"
              />
              
              {/* Progress arc */}
              <motion.circle
                cx="80"
                cy="80"
                r="70"
                fill="none"
                stroke="currentColor"
                strokeWidth="8"
                strokeLinecap="round"
                className={colors.text}
                initial={{ strokeDashoffset: 440 }}
                animate={{ strokeDashoffset: 440 - (440 * pci) / 100 }}
                transition={{ duration: 1, ease: 'easeOut' }}
                style={{
                  strokeDasharray: 440,
                }}
              />
            </svg>
            
            {/* Center score display */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
                className={`text-4xl sm:text-5xl font-display font-black ${colors.text}`}
              >
                {Math.round(pci)}
              </motion.div>
              <div className="text-xs sm:text-sm text-textSecondary font-mono mt-1">
                / 100
              </div>
            </div>
          </div>
        </div>
        
        {/* Status Label */}
        <div className="text-center">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className={`text-lg sm:text-xl font-display font-bold uppercase ${colors.text} ${colors.glow}`}
          >
            {confidenceLevel}
          </motion.div>
        </div>
        
        {/* Breakdown (optional detail) */}
        <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-800 grid grid-cols-2 gap-2 text-xs font-mono">
          <div>
            <div className="text-textSecondary">DSI</div>
            <div className={dsi < 400 ? 'text-yellow-500' : 'text-green-500'}>
              {dsi.toFixed(1)}%
            </div>
          </div>
          <div>
            <div className="text-textSecondary">Volatility</div>
            <div className={volatility > 10 ? 'text-yellow-500' : 'text-green-500'}>
              {volatility.toFixed(1)}%
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
