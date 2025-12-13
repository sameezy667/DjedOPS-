'use client';

import { useState, useRef, useEffect } from 'react';
import { Share2, Twitter, Send, Link as LinkIcon, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ShareButtonProps {
  status?: string;
  reserveRatio?: number;
}

export function ShareButton({ status = 'HEALTHY', reserveRatio }: ShareButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleTwitterShare = () => {
    const statusText = reserveRatio 
      ? `Checking Djed Health on DjedOps... Current Reserve Ratio: ${reserveRatio.toFixed(2)}% | Status: ${status}`
      : `Checking Djed Health on DjedOps... Current Status: ${status}`;
    
    const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(statusText)}&hashtags=Ergo,DeFi,Djed,DjedOps`;
    window.open(tweetUrl, '_blank', 'width=550,height=420');
    setIsOpen(false);
  };

  const handleTelegramShare = () => {
    const statusText = reserveRatio 
      ? `Checking Djed Health on DjedOps... Current Reserve Ratio: ${reserveRatio.toFixed(2)}% | Status: ${status}`
      : `Checking Djed Health on DjedOps... Current Status: ${status}`;
    
    const currentUrl = typeof window !== 'undefined' ? window.location.href : '';
    const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(currentUrl)}&text=${encodeURIComponent(statusText)}`;
    window.open(telegramUrl, '_blank');
    setIsOpen(false);
  };

  const handleCopyLink = async () => {
    try {
      const currentUrl = typeof window !== 'undefined' ? window.location.href : '';
      await navigator.clipboard.writeText(currentUrl);
      setCopied(true);
      
      // Reset copied state after 2 seconds
      setTimeout(() => {
        setCopied(false);
        setIsOpen(false);
      }, 2000);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Main Share Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-black/50 border border-terminal/30 hover:border-terminal/60 text-terminal/80 hover:text-terminal rounded-lg transition-all group backdrop-blur-sm"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        style={{
          boxShadow: isOpen ? '0 0 20px rgba(57, 255, 20, 0.3)' : 'none',
        }}
      >
        <Share2 className="w-4 h-4 transition-transform group-hover:rotate-12" />
        <span className="text-sm font-mono font-semibold tracking-wider">SHARE DASHBOARD</span>
      </motion.button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full mt-2 right-0 w-64 bg-black/95 backdrop-blur-xl border-2 border-terminal/50 rounded-lg shadow-2xl overflow-hidden z-50"
            style={{
              boxShadow: '0 0 40px rgba(57, 255, 20, 0.2), inset 0 0 60px rgba(57, 255, 20, 0.05)',
            }}
          >
            {/* Corner Decorations */}
            <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-terminal/70"></div>
            <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-terminal/70"></div>
            <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-terminal/70"></div>
            <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-terminal/70"></div>

            {/* Header */}
            <div className="px-4 py-3 bg-terminal/10 border-b border-terminal/30">
              <p className="text-terminal font-mono text-xs font-semibold tracking-widest">
                SHARE OPTIONS
              </p>
            </div>

            {/* Share Options */}
            <div className="p-2 space-y-1">
              {/* Twitter/X */}
              <motion.button
                onClick={handleTwitterShare}
                className="w-full flex items-center gap-3 px-4 py-3 text-left text-zinc-300 hover:text-white hover:bg-terminal/10 rounded-md transition-all group"
                whileHover={{ x: 4 }}
              >
                <Twitter className="w-5 h-5 text-[#1DA1F2] flex-shrink-0" />
                <div className="flex-1">
                  <p className="font-mono text-sm font-semibold">Twitter / X</p>
                  <p className="text-xs text-zinc-500 group-hover:text-zinc-400">
                    Share on X (Twitter)
                  </p>
                </div>
              </motion.button>

              {/* Telegram */}
              <motion.button
                onClick={handleTelegramShare}
                className="w-full flex items-center gap-3 px-4 py-3 text-left text-zinc-300 hover:text-white hover:bg-terminal/10 rounded-md transition-all group"
                whileHover={{ x: 4 }}
              >
                <Send className="w-5 h-5 text-[#0088cc] flex-shrink-0" />
                <div className="flex-1">
                  <p className="font-mono text-sm font-semibold">Telegram</p>
                  <p className="text-xs text-zinc-500 group-hover:text-zinc-400">
                    Share on Telegram
                  </p>
                </div>
              </motion.button>

              {/* Copy Link */}
              <motion.button
                onClick={handleCopyLink}
                className="w-full flex items-center gap-3 px-4 py-3 text-left text-zinc-300 hover:text-white hover:bg-terminal/10 rounded-md transition-all group"
                whileHover={{ x: 4 }}
              >
                {copied ? (
                  <Check className="w-5 h-5 text-terminal flex-shrink-0" />
                ) : (
                  <LinkIcon className="w-5 h-5 text-terminal flex-shrink-0" />
                )}
                <div className="flex-1">
                  <p className="font-mono text-sm font-semibold">
                    {copied ? 'Copied!' : 'Copy Link'}
                  </p>
                  <p className="text-xs text-zinc-500 group-hover:text-zinc-400">
                    {copied ? 'Link copied to clipboard' : 'Copy dashboard URL'}
                  </p>
                </div>
              </motion.button>
            </div>

            {/* Footer */}
            <div className="px-4 py-2 bg-terminal/5 border-t border-terminal/20">
              <p className="text-terminal/60 font-mono text-[10px] tracking-wider text-center">
                SPREAD THE SIGNAL
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
