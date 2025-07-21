'use client';

import useSWR, { mutate } from 'swr';
import { FinanceService } from '@/lib/financeService';
import { Transaction } from '@/types/finance';
import { FinancialDataCache } from '@/lib/clientCache';
import { useCallback, useEffect } from 'react';

// SWR keys for consistent caching
const SWR_KEYS = {
  FINANCIAL_SUMMARY: 'financial-summary',
  ALL_TRANSACTIONS: 'all-transactions',
  TRANSACTIONS: (page: number, limit: number) => `transactions-${page}-${limit}`,
} as const;

// Custom hook for financial summary with localStorage integration
export function useFinancialSummary() {
  const { data, error, isLoading, mutate: mutateSummary } = useSWR(
    SWR_KEYS.FINANCIAL_SUMMARY,
    async () => {
      // Try to get cached data first
      const cached = FinancialDataCache.getFinancialSummary();
      if (cached) {
        // Return cached data immediately, but trigger background refresh
        FinanceService.getFinancialSummary().then(fresh => {
          if (fresh && JSON.stringify(cached) !== JSON.stringify(fresh)) {
            FinancialDataCache.cacheFinancialSummary(fresh);
            mutateSummary(fresh, false);
          }
        });
        return cached;
      }
      
      // Fetch fresh data
      const fresh = await FinanceService.getFinancialSummary();
      if (fresh) {
        FinancialDataCache.cacheFinancialSummary(fresh);
      }
      return fresh;
    },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 300000, // 5 minutes
      refreshInterval: 600000, // 10 minutes
      errorRetryCount: 2,
      fallbackData: FinancialDataCache.getFinancialSummary(),
      keepPreviousData: true,
    }
  );

  // Cache data whenever it changes
  useEffect(() => {
    if (data) {
      FinancialDataCache.cacheFinancialSummary(data);
    }
  }, [data]);

  return {
    summary: data,
    isLoading,
    error,
    refetch: mutateSummary,
  };
}

// Custom hook for paginated transactions
export function useTransactions(page: number = 1, limit: number = 20) {
  const { data, error, isLoading, mutate: mutateTransactions } = useSWR(
    SWR_KEYS.TRANSACTIONS(page, limit),
    () => FinanceService.getTransactions(page, limit),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 300000, // 5 minutes
      refreshInterval: 0, // Disable automatic refresh for paginated data
      errorRetryCount: 2,
      fallbackData: { data: [], count: 0, hasMore: false },
      keepPreviousData: true,
    }
  );

  return {
    transactions: data?.data || [],
    totalCount: data?.count || 0,
    hasMore: data?.hasMore || false,
    isLoading,
    error,
    refetch: mutateTransactions,
  };
}

// Custom hook for all transactions (used for charts)
export function useAllTransactions() {
  const { data, error, isLoading, mutate: mutateAllTransactions } = useSWR(
    SWR_KEYS.ALL_TRANSACTIONS,
    () => FinanceService.getAllTransactions(),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 300000, // 5 minutes
      refreshInterval: 600000, // 10 minutes
      errorRetryCount: 2,
      fallbackData: [],
      keepPreviousData: true,
    }
  );

  return {
    transactions: data || [],
    isLoading,
    error,
    refetch: mutateAllTransactions,
  };
}

// Hook for financial data mutations with cache invalidation
export function useFinanceMutations() {
  const invalidateAllCaches = useCallback(async () => {
    // Clear localStorage cache
    FinancialDataCache.clearAllCache();
    
    // Invalidate all SWR caches
    await Promise.all([
      mutate(SWR_KEYS.FINANCIAL_SUMMARY),
      mutate(SWR_KEYS.ALL_TRANSACTIONS),
      // Invalidate all paginated transaction caches
      mutate(
        (key: string) => typeof key === 'string' && key.startsWith('transactions-'),
        undefined,
        { revalidate: true }
      ),
    ]);
  }, []);

  const addTransaction = useCallback(async (transaction: Omit<Transaction, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const result = await FinanceService.addTransaction(transaction);
      await invalidateAllCaches();
      return result;
    } catch (error) {
      console.error('Error adding transaction:', error);
      throw error;
    }
  }, [invalidateAllCaches]);

  const updateTransaction = useCallback(async (id: string, transaction: Partial<Omit<Transaction, 'id' | 'created_at' | 'updated_at'>>) => {
    try {
      const result = await FinanceService.updateTransaction(id, transaction);
      await invalidateAllCaches();
      return result;
    } catch (error) {
      console.error('Error updating transaction:', error);
      throw error;
    }
  }, [invalidateAllCaches]);

  const deleteTransaction = useCallback(async (id: string) => {
    try {
      await FinanceService.deleteTransaction(id);
      await invalidateAllCaches();
    } catch (error) {
      console.error('Error deleting transaction:', error);
      throw error;
    }
  }, [invalidateAllCaches]);

  return {
    addTransaction,
    updateTransaction,
    deleteTransaction,
    invalidateAllCaches,
  };
}

// Preload data functions for performance optimization
export const preloadFinancialSummary = () => {
  return mutate(SWR_KEYS.FINANCIAL_SUMMARY, () => FinanceService.getFinancialSummary());
};

export const preloadAllTransactions = () => {
  return mutate(SWR_KEYS.ALL_TRANSACTIONS, () => FinanceService.getAllTransactions());
};

export const preloadTransactions = (page: number = 1, limit: number = 20) => {
  return mutate(SWR_KEYS.TRANSACTIONS(page, limit), () => FinanceService.getTransactions(page, limit));
};