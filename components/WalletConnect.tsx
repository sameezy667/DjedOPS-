'use client';

import { motion } from 'framer-motion';
import { useWallet } from '@/lib/hooks/useWallet';

export interface WalletConnectProps {
  // Component now uses useWallet hook internally
}

/**
 * WalletConnect - Button component for connecting to Nautilus wallet
 * 
 * Features:
 * - Displays "CONNECT WALLET" when disconnected
 * - Shows "WAL: XX.X ERG" with green text when connected
 * - Green dot indicator when connected
 * - Handles connection via useWallet hook
 * - Error handling with alert for missing Nautilus
 * 
 * Requirements: 6.1, 6.2, 6.3, 6.4
 */
export function WalletConnect({}: WalletConnectProps) {
  const { isConnected, balance, isLoading, error, connect, disconnect } = useWallet();

  const handleClick = () => {
    if (isConnected) {
      disconnect();
    } else {
      connect();
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <motion.button
        onClick={handleClick}
        disabled={isLoading}
        whileHover={{ scale: isLoading ? 1 : 1.02 }}
        whileTap={{ scale: isLoading ? 1 : 0.98 }}
        className={`
          relative
          px-3 md:px-4 py-2 
          font-mono text-xs font-bold
          border-2 
          transition-all duration-200
          ${
            isConnected
              ? 'bg-transparent border-[#39FF14] text-[#39FF14]'
              : 'bg-transparent border-[#39FF14]/50 text-[#39FF14]/70 hover:border-[#39FF14] hover:text-[#39FF14]'
          }
          ${isLoading ? 'opacity-50 cursor-wait' : ''}
        `}
      >
        {/* Green dot indicator when connected */}
        {isConnected && (
          <span className="absolute left-2 top-1/2 -translate-y-1/2 w-2 h-2 bg-[#39FF14] rounded-full animate-pulse" />
        )}
        
        <span className={isConnected ? 'ml-3' : ''}>
          {isLoading 
            ? 'CONNECTING...' 
            : isConnected 
              ? `WAL: ${balance.toFixed(1)} ERG`
              : 'CONNECT WALLET'
          }
        </span>
      </motion.button>

      {/* Error display */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xs font-mono text-red-400 bg-red-500/10 border border-red-500/30 px-2 py-1"
        >
          {error}
        </motion.div>
      )}
    </div>
  );
}
