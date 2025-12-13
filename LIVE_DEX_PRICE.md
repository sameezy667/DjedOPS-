# Live DEX Price Integration - Complete ✅

## Overview
Successfully upgraded the Arbitrage Monitor from hardcoded DEX prices to live market data from Spectrum Finance (Ergo's main DEX).

## What Was Implemented

### 1. **Backend API Route** (`app/api/dex/route.ts`)
- ✅ Created Next.js API route that fetches live pool data from Spectrum Finance
- ✅ Fetches SigUSD/ERG pool reserves
- ✅ Calculates real-time DEX price based on pool reserves
- ✅ Gets oracle ERG price to convert SigUSD/ERG ratio to USD

**Token IDs:**
- SigUSD: `03faf2cb329f2e90d6d23b58d91bbb6c046aa143261cc21f52fbe2824bfcbf04`

**Price Calculation:**
```typescript
// If SigUSD is token X, ERG is token Y:
sigUsdInErg = ergReserve / sigUsdReserve
priceUSD = sigUsdInErg * oracleErgPrice
```

**Features:**
- Automatically finds SigUSD/ERG pool from Spectrum pools list
- Handles both pool configurations (SigUSD as X or Y)
- Graceful fallback to $1.00 on errors (doesn't break UI)
- 15-second cache revalidation
- Returns liquidity (TVL) and data source

### 2. **Frontend Hook** (`lib/hooks/useDexPrice.ts`)
- ✅ Updated to fetch from `/api/dex` instead of mock data
- ✅ Polls every 15 seconds for fresh data
- ✅ Calculates spread: `((dexPrice - protocolPrice) / protocolPrice) * 100`
- ✅ Returns arbitrage signal based on thresholds

**Arbitrage Logic:**
- `spreadPercent >= 0.5%` → **MINT DJED** (Green) - DEX price is higher, mint and sell
- `spreadPercent <= -0.5%` → **REDEEM DJED** (Red) - DEX price is lower, buy and redeem
- Otherwise → **NO CLEAR EDGE** (Gray) - Spread too small to profit

**Configuration:**
```typescript
export const MINT_THRESHOLD_PCT = 0.5;   // 0.5% above protocol
export const REDEEM_THRESHOLD_PCT = -0.5; // 0.5% below protocol
```

### 3. **Updated Component** (`components/MarketOpportunityCard.tsx`)
- ✅ Now displays live DEX price from Spectrum
- ✅ Shows liquidity amount and data source
- ✅ Signal changes dynamically based on real spread
- ✅ Color-coded signals with glow effects

**Display:**
- DEX Price: Live from Spectrum pools
- Protocol Price: From oracle/reserves calculation
- Spread: Absolute and percentage difference
- Liquidity: Total value locked in pool
- Source: "spectrum" (live) or "demo" (fallback)
- Signal: MINT/REDEEM/NO CLEAR EDGE

## How It Works

### Price Discovery Flow:

1. **API fetches Spectrum pools**
   ```
   GET https://api.spectrum.fi/v1/amm/pools
   ```

2. **Find SigUSD/ERG pool**
   - Checks for SigUSD token ID in either X or Y position
   - Confirms other side is ERG (native token)

3. **Calculate price**
   - Extract reserves: `sigUsdReserve`, `ergReserve`
   - Get price ratio: `ergPerSigUsd = ergReserve / sigUsdReserve`
   - Convert to USD: `priceUSD = ergPerSigUsd * oracleErgPrice`

4. **Frontend compares prices**
   - Fetch protocol price (from reserves/oracle)
   - Fetch DEX price (from API)
   - Calculate spread percentage
   - Determine signal (MINT/REDEEM/NEUTRAL)

5. **Display arbitrage opportunity**
   - Show both prices side-by-side
   - Highlight profitable direction
   - Update every 15 seconds

## API Response Format

```json
{
  "success": true,
  "price": 1.0150,
  "pair": "SigUSD/ERG",
  "liquidity": 250000,
  "source": "spectrum"
}
```

**On Error:**
```json
{
  "success": false,
  "error": "Pool not found",
  "price": 1.0,
  "pair": "SigUSD/ERG",
  "liquidity": 0,
  "source": "fallback"
}
```

## Arbitrage Signals Explained

### 🟢 MINT DJED (Green)
**When:** DEX price > protocol price by 0.5%+

**Strategy:**
1. Buy ERG
2. Mint SigUSD at protocol (pay $1.00 equivalent in ERG)
3. Sell SigUSD on DEX for premium (get $1.02)
4. Profit: 2% minus fees

### 🔴 REDEEM DJED (Red)
**When:** DEX price < protocol price by 0.5%+

**Strategy:**
1. Buy SigUSD on DEX at discount (pay $0.98)
2. Redeem SigUSD at protocol (get $1.00 equivalent in ERG)
3. Sell ERG
4. Profit: 2% minus fees

### ⚪ NO CLEAR EDGE (Gray)
**When:** Spread is between -0.5% and +0.5%

**Meaning:** Prices are too close, fees would eat profits

## Testing

### Live Mode (uses Spectrum API):
```
http://localhost:3000/?demo=false
```

### Demo Mode (uses mock $1.02):
```
http://localhost:3000/?demo=true
```

## Performance Considerations

- ✅ 15-second polling prevents API rate limits
- ✅ SWR deduplication prevents duplicate requests
- ✅ Caching at API level (Next.js revalidation)
- ✅ Graceful fallback prevents UI breaks
- ✅ Liquidity display helps assess trade size viability

## Error Handling

1. **Spectrum API down** → Returns fallback price ($1.00)
2. **Pool not found** → Returns fallback with error message
3. **Invalid pool data** → Gracefully handles and logs error
4. **Network timeout** → SWR retries automatically
5. **Demo mode** → Always uses $1.02 mock price

## Future Enhancements

### Potential Additions:
1. **Multiple DEX support** - Check prices across Spectrum, Ergodex, etc.
2. **Historical spread chart** - Show arbitrage opportunities over time
3. **Profit calculator** - Input trade size, see estimated profit
4. **Fee estimation** - Include DEX fees and slippage in signal
5. **Notification system** - Alert when profitable opportunity appears
6. **Trade execution** - One-click arbitrage (requires wallet integration)
7. **Slippage warning** - Show if liquidity is too low for trade size

## Files Modified/Created

### Created:
- `app/api/dex/route.ts` - Backend DEX price API

### Modified:
- `lib/hooks/useDexPrice.ts` - Updated to use live API
- `components/MarketOpportunityCard.tsx` - Added liquidity and source display

## Technical Details

### Spectrum API Integration:
- Endpoint: `https://api.spectrum.fi/v1/amm/pools`
- Method: GET
- Response: Array of pool objects with reserves and TVL
- Rate limit: Reasonable with 15s polling
- No authentication required

### Pool Identification:
```typescript
// Find pool with SigUSD token
const sigUsdPool = pools.find(pool => {
  const hasSigUsd = 
    pool.lockedX.asset.tokenId === SIGUSD_TOKEN_ID || 
    pool.lockedY.asset.tokenId === SIGUSD_TOKEN_ID;
  
  const hasErg = /* check for ERG on other side */;
  
  return hasSigUsd && hasErg;
});
```

### Price Formula:
```
Price per SigUSD (USD) = (ERG_Reserve / SigUSD_Reserve) × ERG_Oracle_Price_USD
```

## Example Calculation

**Given:**
- ERG Reserve: 100,000 ERG
- SigUSD Reserve: 145,000 SigUSD
- Oracle ERG Price: $1.45

**Calculate:**
```
ERG per SigUSD = 100,000 / 145,000 = 0.6897 ERG
Price USD = 0.6897 × $1.45 = $1.00

DEX Price = $1.00
Protocol Price = $1.00
Spread = 0%
Signal = NO CLEAR EDGE
```

**If DEX had less SigUSD:**
```
ERG Reserve: 100,000 ERG
SigUSD Reserve: 140,000 SigUSD (5,000 bought)
ERG per SigUSD = 100,000 / 140,000 = 0.7143 ERG
Price USD = 0.7143 × $1.45 = $1.036

DEX Price = $1.036
Protocol Price = $1.00
Spread = +3.6%
Signal = MINT DJED 🟢
```

---

**Status: Complete and Production-Ready** ✅

The Arbitrage Monitor now shows real-time arbitrage opportunities using live DEX data from Spectrum Finance!
