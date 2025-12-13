import { TransactionEvent } from './types';

export interface MockData {
  oraclePrice: number;
  baseReserves: number;
  sigUsdCirculation: number;
  shenCirculation: number;
  transactions: Array<{
    id: string;
    timestamp: string;
    type: string;
    details: string;
    inputAmount?: number;
    outputAmount?: number;
    inputToken?: string;
    outputToken?: string;
  }>;
}

/**
 * Service for loading and providing mock data in demo mode
 */
export class DemoService {
  private static mockData: MockData | null = null;
  private static usingFallback: boolean = false;
  
  /**
   * Check if demo mode is enabled via URL parameter
   * @returns true if ?demo=true is present in URL
   */
  static isDemoMode(): boolean {
    if (typeof window === 'undefined') {
      return false;
    }
    
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('demo') === 'true';
  }
  
  /**
   * Check if demo mode is using fallback data
   * @returns true if mock-data.json failed to load and fallback data is being used
   */
  static isUsingFallback(): boolean {
    return this.usingFallback;
  }
  
  /**
   * Load mock data from mock-data.json file
   * @returns Promise resolving to MockData
   * @throws Error if loading fails
   */
  static async loadMockData(): Promise<MockData> {
    // Return cached data if available
    if (this.mockData) {
      return this.mockData;
    }
    
    try {
      const response = await fetch('/mock-data.json', {
        signal: AbortSignal.timeout(5000), // 5 second timeout
      });
      
      if (!response.ok) {
        console.warn(`Failed to load mock data: ${response.status} ${response.statusText}`);
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      // Catch JSON parse errors explicitly
      let data: unknown;
      try {
        data = await response.json();
      } catch (parseError) {
        console.error('JSON parse error in mock-data.json:', parseError);
        throw new Error('Invalid JSON format in mock-data.json');
      }
      
      // Type guard to check if data has expected structure
      if (!data || typeof data !== 'object') {
        throw new Error('Invalid mock data format: expected object');
      }
      
      // Cast to any for validation since we're checking the structure
      const mockData = data as Record<string, unknown>;
      
      // Validate the structure with detailed checking
      const warnings: string[] = [];
      
      if (typeof mockData.oraclePrice !== 'number' || mockData.oraclePrice <= 0) {
        warnings.push('Invalid or missing oraclePrice');
      }
      if (typeof mockData.baseReserves !== 'number' || mockData.baseReserves <= 0) {
        warnings.push('Invalid or missing baseReserves');
      }
      if (typeof mockData.sigUsdCirculation !== 'number' || mockData.sigUsdCirculation < 0) {
        warnings.push('Invalid or missing sigUsdCirculation');
      }
      if (typeof mockData.shenCirculation !== 'number' || mockData.shenCirculation < 0) {
        warnings.push('Invalid or missing shenCirculation');
      }
      if (!Array.isArray(mockData.transactions)) {
        warnings.push('Missing or invalid transactions array');
      }
      
      // If critical fields are missing, throw error
      if (warnings.length > 0) {
        console.warn('Demo data validation warnings:', warnings);
        
        // If any critical field is invalid, use fallback
        if (!mockData.oraclePrice || !mockData.baseReserves || mockData.sigUsdCirculation === undefined) {
          throw new Error(`Incomplete demo data: ${warnings.join(', ')}`);
        }
        
        // Otherwise, use data but log warning
        console.warn('Using demo data with warnings. Some fields may be missing or invalid.');
      }
      
      // Ensure all required fields exist with defaults
      const validatedData: MockData = {
        oraclePrice: mockData.oraclePrice as number || 1.45,
        baseReserves: mockData.baseReserves as number || 12500000,
        sigUsdCirculation: mockData.sigUsdCirculation as number || 3200000,
        shenCirculation: mockData.shenCirculation as number || 850000,
        transactions: Array.isArray(mockData.transactions) ? mockData.transactions : [],
      };
      
      this.mockData = validatedData;
      this.usingFallback = false;
      return validatedData;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error loading mock data:', errorMessage);
      console.warn('Falling back to hardcoded demo data');
      
      // Provide hardcoded fallback data if mock-data.json is missing or invalid
      this.usingFallback = true;
      const fallbackData: MockData = {
        oraclePrice: 1.45,
        baseReserves: 12500000,
        sigUsdCirculation: 3200000,
        shenCirculation: 850000,
        transactions: [
          {
            id: 'fallback_001',
            timestamp: new Date().toISOString(),
            type: 'ORACLE_UPDATE',
            details: 'Demo mode fallback - mock-data.json unavailable'
          },
          {
            id: 'fallback_002',
            timestamp: new Date(Date.now() - 30000).toISOString(),
            type: 'MINT_DJED',
            details: 'Sample transaction (fallback data)',
            inputAmount: 1000,
            outputAmount: 1450,
            inputToken: 'ERG',
            outputToken: 'SigUSD'
          }
        ]
      };
      
      this.mockData = fallbackData;
      return fallbackData;
    }
  }
  
  /**
   * Parse transaction events from mock data
   * @param mockData - The mock data containing transactions
   * @returns Array of TransactionEvent objects
   */
  static parseTransactions(mockData: MockData): TransactionEvent[] {
    return mockData.transactions.map(tx => ({
      id: tx.id,
      timestamp: new Date(tx.timestamp),
      type: tx.type as TransactionEvent['type'],
      details: tx.details,
      inputAmount: tx.inputAmount,
      outputAmount: tx.outputAmount,
      inputToken: tx.inputToken,
      outputToken: tx.outputToken,
    }));
  }
}
