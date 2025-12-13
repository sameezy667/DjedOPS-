'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { calculateReserveRatio, determineSystemStatus } from '@/lib/calculations';
import { useAppStore } from '@/lib/store';
import { ScenarioControls } from './ScenarioControls';
import type { SimulationScenario } from '@/lib/types';

export interface SimulationModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPrice: number;
  baseReserves: number;
  sigUsdCirculation: number;
  onSimulatedPriceChange: (price: number, ratio: number, status: 'NORMAL' | 'CRITICAL') => void;
  onScenarioActivate: (scenario: SimulationScenario) => void;
}

/**
 * SimulationModal - Interactive modal for testing protocol behavior under different price scenarios
 * 
 * Features:
 * - Price range slider: $0.10 to $10.00
 * - Real-time ratio calculation display
 * - Visual feedback when simulated ratio crosses 400% threshold
 * - Escape key and backdrop click to close
 * 
 * Requirements: 12.1, 12.2, 12.3, 5.1, 5.2
 */
export function SimulationModal({
  isOpen,
  onClose,
  currentPrice,
  baseReserves,
  sigUsdCirculation,
  onSimulatedPriceChange,
  onScenarioActivate,
}: SimulationModalProps) {
  const simulationScenario = useAppStore((state) => state.simulationScenario);
  const [sliderValue, setSliderValue] = useState(currentPrice);
  const [frozenPrice, setFrozenPrice] = useState<number | null>(null);
  
  // Log props IMMEDIATELY
  console.log('⚡ SimulationModal Props:', { 
    currentPrice, 
    baseReserves, 
    sigUsdCirculation,
    sliderValue 
  });
  
  // Calculate ratio directly from current slider value - no state needed
  const simulatedRatio = sigUsdCirculation > 0 
    ? calculateReserveRatio(baseReserves, sliderValue, sigUsdCirculation)
    : 0;
  const simulatedStatus = determineSystemStatus(simulatedRatio);
  
  console.log('⚡ Calculated Ratio:', { 
    simulatedRatio, 
    simulatedStatus,
    formula: `(${baseReserves} * ${sliderValue}) / ${sigUsdCirculation} * 100 = ${simulatedRatio}`
  });

  // Reset slider to current price when modal opens
  useEffect(() => {
    if (isOpen) {
      console.log('🔧 SimulationModal Initialize:', {
        currentPrice,
        baseReserves,
        sigUsdCirculation,
        sliderValue,
        calculatedRatio: simulatedRatio
      });
      setSliderValue(currentPrice);
    }
  }, [isOpen, currentPrice]);

  // Handle Escape key to close modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPrice = parseFloat(e.target.value);
    setSliderValue(newPrice);
    
    // Ratio is automatically calculated from sliderValue in the component
    // Just notify parent of the change
    const newRatio = (baseReserves * newPrice) / sigUsdCirculation * 100;
    const newStatus = determineSystemStatus(newRatio);
    
    console.log('🔍 Slider Change:', {
      newPrice,
      newRatio,
      newStatus,
      formula: `(${baseReserves} * ${newPrice}) / ${sigUsdCirculation} * 100`
    });
    
    onSimulatedPriceChange(newPrice, newRatio, newStatus);
  };

  const handleScenarioActivate = (scenario: SimulationScenario) => {
    onScenarioActivate(scenario);
    
    if (scenario === 'flash_crash') {
      // Instant 50% price drop
      const crashPrice = currentPrice * 0.5;
      setSliderValue(crashPrice);
      const newRatio = (baseReserves * crashPrice) / sigUsdCirculation * 100;
      const newStatus = determineSystemStatus(newRatio);
      onSimulatedPriceChange(crashPrice, newRatio, newStatus);
    } else if (scenario === 'oracle_freeze') {
      // Lock price at current value
      setFrozenPrice(sliderValue);
    } else if (scenario === 'bank_run') {
      // Force ratio below 400%
      const forcedRatio = 399;
      onSimulatedPriceChange(sliderValue, forcedRatio, 'CRITICAL');
    } else if (scenario === 'none') {
      // Reset to live state
      setFrozenPrice(null);
      setSliderValue(currentPrice);
      const ratio = calculateReserveRatio(baseReserves, currentPrice, sigUsdCirculation);
      const status = determineSystemStatus(ratio);
      onSimulatedPriceChange(currentPrice, ratio, status);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Debug logging on every render
  if (isOpen) {
    console.log('🎯 SimulationModal RENDER:', {
      currentPrice,
      baseReserves,
      sigUsdCirculation,
      sliderValue,
      simulatedRatio,
      calculatedRatio: sigUsdCirculation > 0 ? (baseReserves * sliderValue) / sigUsdCirculation * 100 : 0
    });
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80 backdrop-blur-md p-2 sm:p-4"
          onClick={handleBackdropClick}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-obsidian border-2 border-terminal p-4 sm:p-6 md:p-8 max-w-2xl w-full relative max-h-[90vh] overflow-y-auto mx-auto"
            role="dialog"
            aria-modal="true"
            aria-labelledby="simulation-modal-title"
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-2 right-2 sm:top-4 sm:right-4 text-terminal hover:text-white text-3xl sm:text-2xl font-mono touch-manipulation active:scale-95 w-10 h-10 flex items-center justify-center"
              aria-label="Close modal"
            >
              ×
            </button>

            {/* Modal Header */}
            <h2 id="simulation-modal-title" className="text-xl sm:text-2xl md:text-3xl font-display font-black text-terminal mb-4 sm:mb-6 uppercase pr-10 sm:pr-8">
              Price Simulation
            </h2>

            {/* Risk Scenarios */}
            <ScenarioControls
              onScenarioActivate={handleScenarioActivate}
              currentScenario={simulationScenario}
            />

            {/* Oracle Freeze Warning */}
            {simulationScenario === 'oracle_freeze' && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-3 bg-yellow-500 bg-opacity-10 border border-yellow-500"
              >
                <p className="text-yellow-500 font-mono text-xs font-bold">
                  ⚠ ORACLE FEED UNRESPONSIVE – price frozen at ${frozenPrice?.toFixed(2)}
                </p>
              </motion.div>
            )}

            {/* Current vs Simulated Price */}
            <div className="grid grid-cols-2 gap-2 sm:gap-3 md:gap-4 mb-4 sm:mb-6 md:mb-8 font-mono">
              <div className="min-w-0">
                <p className="text-textSecondary text-[10px] sm:text-xs md:text-sm mb-1 truncate">CURRENT PRICE</p>
                <p className="text-lg sm:text-xl md:text-2xl text-textPrimary">${currentPrice.toFixed(2)}</p>
              </div>
              <div className="min-w-0">
                <p className="text-textSecondary text-[10px] sm:text-xs md:text-sm mb-1 truncate">SIMULATED PRICE</p>
                <p className="text-lg sm:text-xl md:text-2xl text-terminal">${sliderValue.toFixed(2)}</p>
              </div>
            </div>

            {/* Price Slider */}
            <div className="mb-6 sm:mb-8">
              <label htmlFor="price-slider" className="block text-textSecondary text-xs sm:text-sm mb-2 font-mono">
                ADJUST ERG PRICE (USD)
              </label>
              <input
                id="price-slider"
                type="range"
                min="0.10"
                max="10.00"
                step="0.01"
                value={sliderValue}
                onChange={handleSliderChange}
                disabled={simulationScenario === 'oracle_freeze'}
                className="w-full h-3 sm:h-2 bg-obsidian border border-terminal appearance-none cursor-pointer slider-thumb touch-manipulation disabled:opacity-30 disabled:cursor-not-allowed"
              />
              <div className="flex justify-between text-xs text-textSecondary font-mono mt-1">
                <span>$0.10</span>
                <span>$10.00</span>
              </div>
            </div>

            {/* Simulated Reserve Ratio Display */}
            <div className="bg-void border-2 border-terminal p-3 sm:p-4 md:p-6 mb-4 sm:mb-6">
              <p className="text-textSecondary text-[10px] sm:text-xs md:text-sm mb-2 font-mono">SIMULATED RESERVE RATIO</p>
              <p className={`text-2xl sm:text-3xl md:text-4xl font-mono font-bold break-words ${
                simulatedStatus === 'CRITICAL' ? 'text-alert' : 'text-terminal'
              }`}>
                {simulatedRatio.toFixed(2)}%
              </p>
              
              {/* Red alert indicator when ratio < 400% */}
              {simulatedStatus === 'CRITICAL' && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-3 sm:mt-4 p-2 sm:p-3 bg-alert bg-opacity-10 border border-alert"
                >
                  <p className="text-alert font-mono text-xs sm:text-sm font-bold">
                    ⚠ CRITICAL: Reserve ratio below 400% threshold
                  </p>
                </motion.div>
              )}
            </div>

            {/* Instructions */}
            <p className="text-textSecondary text-[10px] sm:text-xs md:text-sm font-mono mb-2 leading-relaxed">
              Adjust the slider to simulate different ERG price scenarios and see how they affect the reserve ratio.
            </p>
            <p className="text-textSecondary text-[10px] sm:text-xs font-mono mb-4 leading-relaxed">
              Keyboard: Use arrow keys to adjust slider, Tab to navigate, Escape to close.
            </p>

            {/* Close Button */}
            <button
              onClick={onClose}
              className={`w-full px-6 sm:px-8 py-3 sm:py-4 font-display font-bold text-base sm:text-lg transition-all uppercase touch-manipulation active:scale-95 ${
                simulatedStatus === 'CRITICAL'
                  ? 'bg-red-600 text-white hover:bg-red-700 hover:shadow-red-glow'
                  : 'bg-terminal text-void hover:shadow-green-glow'
              }`}
            >
              Close Simulation
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
