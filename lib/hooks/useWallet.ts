'use client';

import { useState, useEffect, useCallback } from 'react';

// Ergo dApp Connector types
interface ErgoConnector {
  nautilus: {
    connect: () => Promise<boolean>;
    isConnected: () => Promise<boolean>;
    disconnect: () => Promise<void>;
  };
}

interface ErgoAPI {
  request_read_access: () => Promise<boolean>;
  get_balance: (tokenId?: string) => Promise<string>;
  get_change_address: () => Promise<string>;
  get_used_addresses: () => Promise<string[]>;
  get_utxos: (amount?: string, tokenId?: string) => Promise<any[]>;
}

declare global {
  interface Window {
    ergoConnector?: ErgoConnector;
    ergo?: ErgoAPI;
  }
}

export interface WalletState {
  isConnected: boolean;
  address: string | null;
  balance: number; // ERG balance (not NanoErg)
  isLoading: boolean;
  error: string | null;
}

interface UseWalletReturn extends WalletState {
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  refreshBalance: () => Promise<void>;
}

const NANOERG_TO_ERG = 1_000_000_000; // 1 ERG = 10^9 NanoErg
const WALLET_STORAGE_KEY = 'djed_wallet_connected';

/**
 * useWallet - Hook for managing Nautilus wallet connection
 * 
 * Features:
 * - Connects to Nautilus wallet via Ergo dApp Connector
 * - Fetches ERG balance
 * - Persists connection state across page refreshes
 * - Auto-reconnects if previously connected
 * 
 * Requirements:
 * - User must have Nautilus wallet browser extension installed
 * - Nautilus must be unlocked
 */
export function useWallet(): UseWalletReturn {
  const [state, setState] = useState<WalletState>({
    isConnected: false,
    address: null,
    balance: 0,
    isLoading: false,
    error: null,
  });

  /**
   * Fetch wallet balance from Nautilus
   */
  const fetchBalance = useCallback(async (): Promise<number> => {
    if (!window.ergo) {
      throw new Error('Ergo API not available');
    }

    try {
      // Get balance in NanoErg (returns string like "125400000000")
      const balanceNanoErg = await window.ergo.get_balance();
      
      // Safety guards: validate balance string
      if (!balanceNanoErg || typeof balanceNanoErg !== 'string') {
        console.warn('⚠️ Invalid balance format from wallet');
        return 0;
      }
      
      // Convert NanoErg to ERG with safety check
      const nanoErgValue = parseInt(balanceNanoErg);
      if (!isFinite(nanoErgValue) || nanoErgValue < 0) {
        console.warn('⚠️ Invalid balance value from wallet');
        return 0;
      }
      
      const balanceERG = nanoErgValue / NANOERG_TO_ERG;
      
      // Validate final result
      if (!isFinite(balanceERG) || balanceERG < 0) {
        console.warn('⚠️ Balance conversion resulted in invalid value');
        return 0;
      }
      
      return balanceERG;
    } catch (error) {
      console.error('Failed to fetch balance:', error);
      throw error;
    }
  }, []);

  /**
   * Fetch wallet address from Nautilus
   */
  const fetchAddress = useCallback(async (): Promise<string> => {
    if (!window.ergo) {
      throw new Error('Ergo API not available');
    }

    try {
      // Get change address (primary wallet address)
      const address = await window.ergo.get_change_address();
      return address;
    } catch (error) {
      console.error('Failed to fetch address:', error);
      throw error;
    }
  }, []);

  /**
   * Refresh balance (public method)
   */
  const refreshBalance = useCallback(async () => {
    if (!state.isConnected || !window.ergo) return;

    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      const balance = await fetchBalance();
      setState(prev => ({ ...prev, balance, isLoading: false }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: 'Failed to refresh balance',
        isLoading: false,
      }));
    }
  }, [state.isConnected, fetchBalance]);

  /**
   * Connect to Nautilus wallet
   */
  const connect = useCallback(async () => {
    // Check if Nautilus is installed
    if (!window.ergoConnector?.nautilus) {
      setState(prev => ({
        ...prev,
        error: 'Nautilus wallet not found. Please install the Nautilus browser extension.',
      }));
      alert('Please install Nautilus Wallet extension from Chrome Web Store or Firefox Add-ons.');
      return;
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // Step 1: Connect to Nautilus
      const connected = await window.ergoConnector.nautilus.connect();
      
      if (!connected) {
        throw new Error('Failed to connect to Nautilus');
      }

      // Step 2: Request read access
      if (!window.ergo) {
        throw new Error('Ergo API not available after connection');
      }

      const accessGranted = await window.ergo.request_read_access();
      
      if (!accessGranted) {
        throw new Error('Read access denied');
      }

      // Step 3: Fetch wallet data
      const [address, balance] = await Promise.all([
        fetchAddress(),
        fetchBalance(),
      ]);

      // Step 4: Update state
      setState({
        isConnected: true,
        address,
        balance,
        isLoading: false,
        error: null,
      });

      // Step 5: Persist connection
      localStorage.setItem(WALLET_STORAGE_KEY, 'true');

      console.log('✅ Wallet connected:', address, `${balance} ERG`);
    } catch (error) {
      console.error('❌ Wallet connection failed:', error);
      
      setState({
        isConnected: false,
        address: null,
        balance: 0,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Connection failed',
      });

      localStorage.removeItem(WALLET_STORAGE_KEY);
    }
  }, [fetchAddress, fetchBalance]);

  /**
   * Disconnect wallet
   */
  const disconnect = useCallback(async () => {
    try {
      if (window.ergoConnector?.nautilus) {
        await window.ergoConnector.nautilus.disconnect();
      }
    } catch (error) {
      console.error('Error disconnecting:', error);
    }

    setState({
      isConnected: false,
      address: null,
      balance: 0,
      isLoading: false,
      error: null,
    });

    localStorage.removeItem(WALLET_STORAGE_KEY);
    console.log('🔌 Wallet disconnected');
  }, []);

  /**
   * Auto-reconnect on mount if previously connected
   */
  useEffect(() => {
    const wasConnected = localStorage.getItem(WALLET_STORAGE_KEY) === 'true';
    
    if (wasConnected && window.ergoConnector?.nautilus) {
      // Wait for window load to ensure Nautilus is fully initialized
      const autoConnect = async () => {
        try {
          const isConnected = await window.ergoConnector!.nautilus.isConnected();
          if (isConnected) {
            await connect();
          } else {
            localStorage.removeItem(WALLET_STORAGE_KEY);
          }
        } catch (error) {
          console.error('Auto-reconnect failed:', error);
          localStorage.removeItem(WALLET_STORAGE_KEY);
        }
      };

      // Delay to allow Nautilus to initialize
      const timeout = setTimeout(autoConnect, 1000);
      return () => clearTimeout(timeout);
    }
  }, [connect]);

  /**
   * Refresh balance periodically (every 30 seconds)
   */
  useEffect(() => {
    if (!state.isConnected) return;

    const interval = setInterval(() => {
      refreshBalance();
    }, 30_000); // 30 seconds

    return () => clearInterval(interval);
  }, [state.isConnected, refreshBalance]);

  return {
    ...state,
    connect,
    disconnect,
    refreshBalance,
  };
}
