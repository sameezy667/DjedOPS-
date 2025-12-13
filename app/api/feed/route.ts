import { NextResponse } from 'next/server';

const WHALE_THRESHOLD_ERG = 10000;
const WHALE_THRESHOLD_DJED = 50000;

const SIGMAUSD_BANK_ADDRESS = '9fRAWhdxEsTcdb8PhGNrZfwqa65zfkuYHAMmkQLcic1gdLSV5vA';
const SIGUSD_TOKEN_ID = '03faf2cb329f2e90d6d23b58d91bbb6c046aa143261cc21f52fbe2824bfcbf04';
const SIGRSV_TOKEN_ID = '003bd19d0187117f130b62e1bcab0939929ff5c7709f843c5c4dd158949285d0';

interface ErgoTransaction {
  id: string;
  timestamp: number;
  inputs: Array<{
    boxId: string;
    value: number;
    assets: Array<{
      tokenId: string;
      amount: number;
    }>;
  }>;
  outputs: Array<{
    boxId: string;
    value: number;
    assets: Array<{
      tokenId: string;
      amount: number;
    }>;
  }>;
}

interface TransactionEvent {
  id: string;
  timestamp: Date | string;
  type: 'MINT_DJED' | 'MINT_SHEN' | 'REDEEM_DJED' | 'REDEEM_SHEN' | 'TRANSFER';
  details: string;
  status?: 'confirmed' | 'pending';
  inputAmount?: number;
  outputAmount?: number;
  inputToken?: string;
  outputToken?: string;
  isWhale?: boolean;
  whaleType?: 'ERG' | 'DJED';
}

/**
 * Detect transaction type based on token movements
 */
function detectTransactionType(tx: ErgoTransaction, isFirstTx: boolean = false): TransactionEvent | null {
  // 🔍 DEBUG: Log token IDs in first transaction
  if (isFirstTx) {
    console.log('🔍 Examining first transaction tokens:');
    console.log('   - Looking for SigUSD:', SIGUSD_TOKEN_ID);
    console.log('   - Looking for SigRSV:', SIGRSV_TOKEN_ID);
    
    const allInputTokens = tx.inputs.flatMap(input => input.assets?.map(a => a.tokenId) || []);
    const allOutputTokens = tx.outputs.flatMap(output => output.assets?.map(a => a.tokenId) || []);
    
    console.log('   - Input tokens found:', allInputTokens.slice(0, 3));
    console.log('   - Output tokens found:', allOutputTokens.slice(0, 3));
  }

  const hasInputSigUSD = tx.inputs.some(input => 
    input.assets.some(asset => asset.tokenId === SIGUSD_TOKEN_ID)
  );
  const hasOutputSigUSD = tx.outputs.some(output => 
    output.assets.some(asset => asset.tokenId === SIGUSD_TOKEN_ID)
  );
  const hasInputSigRSV = tx.inputs.some(input => 
    input.assets.some(asset => asset.tokenId === SIGRSV_TOKEN_ID)
  );
  const hasOutputSigRSV = tx.outputs.some(output => 
    output.assets.some(asset => asset.tokenId === SIGRSV_TOKEN_ID)
  );

  // Calculate ERG amounts with safety guards
  const totalInputErg = tx.inputs && tx.inputs.length > 0
    ? tx.inputs.reduce((sum, input) => sum + (input.value || 0), 0) / 1e9
    : 0;
  const totalOutputErg = tx.outputs && tx.outputs.length > 0
    ? tx.outputs.reduce((sum, output) => sum + (output.value || 0), 0) / 1e9
    : 0;

  // Get token amounts with safety guards
  const getSigUSDAmount = (boxes: typeof tx.outputs) => {
    if (!boxes || boxes.length === 0) return 0;
    const asset = boxes.flatMap(box => box.assets || []).find(a => a && a.tokenId === SIGUSD_TOKEN_ID);
    return asset && asset.amount ? asset.amount / 100 : 0; // SigUSD has 2 decimals
  };

  const getSigRSVAmount = (boxes: typeof tx.outputs) => {
    if (!boxes || boxes.length === 0) return 0;
    const asset = boxes.flatMap(box => box.assets || []).find(a => a && a.tokenId === SIGRSV_TOKEN_ID);
    return asset && asset.amount != null ? asset.amount : 0; // SigRSV has 0 decimals
  };

  const timestamp = new Date(tx.timestamp);

  // Determine transaction type
  if (hasOutputSigUSD && !hasInputSigUSD) {
    // MINT_DJED: User sent ERG, got SigUSD
    const sigUsdAmount = getSigUSDAmount(tx.outputs);
    const isWhaleErg = totalInputErg > WHALE_THRESHOLD_ERG;
    const isWhaleDjed = sigUsdAmount > WHALE_THRESHOLD_DJED;
    return {
      id: tx.id,
      timestamp,
      type: 'MINT_DJED',
      details: `Minted ${sigUsdAmount.toFixed(2)} SigUSD`,
      inputAmount: totalInputErg,
      outputAmount: sigUsdAmount,
      inputToken: 'ERG',
      outputToken: 'SigUSD',
      isWhale: isWhaleErg || isWhaleDjed,
      whaleType: isWhaleErg ? 'ERG' : (isWhaleDjed ? 'DJED' : undefined),
    };
  } else if (hasInputSigUSD && !hasOutputSigUSD) {
    // REDEEM_DJED: User sent SigUSD, got ERG back
    const sigUsdAmount = getSigUSDAmount(tx.inputs);
    const isWhaleErg = totalOutputErg > WHALE_THRESHOLD_ERG;
    const isWhaleDjed = sigUsdAmount > WHALE_THRESHOLD_DJED;
    return {
      id: tx.id,
      timestamp,
      type: 'REDEEM_DJED',
      details: `Redeemed ${sigUsdAmount.toFixed(2)} SigUSD`,
      inputAmount: sigUsdAmount,
      outputAmount: totalOutputErg,
      inputToken: 'SigUSD',
      outputToken: 'ERG',
      isWhale: isWhaleErg || isWhaleDjed,
      whaleType: isWhaleErg ? 'ERG' : (isWhaleDjed ? 'DJED' : undefined),
    };
  } else if (hasOutputSigRSV && !hasInputSigRSV) {
    // MINT_SHEN: User sent ERG, got SigRSV
    const sigRsvAmount = getSigRSVAmount(tx.outputs);
    const isWhaleErg = totalInputErg > WHALE_THRESHOLD_ERG;
    return {
      id: tx.id,
      timestamp,
      type: 'MINT_SHEN',
      details: `Minted ${sigRsvAmount} SHEN`,
      inputAmount: totalInputErg,
      outputAmount: sigRsvAmount,
      inputToken: 'ERG',
      outputToken: 'SigRSV',
      isWhale: isWhaleErg,
      whaleType: isWhaleErg ? 'ERG' : undefined,
    };
  } else if (hasInputSigRSV && !hasOutputSigRSV) {
    // REDEEM_SHEN: User sent SigRSV, got ERG back
    const sigRsvAmount = getSigRSVAmount(tx.inputs);
    const isWhaleErg = totalOutputErg > WHALE_THRESHOLD_ERG;
    return {
      id: tx.id,
      timestamp,
      type: 'REDEEM_SHEN',
      details: `Redeemed ${sigRsvAmount} SHEN`,
      inputAmount: sigRsvAmount,
      outputAmount: totalOutputErg,
      inputToken: 'SigRSV',
      outputToken: 'ERG',
      isWhale: isWhaleErg,
      whaleType: isWhaleErg ? 'ERG' : undefined,
    };
  }

  return null;
}

