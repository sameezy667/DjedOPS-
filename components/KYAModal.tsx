'use client';

import { useEffect, useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface KYAModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function KYAModal({ isOpen, onClose }: KYAModalProps) {
  const [shouldShow, setShouldShow] = useState(false);
  const [isForced, setIsForced] = useState(false);

  useEffect(() => {
    // Check localStorage on mount
    if (typeof window === 'undefined') return;
    
    const hasAccepted = localStorage.getItem('kya_accepted');
    
    if (hasAccepted !== 'true') {
      // User hasn't accepted - force show the modal
      setShouldShow(true);
      setIsForced(true);
    }
  }, []);

  // Show modal if either forced or manually opened
  const isModalOpen = shouldShow || isOpen;

  const handleAgree = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('kya_accepted', 'true');
    }
    setShouldShow(false);
    setIsForced(false);
    onClose();
  };

  const handleBackdropClick = () => {
    // Only allow closing by backdrop if it's NOT forced initial agreement
    if (!isForced) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isModalOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-lg"
          onClick={handleBackdropClick}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: 'spring', duration: 0.4 }}
            className="relative w-full max-w-2xl bg-gradient-to-b from-zinc-900 to-black border-2 border-yellow-500/50 rounded-xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
            style={{
              boxShadow: '0 0 60px rgba(234, 179, 8, 0.3), inset 0 0 100px rgba(234, 179, 8, 0.05)',
            }}
          >
            {/* Close Button - Only show if not forced */}
            {!isForced && (
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-zinc-400 hover:text-white transition-colors z-10"
                aria-label="Close modal"
              >
                <X className="w-6 h-6" />
              </button>
            )}

            {/* Header */}
            <div className="bg-gradient-to-r from-yellow-600/20 to-orange-600/20 border-b border-yellow-500/30 px-6 py-5">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-8 h-8 text-yellow-500 flex-shrink-0" />
                <div>
                  <h2 className="text-2xl font-bold text-yellow-500 tracking-tight">
                    KNOW YOUR ASSUMPTIONS
                  </h2>
                  <p className="text-yellow-500/70 text-sm mt-1">
                    Critical Legal Disclaimer
                  </p>
                </div>
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="px-6 py-6 max-h-[60vh] overflow-y-auto space-y-6">
              <div className="prose prose-invert prose-sm max-w-none">
                <p className="text-zinc-300 leading-relaxed">
                  By using this interface, you acknowledge and agree to the following:
                </p>

                <ol className="space-y-4 text-zinc-300 list-decimal list-inside">
                  <li className="leading-relaxed">
                    <span className="font-semibold text-white">Risk Acknowledgment:</span>{' '}
                    You are using this software at your own risk. This is experimental blockchain technology 
                    and a hackathon prototype. No warranties are provided, express or implied.
                  </li>
                  
                  <li className="leading-relaxed">
                    <span className="font-semibold text-white">Decentralized Application:</span>{' '}
                    This is a decentralized application. You are solely responsible for your private keys, 
                    wallet security, and all transactions you initiate. Lost keys cannot be recovered.
                  </li>
                  
                  <li className="leading-relaxed">
                    <span className="font-semibold text-white">No Financial Guarantees:</span>{' '}
                    Historical performance of the Djed protocol does not guarantee future results. 
                    Reserve ratios, oracle prices, and market conditions are subject to volatility and change.
                  </li>
                  
                  <li className="leading-relaxed">
                    <span className="font-semibold text-white">Protocol Understanding:</span>{' '}
                    You understand the mechanisms of the Reserve Coin (Shen) and Stablecoin (Djed), 
                    including minting, redemption, over-collateralization requirements, and the role of oracle price feeds.
                  </li>

                  <li className="leading-relaxed">
                    <span className="font-semibold text-white">Data Accuracy:</span>{' '}
                    All displayed data, including reserve ratios, DSI scores, and transaction feeds, 
                    are estimates based on available blockchain data and may have latency or inaccuracies.
                  </li>

                  <li className="leading-relaxed">
                    <span className="font-semibold text-white">Smart Contract Risks:</span>{' '}
                    Interactions with smart contracts are irreversible. Always verify contract addresses 
                    and transaction details before confirming.
                  </li>
                </ol>

                <div className="bg-orange-500/10 border-l-4 border-orange-500 pl-4 py-3 mt-6">
                  <p className="text-orange-400 font-semibold mb-2">
                    ⚠️ Hackathon Prototype Notice
                  </p>
                  <p className="text-sm text-zinc-400">
                    This software was developed for the Ergo Blockchain Hackathon 2025 and should be 
                    treated as a demonstration prototype. It has not undergone formal security audits 
                    and is not recommended for production use with real funds.
                  </p>
                </div>
              </div>
            </div>

            {/* Footer - Agreement Button */}
            <div className="border-t border-yellow-500/30 px-6 py-5 bg-black/60">
              <button
                onClick={handleAgree}
                className="w-full px-6 py-4 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white font-bold text-base rounded-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg"
                style={{ boxShadow: '0 0 30px rgba(34, 197, 94, 0.4)' }}
              >
                I UNDERSTAND & AGREE
              </button>
              
              <p className="text-center text-xs text-zinc-500 mt-3">
                By clicking this button, you accept all terms and acknowledge the risks outlined above.
              </p>
            </div>

            {/* Corner Decorations */}
            <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-yellow-500/50"></div>
            <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-yellow-500/50"></div>
            <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-yellow-500/50"></div>
            <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-yellow-500/50"></div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
