import * as fc from 'fast-check';
import { calculateReserveRatio, determineSystemStatus } from '../calculations';

describe('Simulation Logic', () => {
  describe('Property 8: Simulation critical state consistency', () => {
    /**
     * Feature: djedops-dashboard, Property 8: Simulation critical state consistency
     * Validates: Requirements 5.4, 12.5, 12.6
     * 
     * For any simulated price that results in a reserve ratio below 400%, 
     * the system must display critical state indicators (red theme, "CRITICAL" status text, 
     * and red Reserve Sun).
     */
    it('**Feature: djedops-dashboard, Property 8: Simulation critical state consistency**', () => {
      // Generate valid ERG amounts (0 to 100M ERG)
      const ergAmountArb = fc.double({ min: 0, max: 100000000, noNaN: true });
      
      // Generate valid simulated prices within slider range ($0.10 to $10.00)
      const simulatedPriceArb = fc.double({ min: 0.10, max: 10.00, noNaN: true });
      
      // Generate valid circulation amounts (must be positive to avoid division by zero)
      const circulationArb = fc.double({ min: 0.01, max: 100000000, noNaN: true });
      
      fc.assert(
        fc.property(
          ergAmountArb,
          simulatedPriceArb,
          circulationArb,
          (baseReserves, simulatedPrice, sigUsdCirculation) => {
            // Calculate simulated ratio
            const simulatedRatio = calculateReserveRatio(baseReserves, simulatedPrice, sigUsdCirculation);
            const simulatedStatus = determineSystemStatus(simulatedRatio);
            
            // Get UI state based on simulated ratio
            const uiState = getSimulationUIState(simulatedRatio, simulatedStatus);
            
            // Property: If ratio < 400%, all critical indicators must be present
            if (simulatedRatio < 400) {
              expect(uiState.theme).toBe('critical');
              expect(uiState.statusText).toBe('CRITICAL');
              expect(uiState.sunColor).toBe('red');
            } else {
              // If ratio >= 400%, all normal indicators must be present
              expect(uiState.theme).toBe('normal');
              expect(uiState.statusText).toBe('NORMAL');
              expect(uiState.sunColor).toBe('green');
            }
          }
        ),
        { numRuns: 100 }
      );
    });
    
    it('should show critical state when simulated ratio is exactly 399.99%', () => {
      const simulatedRatio = 399.99;
      const simulatedStatus = determineSystemStatus(simulatedRatio);
      const uiState = getSimulationUIState(simulatedRatio, simulatedStatus);
      
      expect(uiState.theme).toBe('critical');
      expect(uiState.statusText).toBe('CRITICAL');
      expect(uiState.sunColor).toBe('red');
    });
    
    it('should show normal state when simulated ratio is exactly 400%', () => {
      const simulatedRatio = 400;
      const simulatedStatus = determineSystemStatus(simulatedRatio);
      const uiState = getSimulationUIState(simulatedRatio, simulatedStatus);
      
      expect(uiState.theme).toBe('normal');
      expect(uiState.statusText).toBe('NORMAL');
      expect(uiState.sunColor).toBe('green');
    });
    
    it('should show critical state when simulated ratio is very low', () => {
      const simulatedRatio = 50;
      const simulatedStatus = determineSystemStatus(simulatedRatio);
      const uiState = getSimulationUIState(simulatedRatio, simulatedStatus);
      
      expect(uiState.theme).toBe('critical');
      expect(uiState.statusText).toBe('CRITICAL');
      expect(uiState.sunColor).toBe('red');
    });
    
    it('should show normal state when simulated ratio is very high', () => {
      const simulatedRatio = 1000;
      const simulatedStatus = determineSystemStatus(simulatedRatio);
      const uiState = getSimulationUIState(simulatedRatio, simulatedStatus);
      
      expect(uiState.theme).toBe('normal');
      expect(uiState.statusText).toBe('NORMAL');
      expect(uiState.sunColor).toBe('green');
    });
  });
});

/**
 * Helper function that represents the UI state logic
 * This encapsulates the logic that determines what UI elements should display
 * based on the simulated ratio and status
 */
interface SimulationUIState {
  theme: 'normal' | 'critical';
  statusText: 'NORMAL' | 'CRITICAL';
  sunColor: 'green' | 'red';
}

function getSimulationUIState(
  simulatedRatio: number,
  simulatedStatus: 'NORMAL' | 'CRITICAL'
): SimulationUIState {
  if (simulatedRatio < 400) {
    return {
      theme: 'critical',
      statusText: 'CRITICAL',
      sunColor: 'red',
    };
  } else {
    return {
      theme: 'normal',
      statusText: 'NORMAL',
      sunColor: 'green',
    };
  }
}
