'use client';

import { motion } from 'framer-motion';
import { useWallet } from '@/lib/hooks/useWallet';

/**
 * WalletBalance - Component for displaying wallet balance in top-right corner
 * 
 * Features:
 * - Shows "WAL: XXX.X ERG" with green text
 * - Displays green dot indicator
 * - Only visible when wallet is connected
 * - Auto-updates every 30 seconds
 * - Smooth fade-in animation
 * 
 * Requirements: 6.2
 */
export function WalletBalance() {
  const { isConnected, address, balance } = useWallet();

  if (!isConnected) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed top-4 right-4 z-50"
    >
      <div className="bg-[#0A0A0A]/90 border-2 border-[#39FF14]/30 px-4 py-2 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          {/* Green dot indicator */}
          <span className="w-2 h-2 bg-[#39FF14] rounded-full animate-pulse" />
          
          {/* Balance display */}
          <motion.p
            key={balance}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="font-mono text-sm text-[#39FF14]"
            style={{ textShadow: '0 0 10px rgba(57, 255, 20, 0.5)' }}
          >
            WAL: {balance.toFixed(1)} ERG
          </motion.p>
        </div>
        
        {/* Address tooltip on hover */}
        {address && (
          <div className="font-mono text-[10px] text-[#39FF14]/50 mt-1 truncate max-w-[200px]">
            {address.slice(0, 8)}...{address.slice(-6)}
          </div>
        )}
      </div>
    </motion.div>
  );
}
