'use client';

import { motion } from 'framer-motion';
import { useDexPrice } from '@/lib/hooks/useDexPrice';
import { Zap, ExternalLink } from 'lucide-react';

/**
 * Generate Spectrum Finance URL based on arbitrage signal
 * 
 * - MINT DJED: User mints cheap, sells on DEX (SigUSD → ERG swap)
 * - REDEEM DJED: User buys cheap on DEX, redeems (ERG → SigUSD swap)
 */
function generateSpectrumUrl(signal: string): string | null {
  if (signal === 'REDEEM DJED') {
    // Buy DJED (SigUSD) on DEX, then redeem for ERG
    return 'https://app.spectrum.fi/swap?base=ERG&quote=SigUSD';
  } else if (signal === 'MINT DJED') {
    // Mint DJED with ERG, then sell DJED (SigUSD) on DEX
    return 'https://app.spectrum.fi/swap?base=SigUSD&quote=ERG';
  }
  return null;
}

/**
 * MarketOpportunityCard - Arbitrage signal component
 * 
 * Displays arbitrage opportunities between protocol price (mint/redeem) 
 * and external DEX price for DJED.
 * 
 * Signals:
 * - MINT DJED (green): DEX price > protocol price by threshold
 * - REDEEM DJED (red): DEX price < protocol price by threshold
 * - NO CLEAR EDGE (gray): Within threshold bounds
 * 
 * Now includes one-click trade execution via Spectrum Finance.
 */
export function MarketOpportunityCard() {
  const { dexPrice, spread, spreadPercent, signal, isLoading, liquidity, source } = useDexPrice();

  // Signal styling
  const signalStyles = {
    'MINT DJED': {
      color: 'text-terminal',
      glow: 'shadow-green-glow',
      description: 'Buy ERG, mint DJED, sell on DEX',
    },
    'REDEEM DJED': {
      color: 'text-alert',
      glow: 'shadow-red-glow',
      description: 'Buy DJED on DEX, redeem for ERG',
    },
    'NO CLEAR EDGE': {
      color: 'text-textSecondary',
      glow: '',
      description: 'No arbitrage opportunity detected',
    },
  };

  const style = signalStyles[signal];
  
  // Generate Spectrum URL for actionable signals
  const spectrumUrl = generateSpectrumUrl(signal);
  const hasOpportunity = signal !== 'NO CLEAR EDGE' && Math.abs(spreadPercent) >= 0.5;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/5 backdrop-blur-xl border border-white/10 hover:border-[#39FF14]/40 p-6 sm:p-8 relative transition-all duration-300"
    >
      {/* Header with green bullet */}
      <div className="flex items-center gap-2 mb-6">
        <div className="w-1.5 h-1.5 bg-[#39FF14] rounded-sm" aria-hidden="true"></div>
        <h3 className="text-gray-400 font-mono text-xs uppercase tracking-widest">
          MARKET OPPORTUNITY
        </h3>
      </div>

      {/* Price Grid */}
      <div className="grid grid-cols-2 gap-6 mb-6">
        <div>
          <p className="text-[#A3A3A3] text-xs font-mono uppercase tracking-widest mb-2">DEX PRICE</p>
          <p className="text-[#E5E5E5] text-2xl sm:text-3xl font-mono font-semibold">
            ${dexPrice.toFixed(4)}
          </p>
        </div>
        <div>
          <p className="text-[#A3A3A3] text-xs font-mono uppercase tracking-widest mb-2">PROTOCOL</p>
          <p className="text-[#E5E5E5] text-2xl sm:text-3xl font-mono font-semibold">
            $0.8800
          </p>
        </div>
      </div>

      {/* Spread Display */}
      <div className="mb-6 pb-6 border-b border-[#E5E5E5]/10">
        <p className="text-[#A3A3A3] text-xs font-mono uppercase tracking-widest mb-2">SPREAD</p>
        <p className="text-[#E5E5E5] text-xl font-mono font-semibold">
          ${Math.abs(spread).toFixed(4)} ({spreadPercent >= 0 ? '+' : ''}{spreadPercent.toFixed(2)}%)
        </p>
        {liquidity > 0 && (
          <p className="text-[#A3A3A3] text-xs font-mono mt-2">
            Liquidity: ${(liquidity / 1000).toFixed(1)}K · Source: {source}
          </p>
        )}
        
        {/* Execute Trade Button */}
        {hasOpportunity && spectrumUrl && (
          <motion.a
            href={spectrumUrl}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`
              mt-4 flex items-center justify-center gap-2 
              ${signal === 'MINT DJED' ? 'bg-lime-500 hover:bg-lime-400' : 'bg-purple-500 hover:bg-purple-400'}
              text-black font-mono font-bold text-sm uppercase tracking-wider
              py-3 px-4 transition-all duration-200
              shadow-lg hover:shadow-xl
            `}
            title="Opens Spectrum Finance with ERG/SigUSD pair pre-loaded"
          >
            <Zap className="w-4 h-4" />
            <span>EXECUTE TRADE</span>
            <ExternalLink className="w-3 h-3" />
          </motion.a>
        )}
      </div>

      {/* Signal Display */}
      <div>
        <p className="text-[#A3A3A3] text-xs font-mono uppercase tracking-widest mb-3">SIGNAL</p>
        <motion.p
          className={`text-2xl sm:text-3xl font-mono font-black uppercase ${style.color} ${style.glow}`}
          animate={signal !== 'NO CLEAR EDGE' ? {
            textShadow: [
              '0 0 10px currentColor',
              '0 0 20px currentColor',
              '0 0 10px currentColor',
            ],
          } : {}}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          {signal}
        </motion.p>
        <p className="text-[#A3A3A3] text-sm font-mono mt-2">
          {style.description}
        </p>
      </div>

      {/* Loading indicator */}
      {isLoading && (
        <div className="absolute inset-0 bg-void bg-opacity-50 flex items-center justify-center">
          <p className="text-terminal font-mono text-sm animate-pulse">FETCHING DEX DATA...</p>
        </div>
      )}
    </motion.div>
  );
}
