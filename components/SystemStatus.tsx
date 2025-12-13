'use client';

import { motion } from 'framer-motion';

export interface SystemStatusProps {
  systemStatus: 'NORMAL' | 'CRITICAL';
}

/**
 * SystemStatus - Component for displaying system health status
 * 
 * Displays the current system status with appropriate styling:
 * - NORMAL: Green glow effect
 * - CRITICAL: Red pulse animation
 * 
 * Features smooth transition animation when status changes.
 * 
 * Requirements: 1.1, 1.2, 1.3
 */
export function SystemStatus({ systemStatus }: SystemStatusProps) {
  const isNormal = systemStatus === 'NORMAL';
  
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="border-l-2 border-[#39FF14]/50 pl-4"
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      <div className="flex items-baseline gap-3">
        <span className="text-white text-2xl font-display font-bold">System Status:</span>
        <motion.span
          key={systemStatus}
          initial={{ opacity: 0 }}
          animate={{ 
            opacity: 1,
            scale: isNormal ? 1 : [1, 1.05, 1],
          }}
          transition={{ 
            opacity: { duration: 0.3 },
            scale: { 
              duration: 1.5, 
              repeat: isNormal ? 0 : Infinity,
              ease: "easeInOut"
            }
          }}
          className={`text-3xl font-display font-black ${
            isNormal 
              ? 'text-[#39FF14] text-bloom-green' 
              : 'text-alert'
          }`}
          style={!isNormal ? {
            textShadow: '0 0 20px rgba(255, 42, 42, 0.8), 0 0 40px rgba(255, 42, 42, 0.4)'
          } : {}}
        >
          {systemStatus}
        </motion.span>
      </div>
      <div className="text-neutral-500 text-xs font-mono mt-1">
        Peg Variance: <span className="text-[#E5E5E5]">0.00%</span>
      </div>
    </motion.div>
  );
}
