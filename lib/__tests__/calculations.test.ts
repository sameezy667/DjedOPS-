import * as fc from 'fast-check';
import { calculateReserveRatio, determineSystemStatus, formatPrice } from '../calculations';

describe('DjedData Calculation Utilities', () => {
  describe('Property 1: Reserve ratio calculation correctness', () => {
    /**
     * Feature: djedops-dashboard, Property 1: Reserve ratio calculation correctness
     * Validates: Requirements 8.3, 12.4
     * 
     * For any valid combination of base reserves, oracle price, and SigUSD circulation values,
     * the calculated reserve ratio must equal (baseReserves * oraclePrice) / (sigUsdCirculation * 100).
     */
    it('**Feature: djedops-dashboard, Property 1: Reserve ratio calculation correctness**', () => {
      // Generate valid ERG amounts (0 to 100M ERG)
      const ergAmountArb = fc.double({ min: 0, max: 100000000, noNaN: true });
      
      // Generate valid USD prices ($0.01 to $100)
      const priceArb = fc.double({ min: 0.01, max: 100, noNaN: true });
      
      // Generate valid circulation amounts (must be positive to avoid division by zero)
      const circulationArb = fc.double({ min: 0.01, max: 100000000, noNaN: true });
      
      fc.assert(
        fc.property(
          ergAmountArb,
          priceArb,
          circulationArb,
          (baseReserves, oraclePrice, sigUsdCirculation) => {
            const ratio = calculateReserveRatio(baseReserves, oraclePrice, sigUsdCirculation);
            const expected = (baseReserves * oraclePrice) / (sigUsdCirculation * 100);
            
            // Use toBeCloseTo to handle floating point precision
            expect(ratio).toBeCloseTo(expected, 10);
          }
        ),
        { numRuns: 100 }
      );
    });
    
    it('should throw error when sigUsdCirculation is zero', () => {
      expect(() => calculateReserveRatio(1000000, 1.5, 0)).toThrow(
        'SigUSD circulation must be greater than zero'
      );
    });
    
    it('should throw error when sigUsdCirculation is negative', () => {
      expect(() => calculateReserveRatio(1000000, 1.5, -100)).toThrow(
        'SigUSD circulation must be greater than zero'
      );
    });
  });
  
  describe('Property 2: System status threshold consistency', () => {
    /**
     * Feature: djedops-dashboard, Property 2: System status threshold consistency
     * Validates: Requirements 1.2, 1.3
     * 
     * For any reserve ratio value, the system status must be "NORMAL" if and only if 
     * the ratio is greater than or equal to 400%, and "CRITICAL" if and only if 
     * the ratio is less than 400%.
     */
    it('**Feature: djedops-dashboard, Property 2: System status threshold consistency**', () => {
      // Generate valid reserve ratios (0 to 10000%)
      const reserveRatioArb = fc.double({ min: 0, max: 10000, noNaN: true });
      
      fc.assert(
        fc.property(reserveRatioArb, (ratio) => {
          const status = determineSystemStatus(ratio);
          
          if (ratio >= 400) {
            expect(status).toBe('NORMAL');
          } else {
            expect(status).toBe('CRITICAL');
          }
        }),
        { numRuns: 100 }
      );
    });
    
    it('should return NORMAL for ratio exactly at 400%', () => {
      expect(determineSystemStatus(400)).toBe('NORMAL');
    });
    
    it('should return CRITICAL for ratio just below 400%', () => {
      expect(determineSystemStatus(399.99)).toBe('CRITICAL');
    });
    
    it('should return NORMAL for ratio above 400%', () => {
      expect(determineSystemStatus(500)).toBe('NORMAL');
    });
    
    it('should return CRITICAL for ratio at 0%', () => {
      expect(determineSystemStatus(0)).toBe('CRITICAL');
    });
  });

  describe('Property 3: Price formatting consistency', () => {
    /**
     * Feature: djedops-dashboard, Property 3: Price formatting consistency
     * Validates: Requirements 2.5
     * 
     * For any oracle price value, when displayed in the UI, the formatted string 
     * must contain exactly 2 decimal places and include USD currency indication.
     */
    it('**Feature: djedops-dashboard, Property 3: Price formatting consistency**', () => {
      // Generate valid USD prices ($0.01 to $100)
      const priceArb = fc.double({ min: 0.01, max: 100, noNaN: true });
      
      fc.assert(
        fc.property(priceArb, (price) => {
          const formatted = formatPrice(price);
          
          // Should contain exactly 2 decimal places
          expect(formatted).toMatch(/\d+\.\d{2}/);
          
          // Should contain USD indicator ($)
          expect(formatted).toMatch(/\$/);
          
          // Should start with $
          expect(formatted).toMatch(/^\$/);
          
          // Verify the actual value is correct
          const expectedValue = price.toFixed(2);
          expect(formatted).toBe(`$${expectedValue}`);
        }),
        { numRuns: 100 }
      );
    });
    
    it('should format typical price correctly', () => {
      expect(formatPrice(1.45)).toBe('$1.45');
    });
    
    it('should format price with rounding', () => {
      expect(formatPrice(1.456)).toBe('$1.46');
    });
    
    it('should format small price correctly', () => {
      expect(formatPrice(0.01)).toBe('$0.01');
    });
    
    it('should format large price correctly', () => {
      expect(formatPrice(99.99)).toBe('$99.99');
    });
    
    it('should always show 2 decimal places', () => {
      expect(formatPrice(5)).toBe('$5.00');
      expect(formatPrice(10.5)).toBe('$10.50');
    });
  });

  describe('Property 7: Simulation ratio calculation correctness', () => {
    /**
     * Feature: djedops-dashboard, Property 7: Simulation ratio calculation correctness
     * Validates: Requirements 5.3
     * 
     * For any simulated price value within the slider range ($0.10 to $10.00), 
     * the displayed simulated reserve ratio must be calculated using the same formula 
     * as the live ratio: (baseReserves * simulatedPrice) / (sigUsdCirculation * 100).
     */
    it('**Feature: djedops-dashboard, Property 7: Simulation ratio calculation correctness**', () => {
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
            // Calculate simulated ratio using the same formula as live data
            const simulatedRatio = calculateReserveRatio(baseReserves, simulatedPrice, sigUsdCirculation);
            const expected = (baseReserves * simulatedPrice) / (sigUsdCirculation * 100);
            
            // Use toBeCloseTo to handle floating point precision
            expect(simulatedRatio).toBeCloseTo(expected, 10);
          }
        ),
        { numRuns: 100 }
      );
    });
    
    it('should calculate simulated ratio correctly for typical values', () => {
      const baseReserves = 12500000;
      const simulatedPrice = 2.50;
      const sigUsdCirculation = 3200000;
      
      const ratio = calculateReserveRatio(baseReserves, simulatedPrice, sigUsdCirculation);
      const expected = (12500000 * 2.50) / (3200000 * 100);
      
      expect(ratio).toBeCloseTo(expected, 10);
    });
    
    it('should calculate simulated ratio at minimum slider value', () => {
      const baseReserves = 12500000;
      const simulatedPrice = 0.10;
      const sigUsdCirculation = 3200000;
      
      const ratio = calculateReserveRatio(baseReserves, simulatedPrice, sigUsdCirculation);
      expect(ratio).toBeGreaterThan(0);
    });
    
    it('should calculate simulated ratio at maximum slider value', () => {
      const baseReserves = 12500000;
      const simulatedPrice = 10.00;
      const sigUsdCirculation = 3200000;
      
      const ratio = calculateReserveRatio(baseReserves, simulatedPrice, sigUsdCirculation);
      expect(ratio).toBeGreaterThan(0);
    });
  });
});
