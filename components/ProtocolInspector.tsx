'use client';

import { useState } from 'react';
import { X } from 'lucide-react';

interface ProtocolInspectorProps {
  isOpen: boolean;
  onClose: () => void;
  reserve: number;
  price: number;
  supply: number;
  ratio: number;
  status: 'NORMAL' | 'CRITICAL';
}

export default function ProtocolInspector({
  isOpen,
  onClose,
  reserve,
  price,
  supply,
  ratio,
  status
}: ProtocolInspectorProps) {
  if (!isOpen) return null;

  const formatNumber = (num: number) => num.toLocaleString('en-US', { maximumFractionDigits: 2 });

  const protocolCode = `/**
 * Djed Reserve Ratio Verification Contract
 * Ergo Platform - ErgoScript Implementation
 * 
 * This contract ensures the stablecoin maintains its peg
 * by enforcing minimum reserve ratio requirements.
 */

object DjedProtocol {
  
  // === LIVE STATE VARIABLES ===
  val currentReserve = ${formatNumber(reserve)} ERG          // Base reserves in protocol
  val oraclePrice = $${price.toFixed(2)} USD                    // ERG/USD price from oracle pool
  val sigUsdCirculation = ${formatNumber(supply)} SIGUSD    // Total stablecoins in circulation
  
  // === RESERVE RATIO CALCULATION ===
  def calculateReserveRatio(): Long = {
    // Formula: (Reserve × Price) ÷ Supply × 100
    val reserveValueUSD = currentReserve * oraclePrice
    val ratio = (reserveValueUSD / sigUsdCirculation) * 100
    
    // Current Computed Ratio: ${ratio.toFixed(2)}%
    ratio
  }
  
  // === PEG ENFORCEMENT LOGIC ===
  def checkMintingAllowed(): Boolean = {
    val ratio = calculateReserveRatio()
    val MIN_RATIO = 400  // 4:1 collateralization minimum
    
    // Status: ${status}
    // ${status === 'CRITICAL' ? '⚠️  WARNING: Ratio below critical threshold!' : '✓  System operating normally'}
    
    ratio >= MIN_RATIO  // Returns: ${ratio >= 400}
  }
  
  // === RESERVE REDEMPTION GUARD ===
  def validateRedemption(amount: Long): Boolean = {
    val futureReserve = currentReserve - amount
    val futureRatio = (futureReserve * oraclePrice / sigUsdCirculation) * 100
    
    // Prevent redemptions that would drop ratio below 400%
    futureRatio >= 400
  }
  
  // === LIQUIDATION TRIGGER ===
  def isLiquidationRequired(): Boolean = {
    val ratio = calculateReserveRatio()
    val LIQUIDATION_THRESHOLD = 400
    
    if (ratio < LIQUIDATION_THRESHOLD) {
      // CRITICAL: Automatic SHEN redemption initiated
      // Protect SIGUSD holders by liquidating reserve shares
      true
    } else {
      false
    }
  }
  
  // === ORACLE PRICE VERIFICATION ===
  def validateOraclePrice(poolPrices: List[Long]): Boolean = {
    val mean = poolPrices.sum / poolPrices.length
    val deviation = poolPrices.map(p => math.abs(p - mean))
    val maxDeviation = deviation.max
    
    // Reject if any oracle deviates > 1% from consensus
    (maxDeviation.toDouble / mean) <= 0.01
  }
  
  // === CIRCUIT BREAKER ===
  def checkCircuitBreaker(): Boolean = {
    val priceChangePercent = calculatePriceChange24h()
    val CIRCUIT_BREAKER_THRESHOLD = 50  // 50% price change
    
    if (math.abs(priceChangePercent) > CIRCUIT_BREAKER_THRESHOLD) {
      // Pause all minting/burning operations
      // Wait for market stabilization
      false
    } else {
      true
    }
  }
}

// === EXECUTION ENTRY POINT ===
{
  val isSafe = DjedProtocol.checkMintingAllowed()
  val needsLiquidation = DjedProtocol.isLiquidationRequired()
  
  sigmaProp(isSafe && !needsLiquidation)
}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-5xl max-h-[90vh] bg-black border-2 border-cyan-500/50 rounded-lg shadow-2xl shadow-cyan-500/20 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-cyan-500/30 bg-black/40">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-cyan-500 animate-pulse" style={{ boxShadow: '0 0 10px #06b6d4' }}></div>
            <h2 className="text-2xl font-bold text-cyan-400 font-mono uppercase tracking-wider">
              Protocol Logic Inspector
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-cyan-400 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Status Bar */}
        <div className="px-6 py-3 bg-black/60 border-b border-cyan-500/20 flex items-center justify-between">
          <div className="flex items-center gap-6 text-sm font-mono">
            <div className="flex items-center gap-2">
              <span className="text-gray-500">CONTRACT:</span>
              <span className="text-cyan-400">DjedProtocol.ergo</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-500">LANGUAGE:</span>
              <span className="text-green-400">ErgoScript (Scala-like)</span>
            </div>
          </div>
          <div className={`px-3 py-1 rounded text-xs font-bold ${
            status === 'NORMAL'
              ? 'bg-green-500/20 text-green-400 border border-green-500/30'
              : 'bg-red-500/20 text-red-400 border border-red-500/30'
          }`}>
            {status === 'NORMAL' ? '✓ VERIFIED' : '⚠ CRITICAL'}
          </div>
        </div>

        {/* Code Content */}
        <div className="flex-1 overflow-auto p-6">
          <pre className="font-mono text-sm leading-relaxed">
            <code className="text-gray-300">
              {protocolCode.split('\n').map((line, i) => {
                // Syntax highlighting
                let coloredLine = line;
                const isComment = line.trim().startsWith('//');
                const isDocComment = line.trim().startsWith('*') || line.trim().startsWith('/**');
                const hasKeyword = /\b(val|def|object|if|else|true|false|return)\b/.test(line);
                const hasNumber = /\d+/.test(line);
                const hasString = /"[^"]*"/.test(line);
                
                return (
                  <div key={i} className="hover:bg-cyan-500/5 px-2 -mx-2 transition-colors">
                    <span className="inline-block w-12 text-gray-600 select-none text-right mr-4">
                      {i + 1}
                    </span>
                    <span className={
                      isComment || isDocComment
                        ? 'text-green-500/70'
                        : hasKeyword
                        ? 'text-cyan-400'
                        : 'text-gray-300'
                    }>
                      {line.split(/(\bval\b|\bdef\b|\bobject\b|\bif\b|\belse\b|\btrue\b|\bfalse\b|\breturn\b|\d+|"[^"]*")/).map((part, j) => {
                        if (/\b(val|def|object|if|else|return)\b/.test(part)) {
                          return <span key={j} className="text-purple-400 font-bold">{part}</span>;
                        }
                        if (/\b(true|false)\b/.test(part)) {
                          return <span key={j} className="text-orange-400">{part}</span>;
                        }
                        if (/\d+/.test(part) && !/[a-zA-Z]/.test(part)) {
                          return <span key={j} className="text-yellow-400">{part}</span>;
                        }
                        if (/"[^"]*"/.test(part)) {
                          return <span key={j} className="text-green-400">{part}</span>;
                        }
                        return <span key={j}>{part}</span>;
                      })}
                    </span>
                  </div>
                );
              })}
            </code>
          </pre>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-cyan-500/30 bg-black/40">
          <div className="flex items-center justify-between text-xs font-mono">
            <div className="flex items-center gap-4 text-gray-500">
              <span>📝 Open Source</span>
              <span>|</span>
              <span>🔍 Fully Auditable</span>
              <span>|</span>
              <span>⚡ On-Chain Verification</span>
            </div>
            <a 
              href="https://github.com/ergoplatform/sigma-rust"
              target="_blank"
              rel="noopener noreferrer"
              className="text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              View on GitHub →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
