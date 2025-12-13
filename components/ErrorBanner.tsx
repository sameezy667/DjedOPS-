'use client';

import { motion } from 'framer-motion';

export interface ErrorBannerProps {
  message: string;
  type?: 'error' | 'warning' | 'stale';
  onDismiss?: () => void;
  onRetry?: () => void;
}

/**
 * ErrorBanner - Component for displaying error messages and warnings
 * 
 * Features:
 * - Displays user-friendly error messages for network failures
 * - Shows "stale data" indicator when data is older than 30 seconds
 * - Handles validation failures
 * - Rate limiting messaging
 * - Dismissible with animation
 * - Retry option for recoverable errors
 * 
 * Requirements: 8.4
 */
export function ErrorBanner({ 
  message, 
  type = 'error', 
  onDismiss, 
  onRetry 
}: ErrorBannerProps) {
  const getStyles = () => {
    switch (type) {
      case 'error':
        return {
          border: 'border-alert',
          text: 'text-alert',
          glow: 'text-glow-red',
          bg: 'bg-alert/10',
        };
      case 'warning':
        return {
          border: 'border-yellow-500',
          text: 'text-yellow-500',
          glow: 'shadow-yellow-glow',
          bg: 'bg-yellow-500/10',
        };
      case 'stale':
        return {
          border: 'border-textSecondary',
          text: 'text-textSecondary',
          glow: '',
          bg: 'bg-textSecondary/10',
        };
      default:
        return {
          border: 'border-alert',
          text: 'text-alert',
          glow: 'text-glow-red',
          bg: 'bg-alert/10',
        };
    }
  };

  const styles = getStyles();

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`relative ${styles.bg} ${styles.border} border-2 p-4 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3`}
    >
      {/* Corner L-brackets */}
      <div className={`absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 ${styles.border}`} />
      <div className={`absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 ${styles.border}`} />
      <div className={`absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 ${styles.border}`} />
      <div className={`absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 ${styles.border}`} />

      {/* Message */}
      <div className="flex-1 flex items-start gap-2 pr-8 sm:pr-0">
        <span className={`${styles.text} font-bold text-lg font-mono`}>
          {type === 'error' ? '⚠' : type === 'warning' ? '⚡' : 'ℹ'}
        </span>
        <p className={`${styles.text} ${styles.glow} font-mono text-sm break-words flex-1`}>
          {message}
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 w-full sm:w-auto">
        {onRetry && (
          <button
            onClick={onRetry}
            className={`px-4 py-2 ${styles.border} border-2 ${styles.text} font-mono text-xs uppercase hover:${styles.bg} transition-colors touch-manipulation active:scale-95 flex-1 sm:flex-initial`}
          >
            RETRY
          </button>
        )}
        {onDismiss && (
          <button
            onClick={onDismiss}
            className={`px-4 py-2 ${styles.text} font-mono text-xs uppercase hover:${styles.bg} transition-colors touch-manipulation active:scale-95`}
            aria-label="Dismiss"
          >
            ✕
          </button>
        )}
      </div>
    </motion.div>
  );
}
