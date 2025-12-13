// Core data types for DjedOps Dashboard

export interface DjedData {
  reserveRatio: number;        // Percentage (e.g., 405.5)
  baseReserves: number;        // ERG amount (e.g., 12500000)
  oraclePrice: number;         // USD price (e.g., 1.45)
  sigUsdCirculation: number;   // Total SigUSD in circulation
  shenCirculation: number;     // Total SHEN in circulation
  systemStatus: 'NORMAL' | 'CRITICAL';
  lastUpdated: Date;
}

export interface WalletState {
  isConnected: boolean;
  address: string | null;
  balance: number | null;
  error: string | null;
}

export type TransactionType = 
  | 'MINT_DJED' 
  | 'MINT_SHEN' 
  | 'REDEEM_DJED' 
  | 'REDEEM_SHEN' 
  | 'ORACLE_UPDATE'
  | 'SENTINEL_TRIGGER'
  | 'SCENARIO_ACTIVATED'
  | 'VOLATILITY_ALERT'
  | 'TRANSFER';

export interface TransactionEvent {
  id: string;
  timestamp: Date;
  type: TransactionType;
  details: string;
  inputAmount?: number;
  outputAmount?: number;
  inputToken?: string;
  outputToken?: string;
  isWhale?: boolean;
  whaleType?: 'ERG' | 'DJED';
}

export type SimulationScenario = 'none' | 'flash_crash' | 'oracle_freeze' | 'bank_run';

export type ArbitrageSignal = 'MINT DJED' | 'REDEEM DJED' | 'NO CLEAR EDGE';

export interface SentinelConfig {
  enabled: boolean;
  autoRedeemOnCritical: boolean;
  notifyOnVolatility: boolean;
  watchedBalance: number;
}

export interface ArbitrageData {
  dexPrice: number;
  protocolPrice: number;
  spread: number;
  spreadPercent: number;
  signal: ArbitrageSignal;
}
