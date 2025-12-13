import * as fc from 'fast-check';
import { formatTimestamp, formatTransactionType } from '../TerminalFeed';

describe('TerminalFeed Formatting Utilities', () => {
  describe('Property 5: Transaction timestamp formatting', () => {
    /**
     * Feature: djedops-dashboard, Property 5: Transaction timestamp formatting
     * Validates: Requirements 4.2
     * 
     * For any transaction event, the displayed timestamp must be formatted as 
     * HH:MM:SS (24-hour format with zero-padding).
     */
    it('**Feature: djedops-dashboard, Property 5: Transaction timestamp formatting**', () => {
      // Generate valid timestamps
      const timestampArb = fc.date({ 
        min: new Date('2020-01-01'), 
        max: new Date('2030-12-31') 
      });
      
      fc.assert(
        fc.property(timestampArb, (timestamp) => {
          const formatted = formatTimestamp(timestamp);
          
          // Should match HH:MM:SS format with zero-padding
          expect(formatted).toMatch(/^[0-2]\d:[0-5]\d:[0-5]\d$/);
          
          // Verify the format is exactly 8 characters (HH:MM:SS)
          expect(formatted).toHaveLength(8);
          
          // Verify each component is zero-padded
          const [hours, minutes, seconds] = formatted.split(':');
          expect(hours).toHaveLength(2);
          expect(minutes).toHaveLength(2);
          expect(seconds).toHaveLength(2);
          
          // Verify the values match the input timestamp
          expect(parseInt(hours, 10)).toBe(timestamp.getHours());
          expect(parseInt(minutes, 10)).toBe(timestamp.getMinutes());
          expect(parseInt(seconds, 10)).toBe(timestamp.getSeconds());
        }),
        { numRuns: 100 }
      );
    });
    
    it('should format midnight correctly', () => {
      const midnight = new Date('2024-01-01T00:00:00');
      expect(formatTimestamp(midnight)).toBe('00:00:00');
    });
    
    it('should format noon correctly', () => {
      const noon = new Date('2024-01-01T12:00:00');
      expect(formatTimestamp(noon)).toBe('12:00:00');
    });
    
    it('should format single-digit hours with zero-padding', () => {
      const morning = new Date('2024-01-01T09:05:03');
      expect(formatTimestamp(morning)).toBe('09:05:03');
    });
    
    it('should format end of day correctly', () => {
      const endOfDay = new Date('2024-01-01T23:59:59');
      expect(formatTimestamp(endOfDay)).toBe('23:59:59');
    });
  });

  describe('Property 6: Transaction type display completeness', () => {
    /**
     * Feature: djedops-dashboard, Property 6: Transaction type display completeness
     * Validates: Requirements 4.3
     * 
     * For any transaction event with a valid type (MINT_DJED, MINT_SHEN, REDEEM_DJED, 
     * REDEEM_SHEN, or ORACLE_UPDATE), the rendered terminal feed entry must include 
     * the transaction type string.
     */
    it('**Feature: djedops-dashboard, Property 6: Transaction type display completeness**', () => {
      // Generate transaction types
      const txTypeArb = fc.constantFrom(
        'MINT_DJED', 
        'MINT_SHEN', 
        'REDEEM_DJED', 
        'REDEEM_SHEN', 
        'ORACLE_UPDATE'
      );
      
      fc.assert(
        fc.property(txTypeArb, (txType) => {
          const formatted = formatTransactionType(txType);
          
          // The formatted string must include the transaction type
          expect(formatted).toContain(txType);
          
          // The formatted string should not be empty
          expect(formatted.length).toBeGreaterThan(0);
          
          // For now, the function returns the type as-is
          expect(formatted).toBe(txType);
        }),
        { numRuns: 100 }
      );
    });
    
    it('should display MINT_DJED correctly', () => {
      expect(formatTransactionType('MINT_DJED')).toBe('MINT_DJED');
    });
    
    it('should display MINT_SHEN correctly', () => {
      expect(formatTransactionType('MINT_SHEN')).toBe('MINT_SHEN');
    });
    
    it('should display REDEEM_DJED correctly', () => {
      expect(formatTransactionType('REDEEM_DJED')).toBe('REDEEM_DJED');
    });
    
    it('should display REDEEM_SHEN correctly', () => {
      expect(formatTransactionType('REDEEM_SHEN')).toBe('REDEEM_SHEN');
    });
    
    it('should display ORACLE_UPDATE correctly', () => {
      expect(formatTransactionType('ORACLE_UPDATE')).toBe('ORACLE_UPDATE');
    });
  });
});
