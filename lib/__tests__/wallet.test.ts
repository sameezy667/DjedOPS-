import * as fc from 'fast-check';
import { formatWalletBalance } from '../calculations';

describe('Wallet Utilities', () => {
  describe('Property 4: Wallet balance formatting consistency', () => {
    /**
     * Feature: djedops-dashboard, Property 4: Wallet balance formatting consistency
     * Validates: Requirements 6.2
     * 
     * For any ERG balance value, when displayed after wallet connection, 
     * the formatted string must match the pattern "WAL: XXX.XX ERG" with exactly 2 decimal places.
     */
    it('**Feature: djedops-dashboard, Property 4: Wallet balance formatting consistency**', () => {
      // Generate valid ERG balance values (0 to 100M ERG)
      const balanceArb = fc.double({ min: 0, max: 100000000, noNaN: true });
      
      fc.assert(
        fc.property(balanceArb, (balance) => {
          const formatted = formatWalletBalance(balance);
          
          // Should match the pattern "WAL: XXX.XX ERG"
          expect(formatted).toMatch(/^WAL: \d+\.\d{2} ERG$/);
          
          // Should start with "WAL: "
          expect(formatted).toMatch(/^WAL: /);
          
          // Should end with " ERG"
          expect(formatted).toMatch(/ ERG$/);
          
          // Should contain exactly 2 decimal places
          const decimalPart = formatted.match(/\.(\d+)/);
          expect(decimalPart).not.toBeNull();
          expect(decimalPart![1]).toHaveLength(2);
          
          // Verify the actual value is correct
          const expectedValue = balance.toFixed(2);
          expect(formatted).toBe(`WAL: ${expectedValue} ERG`);
        }),
        { numRuns: 100 }
      );
    });
    
    it('should format typical balance correctly', () => {
      expect(formatWalletBalance(123.45)).toBe('WAL: 123.45 ERG');
    });
    
    it('should format balance with rounding', () => {
      expect(formatWalletBalance(123.456)).toBe('WAL: 123.46 ERG');
    });
    
    it('should format small balance correctly', () => {
      expect(formatWalletBalance(0.01)).toBe('WAL: 0.01 ERG');
    });
    
    it('should format large balance correctly', () => {
      expect(formatWalletBalance(9999999.99)).toBe('WAL: 9999999.99 ERG');
    });
    
    it('should always show 2 decimal places', () => {
      expect(formatWalletBalance(5)).toBe('WAL: 5.00 ERG');
      expect(formatWalletBalance(10.5)).toBe('WAL: 10.50 ERG');
    });
    
    it('should format zero balance correctly', () => {
      expect(formatWalletBalance(0)).toBe('WAL: 0.00 ERG');
    });
  });
});
