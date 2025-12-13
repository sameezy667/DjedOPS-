'use client';

import { motion, AnimatePresence } from 'framer-motion';
import React, { useEffect, useState, useRef } from 'react';
import { useAppStore } from '@/lib/store';
import { useDjedData } from '@/lib/hooks/useDjedData';
import { useDexPrice } from '@/lib/hooks/useDexPrice';

/**
 * SentinelToggle - Toggle button for Sentinel Mode with Browser Notifications
 * Displays in top-right of dashboard
 */
export function SentinelToggle() {
  const sentinelConfig = useAppStore((state) => state.sentinelConfig);
  const enabled = sentinelConfig.enabled;
  const togglePanel = useAppStore((state) => state.toggleSentinelPanel);
  const setSentinelConfig = useAppStore((state) => state.setSentinelConfig);
  
  const [isMonitoring, setIsMonitoring] = useState(false);
  const lastNotificationTime = useRef<{ [key: string]: number }>({});
  const pollingInterval = useRef<NodeJS.Timeout | null>(null);
  const checkConditionsRef = useRef<() => void>(() => {});

  // Always call hooks unconditionally - this is required by React Rules of Hooks
  const { data: djedData } = useDjedData();
  const dexPriceData = useDexPrice();
  const dexPrice = dexPriceData.dexPrice;

  // Notification permission is checked when needed during monitoring

  // Request notification permission
  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) {
      alert('This browser does not support notifications');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }

    return false;
  };

  // Send notification with rate limiting (1 hour cooldown per type)
  const sendNotification = (type: string, title: string, body: string, icon?: string) => {
    const now = Date.now();
    const lastTime = lastNotificationTime.current[type] || 0;
    const oneHour = 60 * 60 * 1000;

    if (now - lastTime < oneHour) {
      console.log(`Notification throttled: ${type} (last sent ${Math.round((now - lastTime) / 1000 / 60)} min ago)`);
      return;
    }

    if (Notification.permission === 'granted') {
      new Notification(title, {
        body,
        icon: icon || '/favicon.ico',
        badge: '/favicon.ico',
        tag: type, // Prevents duplicate notifications
        requireInteraction: false,
        silent: false
      });

      lastNotificationTime.current[type] = now;
      console.log(`✓ Notification sent: ${type}`);
    }
  };

  // Update check conditions ref when data changes - use useCallback to memoize
  const checkConditions = React.useCallback(() => {
    if (!djedData) return;

    const reserveRatio = djedData.reserveRatio;
    const currentProtocolPrice = djedData.oraclePrice;

    // 1. Check Reserve Ratio Critical
    if (reserveRatio < 400) {
      sendNotification(
        'critical-ratio',
        '🚨 Djed Alert - Critical Reserve Ratio',
        `Reserve Ratio at ${reserveRatio.toFixed(2)}% (below 400% threshold). Protocol may enter liquidation mode.`
      );
    }

    // 2. Check Arbitrage Opportunity
    if (dexPrice && currentProtocolPrice) {
      const spread = Math.abs(dexPrice - currentProtocolPrice);
      const spreadPercent = (spread / currentProtocolPrice) * 100;

      if (spreadPercent > 2) {
        const direction = dexPrice > currentProtocolPrice ? 'Buy Protocol → Sell DEX' : 'Buy DEX → Sell Protocol';
        sendNotification(
          'arbitrage-opportunity',
          '💰 Arbitrage Opportunity Detected',
          `${spreadPercent.toFixed(2)}% spread detected! ${direction}. Protocol: $${currentProtocolPrice.toFixed(4)} | DEX: $${dexPrice.toFixed(4)}`
        );
      }
    }

    // 3. Check High Volatility (optional)
    if (djedData.systemStatus === 'CRITICAL') {
      sendNotification(
        'system-critical',
        '⚠️ System Status Critical',
        'Djed protocol has entered CRITICAL status. Monitor closely for redemption opportunities.'
      );
    }
  }, [djedData, dexPrice]);

  // Update ref when callback changes
  useEffect(() => {
    checkConditionsRef.current = checkConditions;
  }, [checkConditions]);

  // Start/Stop monitoring
  useEffect(() => {
    if (!enabled || !isMonitoring) return;

    // Check immediately
    checkConditionsRef.current();

    // Then poll every 30 seconds
    pollingInterval.current = setInterval(() => {
      checkConditionsRef.current();
    }, 30000);

    console.log('🛡️ Sentinel monitoring started (30s interval)');

    return () => {
      if (pollingInterval.current) {
        clearInterval(pollingInterval.current);
        pollingInterval.current = null;
        console.log('🛡️ Sentinel monitoring stopped');
      }
    };
  }, [enabled, isMonitoring]);

  // Toggle sentinel with notification permission
  const handleToggle = async () => {
    if (!enabled) {
      // Enabling - request permission
      const hasPermission = await requestNotificationPermission();
      if (hasPermission) {
        setSentinelConfig({ enabled: true });
        setIsMonitoring(true);
        
        // Send test notification
        new Notification('🛡️ Sentinel Mode Activated', {
          body: 'Now monitoring reserve ratio and arbitrage opportunities.',
          icon: '/favicon.ico'
        });
      } else {
        alert('Please enable notifications to use Sentinel Mode');
      }
    } else {
      // Disabling
      setSentinelConfig({ enabled: false });
      setIsMonitoring(false);
    }
    
    togglePanel();
  };

  return (
    <motion.button
      onClick={handleToggle}
      className={`px-4 py-2 font-mono text-sm uppercase border-2 transition-all ${
        enabled
          ? 'border-terminal text-terminal bg-terminal bg-opacity-10 shadow-green-glow'
          : 'border-textSecondary text-textSecondary hover:border-terminal hover:text-terminal'
      }`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      title={enabled ? 'Sentinel monitoring active' : 'Click to enable notifications'}
    >
      <div className="flex items-center gap-2">
        {/* Bell Icon */}
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={enabled ? 'animate-pulse' : ''}
        >
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        
        {enabled && (
          <motion.div
            className="w-2 h-2 bg-terminal rounded-full"
            animate={{
              opacity: [1, 0.3, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        )}
        <span>SENTINEL</span>
        <span className="text-xs opacity-70">{enabled ? 'ARMED' : 'OFF'}</span>
      </div>
    </motion.button>
  );
}

/**
 * SentinelPanel - Configuration panel for Sentinel Mode
 * Appears as a drawer/modal when toggle is clicked
 */
export function SentinelPanel() {
  const isOpen = useAppStore((state) => state.isSentinelPanelOpen);
  const togglePanel = useAppStore((state) => state.toggleSentinelPanel);
  const sentinelConfig = useAppStore((state) => state.sentinelConfig);
  const setSentinelConfig = useAppStore((state) => state.setSentinelConfig);

  const handleToggleEnabled = () => {
    setSentinelConfig({ enabled: !sentinelConfig.enabled });
  };

  const handleToggleAutoRedeem = () => {
    setSentinelConfig({ autoRedeemOnCritical: !sentinelConfig.autoRedeemOnCritical });
  };

  const handleToggleVolatility = () => {
    setSentinelConfig({ notifyOnVolatility: !sentinelConfig.notifyOnVolatility });
  };

  const handleBalanceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) || 0;
    setSentinelConfig({ watchedBalance: value });
  };

  // Close panel with ESC key
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        togglePanel();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, togglePanel]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-start justify-end bg-black bg-opacity-80 backdrop-blur-md p-4"
          onClick={togglePanel}
        >
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="bg-obsidian border-2 border-terminal p-6 max-w-md w-full relative mt-16"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="sentinel-panel-title"
          >
            {/* Corner brackets */}
            <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-terminal" />
            <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-terminal" />
            <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-terminal" />
            <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-terminal" />

            {/* Close button - Enhanced visibility */}
            <button
              onClick={togglePanel}
              className="absolute top-4 right-4 text-terminal hover:bg-terminal hover:text-void text-3xl font-mono leading-none w-8 h-8 flex items-center justify-center border border-terminal transition-colors z-10"
              aria-label="Close Sentinel panel"
              title="Close (ESC)"
            >
              ×
            </button>

            {/* Header */}
            <h2 id="sentinel-panel-title" className="text-2xl font-display font-black text-terminal mb-2 uppercase">
              Sentinel Configuration
            </h2>
            <p className="text-textSecondary text-xs font-mono mb-6">
              Automated guardian mode (simulation only – no on-chain actions)
            </p>

            {/* Master Toggle */}
            <div className="mb-6 p-4 bg-void border border-terminal">
              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <p className="text-textPrimary font-mono text-sm uppercase">Enable Sentinel</p>
                  <p className="text-textSecondary text-xs font-mono mt-1">
                    Activate automated monitoring
                  </p>
                </div>
                <div
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    sentinelConfig.enabled ? 'bg-terminal' : 'bg-textSecondary'
                  }`}
                  onClick={handleToggleEnabled}
                >
                  <motion.div
                    className="absolute top-1 w-4 h-4 bg-void rounded-full"
                    animate={{ left: sentinelConfig.enabled ? '26px' : '4px' }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                </div>
              </label>
            </div>

            {/* Configuration Options */}
            <div className="space-y-4 mb-6 opacity-100">
              {/* Auto-Redeem Option */}
              <label className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={sentinelConfig.autoRedeemOnCritical}
                  onChange={handleToggleAutoRedeem}
                  disabled={!sentinelConfig.enabled}
                  className="mt-1 w-4 h-4 accent-terminal disabled:opacity-30"
                />
                <div className={sentinelConfig.enabled ? '' : 'opacity-30'}>
                  <p className="text-textPrimary font-mono text-sm">
                    Auto-redeem DJED when reserve ratio &lt; 400%
                  </p>
                  <p className="text-textSecondary text-xs font-mono mt-1">
                    Triggers simulated emergency exit
                  </p>
                </div>
              </label>

              {/* Volatility Alert Option */}
              <label className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={sentinelConfig.notifyOnVolatility}
                  onChange={handleToggleVolatility}
                  disabled={!sentinelConfig.enabled}
                  className="mt-1 w-4 h-4 accent-terminal disabled:opacity-30"
                />
                <div className={sentinelConfig.enabled ? '' : 'opacity-30'}>
                  <p className="text-textPrimary font-mono text-sm">
                    Notify if oracle price deviates &gt; 2% within 10 minutes
                  </p>
                  <p className="text-textSecondary text-xs font-mono mt-1">
                    Detects rapid price movements
                  </p>
                </div>
              </label>

              {/* Watched Balance Input */}
              <div className={sentinelConfig.enabled ? '' : 'opacity-30'}>
                <label htmlFor="watched-balance" className="block text-textPrimary font-mono text-sm mb-2">
                  Watched DJED Balance
                </label>
                <input
                  id="watched-balance"
                  type="number"
                  min="0"
                  step="0.01"
                  value={sentinelConfig.watchedBalance}
                  onChange={handleBalanceChange}
                  disabled={!sentinelConfig.enabled}
                  className="w-full bg-void border border-terminal text-textPrimary font-mono px-3 py-2 focus:outline-none focus:border-terminal focus:shadow-green-glow disabled:opacity-30"
                  placeholder="0.00"
                />
                <p className="text-textSecondary text-xs font-mono mt-1">
                  Display-only tracking (no signing)
                </p>
              </div>
            </div>

            {/* Warning */}
            <div className="bg-alert bg-opacity-10 border border-alert p-3 mb-6">
              <p className="text-alert font-mono text-xs font-bold">
                ⚠ SIMULATION MODE
              </p>
              <p className="text-textSecondary text-xs font-mono mt-1">
                All Sentinel actions are simulated. No real transactions will be executed.
              </p>
            </div>

            {/* Close Button */}
            <motion.button
              onClick={togglePanel}
              className="w-full py-3 border-2 border-terminal text-terminal font-mono text-sm font-bold uppercase hover:bg-terminal hover:text-void transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              CLOSE PANEL
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/**
 * SentinelShield - Visual indicator when Sentinel is armed
 * Displays as a pulsing shield icon in fixed position
 */
export function SentinelShield() {
  const { enabled } = useAppStore((state) => state.sentinelConfig);

  if (!enabled) return null;

  return (
    <motion.div
      className="fixed bottom-6 right-6 z-40 pointer-events-none"
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      exit={{ scale: 0 }}
    >
      <motion.div
        className="relative"
        animate={{
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        {/* Shield icon (using SVG path) */}
        <svg
          width="48"
          height="48"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#39FF14"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="drop-shadow-[0_0_10px_rgba(57,255,20,0.8)]"
        >
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
        {/* Pulsing ring */}
        <motion.div
          className="absolute inset-0 border-2 border-terminal rounded-full"
          animate={{
            scale: [1, 1.5],
            opacity: [0.8, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeOut',
          }}
        />
      </motion.div>
    </motion.div>
  );
}
