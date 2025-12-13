                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                /**
 * Djed Stability Index (DSI) Calculator
 * 
 * Calculates a proprietary health score (0-100) based on:
 * - Reserve Ratio (50 points)
 * - Peg Stability (30 points)
 * - Trend Factor (20 points)
 */

export interface DSIResult {
  score: number;
  label: string;
  color: string;
  breakdown: {
    ratioScore: number;
    pegScore: number;
    trendScore: number;
  };
}

/**
 * Calculate Djed Stability Index
 * 
 * @param ratio - Reserve ratio percentage (e.g., 405.5)
 * @param oraclePrice - Protocol/oracle price (e.g., 1.00)
 * @param dexPrice - DEX market price (e.g., 1.02), can be null/0 if unavailable
 * @returns DSI result with score, label, color, and breakdown
 */
export function calculateDSI(
  ratio: number,
  oraclePrice: number,
  dexPrice: number | null
): DSIResult {
  let score = 0;
  const breakdown = {
    ratioScore: 0,
    pegScore: 0,
    trendScore: 0,
  };

  // Check if DEX price is available
  const isDexPriceAvailable = dexPrice != null && dexPrice > 0;

  // ============================================
  // 1. RATIO FACTOR (50 points max)
  // ============================================
  if (ratio >= 400) {
    breakdown.ratioScore = 50; // Full Health
  } else if (ratio >= 300) {
    breakdown.ratioScore = 30; // Warning
  } else {
    breakdown.ratioScore = 10; // Critical
  }
  score += breakdown.ratioScore;

  // ============================================
  // 2. PEG FACTOR (30 points max)
  // ============================================
  if (isDexPriceAvailable && dexPrice && oraclePrice > 0) {
    // Safety: Guard against division by zero
    const deviation = Math.abs(1 - (dexPrice / oraclePrice));
    
    // Validate deviation is finite
    if (isFinite(deviation)) {
      if (deviation < 0.01) {
        // Less than 1% deviation
        breakdown.pegScore = 30;
      } else if (deviation < 0.03) {
        // Less than 3% deviation
        breakdown.pegScore = 15;
      } else {
        // Greater than 3% deviation
        breakdown.pegScore = 0;
      }
    } else {
      // Invalid calculation - assign neutral score
      breakdown.pegScore = 15;
    }
  } else {
    // DEX price unavailable or oracle price invalid - assign neutral score
    breakdown.pegScore = 15; // Assume neutral if we can't verify
  }
  score += breakdown.pegScore;

  // ============================================
  // 3. TREND FACTOR (20 points max)
  // ============================================
  // For now, assume stable trend
  // In the future, this could use historical data to detect
  // whether the reserve ratio is improving or degrading
  breakdown.trendScore = 20;
  score += breakdown.trendScore;

  // ============================================
  // 4. DETERMINE LABEL & COLOR
  // ============================================
  let label: string;
  let color: string;

  if (score >= 80) {
    label = 'EXCELLENT';
    color = '#39FF14'; // Terminal green
  } else if (score >= 50) {
    label = 'STABLE';
    color = '#F59E0B'; // Yellow/amber
  } else {
    label = 'CRITICAL';
    color = '#EF4444'; // Red
  }

  return {
    score,
    label,
    color,
    breakdown,
  };
}
