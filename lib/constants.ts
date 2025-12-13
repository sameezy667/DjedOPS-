/**
 * Application Constants
 * Centralized location for all magic numbers and configuration values
 */

// Reserve Ratio Thresholds
export const RESERVE_RATIO = {
  /** Critical threshold below which system enters CRITICAL state */
  CRITICAL_THRESHOLD: 400,
  /** Safe threshold above which system enters SAFE state */
  SAFE_THRESHOLD: 800,
  /** Minimum ratio for Shen minting */
  MIN_SHEN_MINT: 400,
  /** Maximum ratio for Shen redemption */
  MAX_SHEN_REDEEM: 800,
} as const;

// API Configuration
export const API_CONFIG = {
  /** Data staleness threshold in milliseconds */
  STALE_DATA_THRESHOLD: 30000, // 30 seconds
  /** Stale data check interval in milliseconds */
  STALE_CHECK_INTERVAL: 5000, // 5 seconds
  /** Transaction feed max items */
  MAX_TRANSACTION_FEED_ITEMS: 50,
  /** Whale transaction threshold in ERG */
  WHALE_THRESHOLD: 1000,
} as const;

// Price Simulation
export const SIMULATION = {
  /** Minimum ERG price in USD */
  MIN_PRICE: 0.10,
  /** Maximum ERG price in USD */
  MAX_PRICE: 10.00,
  /** Price slider step */
  PRICE_STEP: 0.01,
  /** Flash crash percentage */
  FLASH_CRASH_MULTIPLIER: 0.5,
  /** Auto-dismiss timeout for sentinel in milliseconds */
  SENTINEL_AUTO_DISMISS: 10000, // 10 seconds
} as const;

// Animation & UI
export const UI_CONFIG = {
  /** Grid size for interactive background */
  GRID_SIZE: 50,
  /** Mouse interaction radius */
  MOUSE_INTERACTION_RADIUS: 150,
  /** Animation frame rate target */
  TARGET_FPS: 60,
  /** Modal z-index */
  MODAL_Z_INDEX: 50,
  /** Notification z-index */
  NOTIFICATION_Z_INDEX: 9999,
} as const;

// Color Palette
export const COLORS = {
  /** Terminal green */
  TERMINAL: '#39FF14',
  /** Alert red */
  ALERT: '#FF2A2A',
  /** Safe cyan */
  SAFE: '#00F0FF',
  /** Warning yellow */
  WARNING: '#FFC107',
  /** Void black */
  VOID: '#050505',
  /** Text primary */
  TEXT_PRIMARY: '#E5E5E5',
  /** Text secondary */
  TEXT_SECONDARY: '#A3A3A3',
} as const;

// Blockchain
export const BLOCKCHAIN = {
  /** SigmaUSD contract address on Ergo mainnet */
  SIGMAUSD_CONTRACT_ADDRESS: '9fRAWhdxEsTcdb8PhGNrZfwqa65zfkuYHAMmkQLcic1gdLSV5vA',
  /** Block time in seconds */
  BLOCK_TIME: 120,
} as const;

// Performance
export const PERFORMANCE = {
  /** High performance mode ring count */
  HIGH_PERF_RING_COUNT: 2,
  /** Visual mode ring count */
  VISUAL_RING_COUNT: 4,
  /** High performance grid lines */
  HIGH_PERF_GRID_LINES: 4,
  /** Visual mode grid lines */
  VISUAL_GRID_LINES: 8,
} as const;

// Storage Keys
export const STORAGE_KEYS = {
  /** Performance mode preference */
  PERF_MODE: 'perfMode',
  /** KYA acceptance */
  KYA_ACCEPTED: 'kya_accepted',
} as const;

// URLs
export const URLS = {
  /** Ergo Explorer base URL */
  ERGO_EXPLORER: 'https://explorer.ergoplatform.com/en',
  /** Mock data file path */
  MOCK_DATA: '/mock-data.json',
} as const;
