// Calculation utilities for DjedOps Dashboard

/**
 * Calculate the reserve ratio for the Djed protocol
 * Formula: (baseReserves * oraclePrice) / sigUsdCirculation * 100
 * 
 * @param baseReserves - Total ERG held in reserve pool
 * @param oraclePrice - Current ERG price in USD
 * @param sigUsdCirculation - Total SigUSD in circulation
 * @returns Reserve ratio as a percentage (returns 0 if sigUsdCirculation is 0)
 */
export function calculateReserveRatio(
  baseReserves: number,
  oraclePrice: number,
  sigUsdCirculation: number
): number {
  // Safety guards: check for null/undefined/zero values
  if (baseReserves == null || oraclePrice == null || sigUsdCirculation == null) {
    console.warn('⚠️ Invalid input to calculateReserveRatio: null or undefined values');
    return 0;
  }

  // Handle zero or negative values gracefully
  if (sigUsdCirculation <= 0) {
    console.warn('⚠️ SigUSD circulation is zero or negative, returning 0% reserve ratio');
    return 0;
  }

  if (oraclePrice <= 0) {
    console.warn('⚠️ Oracle price is zero or negative, returning 0% reserve ratio');
    return 0;
  }

  if (baseReserves < 0) {
    console.warn('⚠️ Base reserves is negative, returning 0% reserve ratio');
    return 0;
  }
  
  // Correct formula: (reserves in USD / stablecoin supply in USD) * 100 for percentage
  const ratio = (baseReserves * oraclePrice) / sigUsdCirculation * 100;
  
  // Validate result is a finite number
  if (!isFinite(ratio)) {
    console.warn('⚠️ Reserve ratio calculation resulted in non-finite value');
    return 0;
  }
  
  return ratio;
}

/**
 * Determine system status based on reserve ratio
 * Critical threshold is 400%
 * 
 * @param reserveRatio - Current reserve ratio percentage
 * @returns 'NORMAL' if ratio >= 400%, 'CRITICAL' if ratio < 400%
 */
export function determineSystemStatus(
  reserveRatio: number
): 'NORMAL' | 'CRITICAL' {
  return reserveRatio >= 400 ? 'NORMAL' : 'CRITICAL';
}

/**
 * Format price value for display
 * Always shows exactly 2 decimal places with USD indicator
 * 
 * @param price - Price value to format
 * @returns Formatted price string (e.g., "$1.45")
 */
export function formatPrice(price: number): string {
  return `$${price.toFixed(2)}`;
}

/**
 * Format wallet balance for display
 * Always shows exactly 2 decimal places with "WAL: XXX.XX ERG" format
 * 
 * @param balance - Balance value in ERG to format
 * @returns Formatted balance string (e.g., "WAL: 123.45 ERG")
 */
export function formatWalletBalance(balance: number): string {
  return `WAL: ${balance.toFixed(2)} ERG`;
}
