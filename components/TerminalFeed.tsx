'use client';

import { TransactionEvent } from '../lib/types';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

interface TerminalFeedProps {
  events: TransactionEvent[];
  maxHeight?: number; // default 300px
  isLoading?: boolean;
}

/**
 * Format timestamp as HH:MM:SS with zero-padding
 */
export function formatTimestamp(timestamp: Date): string {
  const hours = timestamp.getHours().toString().padStart(2, '0');
  const minutes = timestamp.getMinutes().toString().padStart(2, '0');
  const seconds = timestamp.getSeconds().toString().padStart(2, '0');
  return `${hours}:${minutes}:${seconds}`;
}

/**
 * Format transaction type for display
 */
export function formatTransactionType(type: string): string {
  return type;
}

/**
 * Individual event item component - extracted to use hooks properly
 */
function EventItem({ event, index }: { event: TransactionEvent; index: number }) {
  const [isHovered, setIsHovered] = useState(false);
  const explorerUrl = `https://explorer.ergoplatform.com/en/transactions/${event.id}`;
  const isWhale = event.isWhale === true;
  
  // Log first transaction for debugging
  useEffect(() => {
    if (index === 0) {
      console.log('🔗 Transaction Link Debug:');
      console.log('   Event ID:', event.id);
      console.log('   ID Type:', typeof event.id);
      console.log('   ID Length:', event.id?.length);
      console.log('   Explorer URL:', explorerUrl);
    }
  }, [event.id, index, explorerUrl]);
  
  return (
    <motion.a
      href={explorerUrl}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.2, delay: index * 0.02 }}
      className={`block mb-1 font-mono leading-relaxed hover:text-white px-2 py-1 transition-all cursor-pointer group ${
        isWhale 
          ? 'border-l-4 border-purple-500 hover:bg-purple-500/10 shadow-[0_0_15px_rgba(168,85,247,0.3)]' 
          : 'hover:bg-[#39FF14]/10'
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      title={`View transaction ${event.id} on Ergo Explorer${isWhale ? ' - WHALE ALERT 🐋' : ''}`}
    >
      <span className="text-[#39FF14]/40 select-none">&gt;&gt;</span>
      {' '}
      <span className={`${isWhale ? 'text-purple-300' : 'text-neutral-600'} group-hover:text-neutral-400`}>[{formatTimestamp(event.timestamp)}]</span>
      {' '}
      {isWhale && <span className="text-purple-400 mr-1" title={`Whale ${event.whaleType} Movement`}>🐋</span>}
      <span className={`${isWhale ? 'text-purple-200' : 'text-[#39FF14]'} font-bold group-hover:text-white`} style={{ textShadow: isWhale ? '0 0 8px rgba(168, 85, 247, 0.6)' : '0 0 8px rgba(57, 255, 20, 0.6)' }}>
        {formatTransactionType(event.type)}
      </span>
      {' '}
      <span className="text-neutral-500 group-hover:text-neutral-400 hidden sm:inline">::</span>
      {' '}
      <span className={`${isWhale ? 'text-purple-50' : 'text-[#E5E5E5]'} group-hover:text-white truncate`}>{event.details}</span>
      {' '}
      {/* External link icon - only visible on hover */}
      <svg 
        className={`inline-block w-3 h-3 ml-1 transition-opacity ${isHovered ? 'opacity-100' : 'opacity-0'}`}
        style={{ verticalAlign: 'middle' }}
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      >
        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
        <polyline points="15 3 21 3 21 9" />
        <line x1="10" y1="14" x2="21" y2="3" />
      </svg>
    </motion.a>
  );
}

export function TerminalFeed({ events, maxHeight = 300, isLoading = false }: TerminalFeedProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [showWhalesOnly, setShowWhalesOnly] = useState(false);
  
  // Auto-scroll to bottom when new events arrive
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [events]);
  
  // Limit display to last 50 events for performance, then filter by whales if enabled
  const allDisplayEvents = events.slice(-50);
  const displayEvents = showWhalesOnly ? allDisplayEvents.filter(tx => tx.isWhale) : allDisplayEvents;
  
  return (
    <div
      ref={containerRef}
      className="overflow-y-auto overflow-x-auto text-sm bg-black border-2 border-[#39FF14]/30 p-4 touch-pan-y relative"
      style={{ 
        height: `${maxHeight}px`, 
        fontFamily: 'JetBrains Mono, monospace',
        boxShadow: 'inset 0 0 20px rgba(57, 255, 20, 0.1), 0 0 20px rgba(57, 255, 20, 0.2)'
      }}
      role="log"
      aria-live="polite"
      aria-label="Transaction feed - Live protocol events"
    >
      {/* Terminal Header */}
      <div className="border-b border-[#39FF14]/30 pb-2 mb-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-[#39FF14] text-xs font-bold tracking-wider">DJED_PROTOCOL_V1.0</span>
          <span className="text-[#39FF14]/50 text-xs">///</span>
          <span className="text-[#39FF14]/70 text-xs">TRANSACTION_LOG</span>
        </div>
        
        {/* Whales Only Toggle */}
        <div className="flex items-center gap-2">
          <span className="text-purple-400 text-xs font-bold tracking-wider">WHALES ONLY</span>
          <button
            onClick={() => setShowWhalesOnly(!showWhalesOnly)}
            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
              showWhalesOnly ? 'bg-purple-500' : 'bg-neutral-700'
            }`}
            role="switch"
            aria-checked={showWhalesOnly}
            aria-label="Toggle whales only filter"
          >
            <span
              className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                showWhalesOnly ? 'translate-x-5' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>

      {isLoading && events.length === 0 ? (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="mb-1 px-2 py-1 animate-pulse">
              <span className="text-[#39FF14]/40">&gt;&gt;</span>
              {' '}
              <span className="inline-block h-4 w-20 bg-[#39FF14]/10 rounded"></span>
              {' '}
              <span className="inline-block h-4 w-32 bg-[#39FF14]/10 rounded"></span>
              {' '}
              <span className="inline-block h-4 w-64 bg-[#39FF14]/10 rounded"></span>
            </div>
          ))}
          <p className="text-[#39FF14]/50 text-center mt-4">Loading live transactions...</p>
        </div>
      ) : (
        <AnimatePresence initial={false}>
          {displayEvents.map((event, index) => (
            <EventItem key={event.id} event={event} index={index} />
          ))}
        </AnimatePresence>
      )}
      
      {/* Command prompt with blinking cursor */}
      <div className="flex items-center mt-3 pt-2 border-t border-[#39FF14]/20">
        <span className="text-[#39FF14]/40 select-none">&gt;&gt;</span>
        {' '}
        <span className="text-[#39FF14] animate-pulse font-bold" style={{ textShadow: '0 0 10px rgba(57, 255, 20, 0.8)' }}>█</span>
      </div>

      {/* Corner decorations */}
      <div className="absolute top-1 left-1 w-3 h-3 border-t-2 border-l-2 border-[#39FF14]/50"></div>
      <div className="absolute top-1 right-1 w-3 h-3 border-t-2 border-r-2 border-[#39FF14]/50"></div>
      <div className="absolute bottom-1 left-1 w-3 h-3 border-b-2 border-l-2 border-[#39FF14]/50"></div>
      <div className="absolute bottom-1 right-1 w-3 h-3 border-b-2 border-r-2 border-[#39FF14]/50"></div>
    </div>
  );
}