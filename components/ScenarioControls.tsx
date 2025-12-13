'use client';

import { motion } from 'framer-motion';
import { useAppStore } from '@/lib/store';
import type { SimulationScenario } from '@/lib/types';

export interface ScenarioControlsProps {
  onScenarioActivate: (scenario: SimulationScenario) => void;
  currentScenario: SimulationScenario;
  disabled?: boolean;
}

/**
 * ScenarioControls - Preset stress test buttons for simulation modal
 * 
 * Provides three risk scenarios:
 * - FLASH CRASH: Instant 50% price drop
 * - ORACLE FREEZE: Lock price at current value
 * - BANK RUN: Force reserve ratio below 400%
 */
export function ScenarioControls({ 
  onScenarioActivate, 
  currentScenario,
  disabled = false 
}: ScenarioControlsProps) {
  
  const scenarios: Array<{
    id: SimulationScenario;
    label: string;
    description: string;
    color: string;
  }> = [
    {
      id: 'flash_crash',
      label: 'FLASH CRASH',
      description: 'ERG price -50%',
      color: 'border-alert text-alert hover:bg-alert hover:text-void',
    },
    {
      id: 'oracle_freeze',
      label: 'ORACLE FREEZE',
      description: 'Price feed stale',
      color: 'border-yellow-500 text-yellow-500 hover:bg-yellow-500 hover:text-void',
    },
    {
      id: 'bank_run',
      label: 'BANK RUN',
      description: 'Force ratio < 400%',
      color: 'border-red-600 text-red-600 hover:bg-red-600 hover:text-void',
    },
  ];

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-textSecondary text-xs sm:text-sm font-mono uppercase">
          Risk Scenarios
        </h3>
        {currentScenario !== 'none' && (
          <button
            onClick={() => onScenarioActivate('none')}
            className="text-terminal text-xs font-mono uppercase hover:text-white transition-colors"
          >
            RESET TO LIVE
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
        {scenarios.map((scenario) => {
          const isActive = currentScenario === scenario.id;
          
          return (
            <motion.button
              key={scenario.id}
              onClick={() => onScenarioActivate(scenario.id)}
              disabled={disabled}
              className={`p-3 border-2 font-mono text-sm uppercase transition-all disabled:opacity-30 disabled:cursor-not-allowed ${
                isActive
                  ? `${scenario.color.split('hover:')[1]} border-transparent`
                  : scenario.color
              }`}
              whileHover={!disabled ? { scale: 1.05 } : {}}
              whileTap={!disabled ? { scale: 0.95 } : {}}
            >
              <div className="text-xs sm:text-sm font-bold mb-1">
                {scenario.label}
              </div>
              <div className="text-xs opacity-70">
                {scenario.description}
              </div>
              {isActive && (
                <motion.div
                  className="mt-2 text-xs"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  ● ACTIVE
                </motion.div>
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Scenario mode indicator */}
      {currentScenario !== 'none' && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-3 p-2 bg-alert bg-opacity-10 border border-alert"
        >
          <p className="text-alert font-mono text-xs font-bold">
            MODE: {currentScenario.toUpperCase().replace('_', ' ')} (SIMULATION)
          </p>
        </motion.div>
      )}
    </div>
  );
}
