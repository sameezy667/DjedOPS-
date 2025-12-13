'use client';

import { useEffect, useState } from 'react';

export interface RootCauseAnalyzerProps {
  currentDSI: number;
  ergPrice: number;
  oraclePrice: number;
}

interface LogEntry {
  timestamp: string;
  message: string;
  type: 'info' | 'warning' | 'critical' | 'stable';
}

/**
 * RootCauseAnalyzer - Sci-fi terminal-style component that analyzes system anomalies
 * 
 * Displays real-time risk analysis by comparing current values to historical data.
 * Provides actionable insights into protocol health and potential issues.
 */
export function RootCauseAnalyzer({
  currentDSI,
  ergPrice,
  oraclePrice,
}: RootCauseAnalyzerProps) {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [showCursor, setShowCursor] = useState(true);
  
  // Mock previous values (1 hour ago) - in production, fetch from API or state history
  const previousErgPrice = ergPrice * 1.08; // Simulate 8% higher price 1h ago
  
  // Calculate price change percentage
  const priceChangePercent = ((ergPrice - previousErgPrice) / previousErgPrice) * 100;
  
  // Calculate oracle variance
  const oracleVariance = Math.abs(oraclePrice - ergPrice);
  const oracleVariancePercent = (oracleVariance / ergPrice) * 100;
  const isOracleHighVariance = oracleVariancePercent > 2; // > 2% difference is high variance
  
  // Get current time in HH:MM:SS format
  const getTimestamp = () => {
    const now = new Date();
    return now.toTimeString().split(' ')[0];
  };
  
  // Generate analysis logs
  useEffect(() => {
    const newLogs: LogEntry[] = [];
    
    // Starting log
    newLogs.push({
      timestamp: getTimestamp(),
      message: 'ANALYSIS STARTED...',
      type: 'info',
    });
    
    // ERG Price analysis
    if (priceChangePercent < -5) {
      newLogs.push({
        timestamp: getTimestamp(),
        message: `▸ CRITICAL: ERG Price drop detected (${priceChangePercent.toFixed(1)}%)`,
        type: 'critical',
      });
    } else if (priceChangePercent < 0) {
      newLogs.push({
        timestamp: getTimestamp(),
        message: `▸ ERG PRICE: $${ergPrice.toFixed(2)} (▼ ${Math.abs(priceChangePercent).toFixed(1)}%)`,
        type: 'warning',
      });
    } else {
      newLogs.push({
        timestamp: getTimestamp(),
        message: `▸ ERG PRICE: $${ergPrice.toFixed(2)} (▲ ${priceChangePercent.toFixed(1)}%)`,
        type: 'stable',
      });
    }
    
    // Oracle variance analysis
    if (isOracleHighVariance) {
      newLogs.push({
        timestamp: getTimestamp(),
        message: `▸ ORACLE VARIANCE: HIGH (${oracleVariancePercent.toFixed(1)}% deviation)`,
        type: 'warning',
      });
    }
    
    // DSI (Reserve Ratio) analysis
    if (currentDSI < 400) {
      newLogs.push({
        timestamp: getTimestamp(),
        message: `▸ WARNING: Reserve Ratio below target (${currentDSI.toFixed(1)}% < 400%)`,
        type: 'critical',
      });
    } else if (currentDSI > 800) {
      newLogs.push({
        timestamp: getTimestamp(),
        message: `▸ INFO: Reserve Ratio healthy (${currentDSI.toFixed(1)}% > 800%)`,
        type: 'stable',
      });
    } else {
      newLogs.push({
        timestamp: getTimestamp(),
        message: `▸ RESERVE RATIO: ${currentDSI.toFixed(1)}% (Within normal range)`,
        type: 'info',
      });
    }
    
    // Final conclusion
    let conclusion = '';
    if (priceChangePercent < -5 && currentDSI < 400) {
      conclusion = 'CONCLUSION: CRITICAL RATIO COMPRESSION DETECTED. Immediate action required.';
    } else if (priceChangePercent < -5) {
      conclusion = 'CONCLUSION: PRICE VOLATILITY DETECTED. Monitor reserve levels closely.';
    } else if (currentDSI < 400) {
      conclusion = 'CONCLUSION: LOW RESERVE RATIO. System vulnerable to price shocks.';
    } else if (isOracleHighVariance) {
      conclusion = 'CONCLUSION: ORACLE FEED VARIANCE ELEVATED. Verify data sources.';
    } else {
      conclusion = 'CONCLUSION: SYSTEM STABLE. All parameters within acceptable ranges.';
    }
    
    newLogs.push({
      timestamp: getTimestamp(),
      message: conclusion,
      type: currentDSI < 400 || priceChangePercent < -5 ? 'critical' : 'stable',
    });
    
    setLogs(newLogs);
  }, [currentDSI, ergPrice, oraclePrice, priceChangePercent, isOracleHighVariance, oracleVariancePercent]);
  
  // Blinking cursor effect
  useEffect(() => {
    const interval = setInterval(() => {
      setShowCursor((prev) => !prev);
    }, 500);
    
    return () => clearInterval(interval);
  }, []);
  
  const getTextColor = (type: LogEntry['type']) => {
    switch (type) {
      case 'critical':
        return 'text-red-500';
      case 'warning':
        return 'text-yellow-500';
      case 'stable':
        return 'text-green-500';
      case 'info':
        return 'text-blue-400';
      default:
        return 'text-gray-400';
    }
  };
  
  return (
    <div className="bg-black border-2 border-terminal p-4 sm:p-6 font-mono text-sm">
      {/* Header */}
      <div className="mb-4 pb-2 border-b border-terminal">
        <h3 className="text-terminal font-bold text-base sm:text-lg flex items-center gap-2">
          ⚠ RISK ANALYSIS LOG
        </h3>
        <div className="text-xs text-gray-500 mt-1">
          DJED PROTOCOL DIAGNOSTIC SYSTEM v2.1.0
        </div>
      </div>
      
      {/* Separator */}
      <div className="text-terminal mb-3">
        {'─'.repeat(40)}
      </div>
      
      {/* Log Entries */}
      <div className="space-y-1 text-xs sm:text-sm">
        {logs.map((log, index) => (
          <div
            key={index}
            className={`${getTextColor(log.type)} leading-relaxed`}
          >
            <span className="text-gray-600">[{log.timestamp}]</span>{' '}
            <span className={getTextColor(log.type)}>{log.message}</span>
          </div>
        ))}
        
        {/* Blinking cursor */}
        <div className="inline-flex items-center">
          <span className="text-terminal">
            {showCursor ? '_' : '\u00A0'}
          </span>
        </div>
      </div>
      
      {/* Footer metrics */}
      <div className="mt-4 pt-3 border-t border-gray-800 grid grid-cols-3 gap-2 text-xs">
        <div>
          <div className="text-gray-600">DSI</div>
          <div className={currentDSI < 400 ? 'text-red-500 font-bold' : 'text-green-500'}>
            {currentDSI.toFixed(1)}%
          </div>
        </div>
        <div>
          <div className="text-gray-600">ERG/USD</div>
          <div className={priceChangePercent < -5 ? 'text-red-500 font-bold' : 'text-green-500'}>
            ${ergPrice.toFixed(2)}
          </div>
        </div>
        <div>
          <div className="text-gray-600">ORACLE</div>
          <div className={isOracleHighVariance ? 'text-yellow-500' : 'text-green-500'}>
            ${oraclePrice.toFixed(2)}
          </div>
        </div>
      </div>
    </div>
  );
}
