'use client';

import useSWR from 'swr';
import { useAppStore } from '@/lib/store';

// Arbitrage thresholds (configurable constants)
export const MINT_THRESHOLD_PCT = 0.5;  // DEX at least 0.5% above protocol
export const REDEEM_THRESHOLD_PCT = -0.5;  // DEX at least 0.5% below protocol

// Demo/fallback DEX price
const DEMO_DEX_PRICE = 1.02;

interface DexPriceResponse {
  success: boolean;
  price: number;
  pair: string;
  liquidity: number;
  source: string;
  error?: string;
}

/**
 * Fetch live DEX price from Spectrum Finance API
 */
async function fetchDexPrice(): Promise<DexPriceResponse> {
  const response = await fetch('/api/dex', {
    headers: {
      'Accept': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch DEX price: ${response.status}`);
  }

  return response.json();
}

/**
 * Hook to fetch DEX price and calculate arbitrage opportunity
 * Fetches live price from Spectrum Finance DEX
 */
export function useDexPrice(protocolPrice: number) {
  const isDemoMode = useAppStore((state) => state.isDemoMode);
  
  const { data: dexData, error } = useSWR<DexPriceResponse>(
    isDemoMode ? null : '/api/dex',
    fetchDexPrice,
    {
      refreshInterval: 15000, // 15 seconds
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      dedupingInterval: 10000,
      onError: (err) => {
        console.error('DEX price fetch error:', err);
      },
    }
  );

  // Determine effective DEX price
  let effectiveDexPrice: number;
  let liquidity = 0;
  let source = 'demo';

  if (isDemoMode) {
    effectiveDexPrice = DEMO_DEX_PRICE;
  } else if (dexData && dexData.success) {
    effectiveDexPrice = dexData.price;
    liquidity = dexData.liquidity;
    source = dexData.source;
  } else if (error || !dexData) {
    // Fallback to demo price on error
    effectiveDexPrice = DEMO_DEX_PRICE;
  } else {
    effectiveDexPrice = dexData.price; // Use fallback from API
  }

  // Calculate arbitrage metrics with safety guards
  const spread = effectiveDexPrice - protocolPrice;
  
  // Safety: Guard against division by zero
  const spreadPercent = protocolPrice > 0 
    ? (spread / protocolPrice) * 100 
    : 0;

  // Determine signal based on thresholds
  let signal: 'MINT DJED' | 'REDEEM DJED' | 'NO CLEAR EDGE';
  if (spreadPercent >= MINT_THRESHOLD_PCT) {
    signal = 'MINT DJED';
  } else if (spreadPercent <= REDEEM_THRESHOLD_PCT) {
    signal = 'REDEEM DJED';
  } else {
    signal = 'NO CLEAR EDGE';
  }

  return {
    dexPrice: effectiveDexPrice,
    protocolPrice,
    spread,
    spreadPercent,
    signal,
    liquidity,
    source,
    isLoading: !dexData && !isDemoMode && !error,
    isError: !!error,
  };
}
