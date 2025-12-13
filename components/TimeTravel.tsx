'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/lib/store';

/**
 * Historical Scenario Data
 * Provides mocked data for different market scenarios
 */
export const REPLAY_SCENARIOS = {
  crash: {
    name: 'The Crash',
    description: 'Market downturn scenario',
    ergPrice: 0.50,
    dsi: 150,
    baseReserves: 75000,
    sigUsdCirculation: 100000,
    status: 'CRITICAL' as const,
  },
  bull_run: {
    name: 'The Bull Run',
    description: 'Market growth scenario',
    ergPrice: 5.00,
    dsi: 1200,
    baseReserves: 240000,
    sigUsdCirculation: 100000,
    status: 'NORMAL' as const,
  },
};

/**
 * TimeTravel - Control bar for Historical Replay Mode
 * 
 * Allows switching between live data and historical scenarios:
 * - "The Crash": ERG $0.50, DSI 150% (Critical)
 * - "The Bull Run": ERG $5.00, DSI 1200% (Safe)
 * 
 * Useful for demonstrations and testing dashboard behavior during various market conditions
 */
export function TimeTravel() {
  const [isExpanded, setIsExpanded] = useState(false);
  const {
    isReplayMode,
    replayScenario,
    replayTime,
    setReplayMode,
    setReplayScenario,
    setReplayTime,
  } = useAppStore();

  const handleToggleReplay = () => {
    const newMode = !isReplayMode;
    setReplayMode(newMode);
    if (!newMode) {
      // Clear scenario when switching to live
      setReplayScenario(null);
    }
  };

  const handleLoadScenario = (scenario: 'crash' | 'bull_run') => {
    setReplayMode(true); // Activate replay mode first
    setReplayScenario(scenario);
    setReplayTime(100); // Start at full scenario (NOW)
  };

  const currentScenario = replayScenario ? REPLAY_SCENARIOS[replayScenario] : null;

  return (
    <>
      {/* Floating Toggle Button */}
      <motion.button
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', stiffness: 200 }}
        onClick={() => setIsExpanded(!isExpanded)}
        className="fixed bottom-4 right-4 z-40 bg-terminal text-void px-4 py-2 font-display font-bold uppercase text-sm shadow-green-glow hover:shadow-green-glow-strong transition-all border-2 border-terminal"
        aria-label="Toggle Time Travel Controls"
      >
        <span className="flex items-center gap-2">
          <span>⏱</span>
          <span>TIME TRAVEL</span>
          {isReplayMode && (
            <span className="animate-pulse text-red-500">●</span>
          )}
        </span>
      </motion.button>

      {/* Control Panel */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-obsidian border-t-4 border-terminal p-4 sm:p-6 shadow-2xl"
          >
            {/* Header */}
            <div className="max-w-7xl mx-auto">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-xl sm:text-2xl font-display font-black text-terminal uppercase">
                    Historical Replay Mode
                  </h3>
                  <p className="text-xs sm:text-sm text-textSecondary font-mono mt-1">
                    Test dashboard behavior with historical scenarios
                  </p>
                </div>
                <button
                  onClick={() => setIsExpanded(false)}
                  className="text-terminal hover:text-white text-2xl font-mono"
                  aria-label="Close controls"
                >
                  ×
                </button>
              </div>

              {/* Mode Toggle */}
              <div className="mb-4 flex items-center gap-4">
                <span className="text-sm font-mono text-textSecondary">MODE:</span>
                <button
                  onClick={handleToggleReplay}
                  className={`relative inline-flex items-center h-8 w-32 rounded-full transition-colors ${
                    isReplayMode ? 'bg-red-600' : 'bg-green-600'
                  }`}
                  aria-label={isReplayMode ? 'Switch to Live' : 'Switch to Replay'}
                >
                  <motion.div
                    layout
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    className={`absolute w-14 h-7 bg-white rounded-full shadow-md flex items-center justify-center ${
                      isReplayMode ? 'left-[66px]' : 'left-1'
                    }`}
                  >
                    <span className="text-xs font-bold text-obsidian">
                      {isReplayMode ? 'REPLAY' : 'LIVE'}
                    </span>
                  </motion.div>
                </button>
                
                {isReplayMode && currentScenario && (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="text-sm font-mono text-yellow-500"
                  >
                    Active: {currentScenario.name}
                  </motion.div>
                )}
              </div>

              {/* Scenario Buttons - Always visible */}
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-4"
              >
                <div className="text-sm font-mono text-textSecondary mb-2">
                  LOAD SCENARIO:
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Crash Scenario */}
                  <button
                    onClick={() => handleLoadScenario('crash')}
                    className={`p-4 border-2 transition-all text-left ${
                      isReplayMode && replayScenario === 'crash'
                        ? 'border-red-500 bg-red-500 bg-opacity-10'
                        : 'border-gray-700 hover:border-red-500'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xl">📉</span>
                      <span className="font-display font-bold text-red-500 uppercase">
                        Market Crash
                      </span>
                    </div>
                    <div className="text-xs font-mono text-textSecondary space-y-1">
                      <div>ERG: $0.50 (Critical Drop)</div>
                      <div>DSI: 150% (Below Threshold)</div>
                      <div className="text-red-500">⚠ System in Critical State</div>
                    </div>
                  </button>

                  {/* Bull Run Scenario */}
                  <button
                    onClick={() => handleLoadScenario('bull_run')}
                    className={`p-4 border-2 transition-all text-left ${
                      isReplayMode && replayScenario === 'bull_run'
                        ? 'border-green-500 bg-green-500 bg-opacity-10'
                        : 'border-gray-700 hover:border-green-500'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xl">📈</span>
                      <span className="font-display font-bold text-green-500 uppercase">
                        Bull Run
                      </span>
                    </div>
                    <div className="text-xs font-mono text-textSecondary space-y-1">
                      <div>ERG: $5.00 (Strong Growth)</div>
                      <div>DSI: 1200% (Excellent Health)</div>
                      <div className="text-green-500">✓ System Stable</div>
                    </div>
                  </button>
                </div>
              </motion.div>

              {/* Timeline Slider */}
              {isReplayMode && currentScenario && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <div className="text-sm font-mono text-textSecondary mb-2">
                    TIMELINE:
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-xs font-mono text-gray-600">T-24h</span>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={replayTime}
                      onChange={(e) => setReplayTime(parseInt(e.target.value))}
                      className="flex-1 h-2 bg-obsidian border border-terminal appearance-none cursor-pointer slider-thumb"
                    />
                    <span className="text-xs font-mono text-gray-600">NOW</span>
                    <span className="text-sm font-mono text-terminal ml-2">
                      {replayTime}%
                    </span>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
