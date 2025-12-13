'use client';

import { motion } from 'framer-motion';
import { WifiOff, Wifi, AlertTriangle, RefreshCw } from 'lucide-react';

export interface ApiStatusIndicatorProps {
  isConnected: boolean;
  label: string;
  onRetry?: () => void;
}

/**
 * ApiStatusIndicator - Shows connection status for API endpoints
 * 
 * Displays a colored dot and status label for each API service
 */
export function ApiStatusIndicator({ isConnected, label, onRetry }: ApiStatusIndicatorProps) {
  return (
    <div className="flex items-center gap-2 text-xs font-mono">
      <motion.div
        className={`w-2 h-2 rounded-full ${isConnected ? 'bg-[#39FF14]' : 'bg-red-500'}`}
        animate={{
          boxShadow: isConnected
            ? ['0 0 0px rgba(57, 255, 20, 0.5)', '0 0 8px rgba(57, 255, 20, 0.8)', '0 0 0px rgba(57, 255, 20, 0.5)']
            : ['0 0 0px rgba(239, 68, 68, 0.5)', '0 0 8px rgba(239, 68, 68, 0.8)', '0 0 0px rgba(239, 68, 68, 0.5)'],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      <span className={isConnected ? 'text-[#A3A3A3]' : 'text-red-400'}>
        {label}
      </span>
      {!isConnected && onRetry && (
        <button
          onClick={onRetry}
          className="ml-1 text-red-400 hover:text-red-300 transition-colors"
          title="Retry connection"
        >
          <RefreshCw className="w-3 h-3" />
        </button>
      )}
    </div>
  );
}

export interface ApiStatusBarProps {
  ergoConnected: boolean;
  dexConnected: boolean;
  onRetryErgo?: () => void;
  onRetryDex?: () => void;
}

/**
 * ApiStatusBar - Displays status of all API connections
 * 
 * Shows in the top-right of the page header
 */
export function ApiStatusBar({ ergoConnected, dexConnected, onRetryErgo, onRetryDex }: ApiStatusBarProps) {
  const allConnected = ergoConnected && dexConnected;

  return (
    <div className="flex items-center gap-4 p-3 bg-black/50 border border-[#39FF14]/20 rounded">
      <div className="flex items-center gap-2">
        {allConnected ? (
          <Wifi className="w-4 h-4 text-[#39FF14]" />
        ) : (
          <WifiOff className="w-4 h-4 text-red-500" />
        )}
        <span className="text-[#A3A3A3] text-xs font-mono uppercase">
          API Status
        </span>
      </div>
      <div className="flex items-center gap-3">
        <ApiStatusIndicator
          isConnected={ergoConnected}
          label="Ergo"
          onRetry={onRetryErgo}
        />
        <ApiStatusIndicator
          isConnected={dexConnected}
          label="DEX"
          onRetry={onRetryDex}
        />
      </div>
    </div>
  );
}

export interface ApiErrorBannerProps {
  type: 'ergo' | 'dex' | 'wallet';
  lastUpdate?: Date;
  onRetry?: () => void;
  onDismiss?: () => void;
}

/**
 * ApiErrorBanner - Warning banner for API failures
 * 
 * Shows at the top of the page when an API is unavailable
 */
export function ApiErrorBanner({ type, lastUpdate, onRetry, onDismiss }: ApiErrorBannerProps) {
  const messages = {
    ergo: {
      icon: <AlertTriangle className="w-5 h-5" />,
      title: 'Ergo API Unavailable',
      description: lastUpdate
        ? `Showing cached data from ${formatTimeAgo(lastUpdate)}.`
        : 'Unable to connect to Ergo blockchain. Some data may be outdated.',
      color: 'border-orange-500/50 bg-orange-500/10',
      textColor: 'text-orange-400',
    },
    dex: {
      icon: <AlertTriangle className="w-5 h-5" />,
      title: 'DEX Price Feed Offline',
      description: lastUpdate
        ? `Last updated ${formatTimeAgo(lastUpdate)}. Arbitrage signals temporarily unavailable.`
        : 'Unable to fetch DEX prices. DSI calculation may be limited.',
      color: 'border-purple-500/50 bg-purple-500/10',
      textColor: 'text-purple-400',
    },
    wallet: {
      icon: <WifiOff className="w-5 h-5" />,
      title: 'Wallet Disconnected',
      description: 'Please reconnect to view personal data. Public protocol data remains available.',
      color: 'border-blue-500/50 bg-blue-500/10',
      textColor: 'text-blue-400',
    },
  };

  const config = messages[type];

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`flex items-center justify-between p-4 border ${config.color} ${config.textColor} mb-6`}
    >
      <div className="flex items-center gap-3 flex-1">
        {config.icon}
        <div>
          <p className="font-mono font-bold text-sm">{config.title}</p>
          <p className="font-mono text-xs opacity-80 mt-1">{config.description}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {onRetry && (
          <button
            onClick={onRetry}
            className={`flex items-center gap-2 px-4 py-2 ${config.color} border ${config.textColor} hover:bg-white/5 font-mono text-xs uppercase tracking-wider transition-all`}
          >
            <RefreshCw className="w-3 h-3" />
            Reconnect
          </button>
        )}
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="text-[#A3A3A3] hover:text-white transition-colors p-1"
            aria-label="Dismiss"
          >
            ×
          </button>
        )}
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
