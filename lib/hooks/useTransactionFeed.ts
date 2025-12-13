import useSWR from 'swr';
import { TransactionEvent } from '../types';

interface TransactionFeedResponse {
  success: boolean;
  events: TransactionEvent[];
  count: number;
  error?: string;
}

/**
 * Fetcher for transaction feed
 */
async function fetcher(url: string): Promise<TransactionEvent[]> {
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch transaction feed: ${response.status}`);
  }
  
  const data: TransactionFeedResponse = await response.json();
  
  if (!data.success) {
    throw new Error(data.error || 'Unknown error fetching transactions');
  }
  
  // Parse timestamp strings back to Date objects
  return data.events.map(event => ({
    ...event,
    timestamp: new Date(event.timestamp),
  }));
}

/**
 * Hook to fetch live transaction feed from the Ergo blockchain
 * Polls every 15 seconds for new transactions
 */
export function useTransactionFeed() {
  const { data, error, isLoading, mutate } = useSWR<TransactionEvent[]>(
    '/api/feed',
    fetcher,
    {
      refreshInterval: 15000, // Poll every 15 seconds
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      dedupingInterval: 10000, // Prevent duplicate requests within 10s
      onError: (err) => {
        console.error('Transaction feed error:', err);
      },
    }
  );

  return {
    transactions: data || [],
    error,
    isLoading,
    mutate,
  };
}
