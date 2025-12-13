import { NextResponse } from 'next/server';

/**
 * API Proxy Route to fix CORS issues with Ergo Explorer API
 * 
 * This endpoint proxies requests to the Ergo Explorer API to avoid
 * CORS (Cross-Origin Resource Sharing) errors when running locally.
 * 
 * Usage:
 * - GET /api/djed?endpoint=oracle/price
 * - GET /api/djed?endpoint=addresses/{address}/balance/confirmed
 */

const ERGO_API_BASE = 'https://api.ergoplatform.com/api/v1';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const endpoint = searchParams.get('endpoint');

    if (!endpoint) {
      return NextResponse.json(
        { error: 'Missing endpoint parameter' },
        { status: 400 }
      );
    }

    // Special handling for oracle/price endpoint
    if (endpoint === 'oracle/price') {
      try {
        // Fetch ERG price from CoinGecko
        const priceResponse = await fetch(
          'https://api.coingecko.com/api/v3/simple/price?ids=ergo&vs_currencies=usd',
          {
            headers: { 'Accept': 'application/json' },
            cache: 'no-store',
          }
        );
        
        if (!priceResponse.ok) {
          throw new Error('CoinGecko API failed');
        }
        
        const priceData = await priceResponse.json();
        const ergPrice = priceData?.ergo?.usd || 1.45; // Fallback to reasonable default
        
        return NextResponse.json({
          price: ergPrice, // ERG price in USD (e.g., 1.45)
          timestamp: Date.now(),
        });
      } catch (error) {
        console.error('Failed to fetch ERG price from CoinGecko:', error);
        // Return fallback price
        return NextResponse.json({
          price: 1.45, // Reasonable fallback for ERG price in USD
          timestamp: Date.now(),
        });
      }
    }

    // Construct the full API URL for other endpoints
    const apiUrl = `${ERGO_API_BASE}/${endpoint}`;

    // Fetch from Ergo Explorer API
    const response = await fetch(apiUrl, {
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `API returned ${response.status}: ${response.statusText}` },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Return the data with CORS headers
    return NextResponse.json(data, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });

  } catch (error) {
    console.error('Proxy error:', error);
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Handle OPTIONS requests for CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
