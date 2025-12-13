'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/lib/store';
import { useEffect } from 'react';
import { SIMULATION } from '@/lib/constants';

/**
 * SentinelTriggerBanner - Visual notification when Sentinel is triggered
 * Displays a prominent banner at top of screen
 */
export function SentinelTriggerBanner() {
  const sentinelTriggered = useAppStore((state) => state.sentinelTriggered);
  const clearSentinelTrigger = useAppStore((state) => state.clearSentinelTrigger);

  // Handler for manual dismiss
  const handleDismiss = () => {
    clearSentinelTrigger();
  };

  // Auto-dismiss after configured timeout
  useEffect(() => {
    if (sentinelTriggered) {
      const timer = setTimeout(() => {
        clearSentinelTrigger();
      }, SIMULATION.SENTINEL_AUTO_DISMISS);
      return () => clearTimeout(timer);
    }
  }, [sentinelTriggered, clearSentinelTrigger]);

  // Try to show browser notification (feature detection)
  useEffect(() => {
    if (sentinelTriggered && 'Notification' in window && Notification.permission === 'granted') {
      new Notification('DjedOps Sentinel Triggered', {
        body: 'Auto-redeem scenario activated (simulated)',
        icon: '/favicon.ico',
      });
    }
  }, [sentinelTriggered]);

  return (
    <AnimatePresence>
      {sentinelTriggered && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          className="fixed top-4 left-1/2 -translate-x-1/2 z-50 max-w-2xl w-full px-4"
        >
          <motion.div
            className="bg-alert border-2 border-alert p-4 relative overflow-hidden"
            animate={{
              boxShadow: [
                '0 0 20px rgba(255, 42, 42, 0.5)',
                '0 0 40px rgba(255, 42, 42, 0.8)',
                '0 0 20px rgba(255, 42, 42, 0.5)',
              ],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            {/* Corner brackets - pointer-events-none to not block clicks */}
            <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-white pointer-events-none" />
            <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-white pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-white pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-white pointer-events-none" />

            <div className="flex items-start justify-between gap-4 relative z-10">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                  >
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="white"
                      strokeWidth="2"
                    >
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    </svg>
                  </motion.div>
                  <h3 className="text-white font-mono font-bold text-lg uppercase">
                    SENTINEL TRIGGERED
                  </h3>
                </div>
                <p className="text-white font-mono text-sm">
                  AUTO-REDEEM EXECUTED (SIMULATED)
                </p>
                <p className="text-white text-opacity-80 font-mono text-xs mt-1">
                  Reserve ratio dropped below 400% threshold. Emergency protocol activated.
                </p>
              </div>
              <button
                onClick={handleDismiss}
                className="text-white hover:bg-white/20 active:bg-white/30 text-3xl font-bold leading-none flex-shrink-0 w-10 h-10 flex items-center justify-center rounded transition-all cursor-pointer"
                aria-label="Dismiss notification"
                type="button"
                style={{ zIndex: 9999 }}
              >
                ×
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/**
 * DashboardBorderFlash - Brief border flash effect when sentinel triggers
 */
export function DashboardBorderFlash() {
  const sentinelTriggered = useAppStore((state) => state.sentinelTriggered);

  return (
    <AnimatePresence>
      {sentinelTriggered && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 0] }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.5, ease: 'easeInOut' }}
          className="fixed inset-0 pointer-events-none z-40 border-4 border-alert"
          style={{ boxShadow: '0 0 40px rgba(255, 42, 42, 0.8) inset' }}
        />
      )}
    </AnimatePresence>
  );
}
