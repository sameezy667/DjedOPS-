'use client';

import { useAppStore } from '@/lib/store';
import { Zap, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

/**
 * PerformanceToggle - Component for switching between performance and visual modes
 * 
 * Performance Mode:
 * - Reduces animation complexity
 * - Lowers frame rates for non-critical animations
 * - Disables expensive visual effects
 * - Ideal for low-end devices or battery saving
 * 
 * Visual Mode:
 * - Full animation quality
 * - High frame rates
 * - All visual effects enabled
 * - Best for high-end devices
 */
export function PerformanceToggle() {
  const { highPerformanceMode, setHighPerformanceMode } = useAppStore();

  return (
    <motion.button
      onClick={() => setHighPerformanceMode(!highPerformanceMode)}
      className={`
        flex items-center gap-2 px-4 py-2 rounded-lg border-2 
        transition-all font-mono text-sm font-bold
        ${highPerformanceMode 
          ? 'border-[#39FF14] bg-[#39FF14]/10 text-[#39FF14]' 
          : 'border-purple-500 bg-purple-500/10 text-purple-300'
        }
        hover:scale-105 active:scale-95
      `}
      style={{
        boxShadow: highPerformanceMode 
          ? '0 0 15px rgba(57, 255, 20, 0.3)' 
          : '0 0 15px rgba(168, 85, 247, 0.3)',
      }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      title={highPerformanceMode 
        ? 'Performance Mode: Reduced animations for better performance' 
        : 'Visual Mode: Full quality animations'
      }
    >
      {highPerformanceMode ? (
        <>
          <Zap className="w-4 h-4" />
          <span>PERFORMANCE MODE</span>
        </>
      ) : (
        <>
          <Sparkles className="w-4 h-4" />
          <span>VISUAL MODE</span>
        </>
      )}
    </motion.button>
  );
}
