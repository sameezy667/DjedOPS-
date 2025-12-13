import { NextResponse } from 'next/server';

// Spectrum Finance API endpoints
const SPECTRUM_MARKETS_API = 'https://api.spectrum.fi/v1/price-tracking/markets';
const SPECTRUM_POOL_API = 'https://api.spectrum.fi/v1/amm/pools';

// Token IDs
const SIGUSD_TOKEN_ID = '03faf2cb329f2e90d6d23b58d91bbb6c046aa143261cc21f52fbe2824bfcbf04';
const ERG_DECIMALS = 9;
const SIGUSD_DECIMALS = 2;

interface SpectrumPool {
  id: string;
  lockedX: {
    asset: {
      tokenId: string;
      decimals: number;
    };
    amount: number;
  };
  lockedY: {
    asset: {
      tokenId: string;
      decimals: number;
    };
    amount: number;
  };
  tvl?: {
    value: number;
  };
}

interface DexPriceResponse {
  success: boolean;
  price: number;
  pair: string;
  liquidity: number;
  source: string;
  error?: string;
}

/**
 * Calculate price from pool reserves
 * Price = (reserveY / 10^decimalsY) / (reserveX / 10^decimalsX)
 */
function calculatePriceFromPool(pool: SpectrumPool, oracleErgPrice: number): number | null {
  const { lockedX, lockedY } = pool;
  
  // Determine which side is SigUSD
  const isSigUsdX = lockedX.asset.tokenId === SIGUSD_TOKEN_ID;
  
  if (isSigUsdX) {
    // SigUSD is X, ERG is Y
    const sigUsdReserve = lockedX.amount / Math.pow(10, SIGUSD_DECIMALS);
    const ergReserve = lockedY.amount / Math.pow(10, ERG_DECIMALS);
    
    if (sigUsdReserve === 0) return null;
    
    // Price of 1 SigUSD in ERG
    const sigUsdInErg = ergReserve / sigUsdReserve;
    
    // Convert to USD using oracle ERG price
    return sigUsdInErg * oracleErgPrice;
  } else {
    // ERG is X, SigUSD is Y
    const ergReserve = lockedX.amount / Math.pow(10, ERG_DECIMALS);
    const sigUsdReserve = lockedY.amount / Math.pow(10, SIGUSD_DECIMALS);
    
    if (ergReserve === 0) return null;
    
    // Price of 1 SigUSD in ERG
    const sigUsdInErg = ergReserve / sigUsdReserve;
    
    // Convert to USD using oracle ERG price
    return sigUsdInErg * oracleErgPrice;
  }
}

/**
 * Fetch SigUSD/ERG pool data from Spectrum
 */
async function fetchSpectrumPools(): Promise<SpectrumPool[]> {
  const response = await fetch(SPECTRUM_POOL_API, {
    headers: {
      'Accept': 'application/json',
    },
    cache: 'no-store', // Disable caching
  });

  if (!response.ok) {
    throw new Error(`Spectrum API error: ${response.status}`);
  }

  const data = await response.json();
  return data.items || data || [];
}

/**
 * Get current ERG price from oracle endpoint
 */
async function getOracleErgPrice(): Promise<number> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/djed?endpoint=oracle/price`, {
      cache: 'no-store', // Disable caching
    });
    
    if (!response.ok) {
      throw new Error('Oracle price fetch failed');
    }
    
    const data = await response.json();
    return data.price || 1.45; // Fallback to reasonable default
  } catch (error) {
    console.error('Failed to fetch oracle price:', error);
    return 1.45; // Fallback
  }
}

export async function GET() {
  try {
    // Fetch oracle ERG price first
    const oracleErgPrice = await getOracleErgPrice();
    
    // Fetch all pools from Spectrum
    const pools = await fetchSpectrumPools();
    
    // Find SigUSD/ERG pool
    const sigUsdPool = pools.find(pool => {
      const hasSigUsd = 
        pool.lockedX.asset.tokenId === SIGUSD_TOKEN_ID || 
        pool.lockedY.asset.tokenId === SIGUSD_TOKEN_ID;
      
      // Check if other side is ERG (native token has empty or special ID)
      const hasErg = 
        !pool.lockedX.asset.tokenId || 
        !pool.lockedY.asset.tokenId ||
        pool.lockedX.asset.tokenId === '0000000000000000000000000000000000000000000000000000000000000000' ||
        pool.lockedY.asset.tokenId === '0000000000000000000000000000000000000000000000000000000000000000';
      
      return hasSigUsd && hasErg;
    });

    if (!sigUsdPool) {
      return NextResponse.json({
        success: false,
        error: 'SigUSD/ERG pool not found',
        price: 1.0,
        pair: 'SigUSD/ERG',
        liquidity: 0,
        source: 'fallback',
      } as DexPriceResponse);
    }

    // Calculate price
    const price = calculatePriceFromPool(sigUsdPool, oracleErgPrice);
    
    if (price === null) {
      throw new Error('Failed to calculate price from pool');
    }

    // Get liquidity (TVL)
    const liquidity = sigUsdPool.tvl?.value || 0;

    const response: DexPriceResponse = {
      success: true,
      price: price,
      pair: 'SigUSD/ERG',
      liquidity: liquidity,
      source: 'spectrum',
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching DEX price:', error);
    
    // Return fallback data instead of error
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch DEX price',
      price: 1.0,
      pair: 'SigUSD/ERG',
      liquidity: 0,
      source: 'fallback',
    } as DexPriceResponse, { status: 200 }); // Return 200 to avoid breaking the UI
  }
}
