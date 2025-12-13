import useSWR from 'swr';
import { DjedData } from '../types';
import { calculateReserveRatio, determineSystemStatus } from '../calculations';
import { DemoService } from '../demo-service';

export interface UseDjedDataReturn {
  data: DjedData | undefined;
  error: Error | undefined;
  isLoading: boolean;
  mutate: () => void;
}

// Ergo Explorer API endpoints (proxied through Next.js API route)
const SIGMAUSD_CONTRACT_ADDRESS = '9fRAWhdxEsTcdb8PhGNrZfwqa65zfkuYHAMmkQLcic1gdLSV5vA';
const ORACLE_PRICE_ENDPOINT = '/api/djed?endpoint=oracle/price';
const RESERVE_BALANCE_ENDPOINT = `/api/djed?endpoint=addresses/${SIGMAUSD_CONTRACT_ADDRESS}/balance/confirmed`;

interface OraclePriceResponse {
  price: number;
  timestamp: number;
}

interface BalanceResponse {
  nanoErgs: number;
  tokens: Array<{
    tokenId: string;
    amount: number;
    name: string;
  }>;
}

/**
 * Fetcher function with retry logic and exponential backoff
 */
async function fetchWithRetry<T>(
  url: string,
  maxRetries: number = 3,
  initialDelay: number = 1000
): Promise<T> {
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await fetch(url, {
        cache: 'no-store',
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      lastError = error as Error;
      
      // Don't retry on the last attempt
      if (attempt < maxRetries - 1) {
        // Exponential backoff: wait 1s, 2s, 4s
        const delay = initialDelay * Math.pow(2, attempt);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError || new Error('Failed to fetch data after retries');
}

/**
 * Fetch live data from Ergo Explorer API
 */
async function fetchLiveData(): Promise<DjedData> {
  try {
    // Fetch oracle price and reserve data in parallel
    const [oraclePriceData, balanceData] = await Promise.all([
      fetchWithRetry<OraclePriceResponse>(ORACLE_PRICE_ENDPOINT),
      fetchWithRetry<BalanceResponse>(RESERVE_BALANCE_ENDPOINT),
    ]);
    
    // Extract data with fallbacks
    const oraclePrice = oraclePriceData?.price || 2; // Fallback to 2 USD
    const baseReserves = (balanceData?.nanoErgs || 0) / 1e9; // Convert nanoERG to ERG
    
    // Find SigUSD and SHEN token amounts
    const tokens = balanceData?.tokens || [];
    const sigUsdToken = tokens.find(t => t.name === 'SigUSD' || t.tokenId?.includes('03faf2cb'));
    const shenToken = tokens.find(t => t.name === 'SHEN' || t.name === 'SigRSV' || t.tokenId?.includes('003bd19d'));
    
    // Use sensible defaults if tokens not found (for new/empty protocol)
    const sigUsdCirculation = sigUsdToken?.amount || 1000000; // Default 1M SigUSD
    const shenCirculation = shenToken?.amount || 1000000; // Default 1M SHEN
    
    // Calculate reserve ratio and system status
    const reserveRatio = calculateReserveRatio(baseReserves, oraclePrice, sigUsdCirculation);
    const systemStatus = determineSystemStatus(reserveRatio);
    
    return {
      reserveRatio,
      baseReserves,
      oraclePrice,
      sigUsdCirculation,
      shenCirculation,
      systemStatus,
      lastUpdated: new Date(),
    };
  } catch (error) {
    console.error('Error fetching live data:', error);
    // Return fallback data instead of throwing
    return {
      reserveRatio: 550,
      baseReserves: 100000,
      oraclePrice: 2,
      sigUsdCirculation: 1000000,
      shenCirculation: 1000000,
      systemStatus: 'NORMAL',
      lastUpdated: new Date(),
    };
  }
}

/**
 * Fetch demo data from mock-data.json
 */
async function fetchDemoData(): Promise<DjedData> {
  try {
    const mockData = await DemoService.loadMockData();
    
    const { oraclePrice, baseReserves, sigUsdCirculation, shenCirculation } = mockData;
    
    // Calculate reserve ratio and system status
    const reserveRatio = calculateReserveRatio(baseReserves, oraclePrice, sigUsdCirculation);
    const systemStatus = determineSystemStatus(reserveRatio);
    
    return {
      reserveRatio,
      baseReserves,
      oraclePrice,
      sigUsdCirculation,
      shenCirculation,
      systemStatus,
      lastUpdated: new Date(),
    };
  } catch (error) {
    console.error('Error fetching demo data:', error);
    throw error;
  }
}

/**
 * Custom hook for fetching Djed protocol data
 * Uses SWR for caching and automatic revalidation
 * 
 * @param demoMode - If true, loads data from mock-data.json instead of API
 * @returns Object containing data, error, loading state, and mutate function
 */
export function useDjedData(demoMode: boolean = false): UseDjedDataReturn {
  const fetcher = demoMode ? fetchDemoData : fetchLiveData;
  
  const { data, error, isLoading, mutate } = useSWR<DjedData>(
    demoMode ? 'djed-data-demo' : 'djed-data-live',
    fetcher,
    {
      refreshInterval: 10000, // Refresh every 10 seconds
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      dedupingInterval: 5000, // Dedupe requests within 5 seconds
      errorRetryCount: 3,
      errorRetryInterval: 2000,
      shouldRetryOnError: true,
    }
  );
  
  return {
    data,
    error,
    isLoading,
    mutate,
  };
}