export async function GET() {
  try {
    const response = await fetch(
      `https://api.ergoplatform.com/api/v1/addresses/${SIGMAUSD_BANK_ADDRESS}/transactions?limit=20`,
      {
        headers: {
          'Accept': 'application/json',
        },
        cache: 'no-store', // Disable caching due to large response size
      }
    );

    if (!response.ok) {
      throw new Error(`Ergo API error: ${response.status}`);
    }

    const data = await response.json();
    const transactions: ErgoTransaction[] = data.items || [];

    // 🔍 DEBUG: Log first transaction to verify structure
    if (transactions.length > 0) {
      const sample = transactions[0];
      console.log('🔍 Sample Transaction from API:');
      console.log('   - id:', sample.id);
      console.log('   - id type:', typeof sample.id);
      console.log('   - id length:', sample.id?.length);
      console.log('   - timestamp:', sample.timestamp);
      console.log('   - Available fields:', Object.keys(sample).join(', '));
    }

    // Map transactions to TransactionEvent format
    // NOTE: Since this address has no SigUSD/SHEN activity, we'll show ALL transactions
    // instead of filtering, so users can see real blockchain activity
    const events: TransactionEvent[] = transactions
      .slice(0, 10) // Take top 10 transactions
      .map((tx, index) => {
        const detectedEvent = detectTransactionType(tx, index === 0);
        
        // If detection fails (no SigUSD/SHEN tokens), create a generic transaction event
        if (!detectedEvent) {
          const totalErg = tx.outputs.reduce((sum, output) => sum + output.value, 0) / 1e9;
          const isWhaleErg = totalErg > WHALE_THRESHOLD_ERG;
          return {
            id: tx.id,
            type: 'TRANSFER' as const,
            timestamp: new Date(tx.timestamp).toISOString(),
            details: `${totalErg.toFixed(2)} ERG`,
            status: 'confirmed' as const,
            isWhale: isWhaleErg,
            whaleType: isWhaleErg ? 'ERG' : undefined,
          };
        }
        
        return detectedEvent;
      });
    
    // 🔍 DEBUG: Log mapped events
    console.log('🔍 Transaction Events:');
    console.log('   - Total fetched:', transactions.length);
    console.log('   - Events created:', events.length);
    
    if (events.length > 0) {
      console.log('🔍 First Event:');
      console.log('   - id:', events[0].id);
      console.log('   - type:', events[0].type);
      console.log('   - details:', events[0].details);
    }

    return NextResponse.json({
      success: true,
      events: events.map(e => ({
        ...e,
        timestamp: typeof e.timestamp === 'string' ? e.timestamp : e.timestamp.toISOString(),
      })),
      count: events.length,
    });
  } catch (error) {
    console.error('Error fetching transaction feed:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch transactions',
        events: [],
      },
      { status: 500 }
    );
  }
}
