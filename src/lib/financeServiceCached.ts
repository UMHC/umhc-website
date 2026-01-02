import { unstable_cache, revalidateTag } from 'next/cache';
import { FinanceService } from './financeService';
import { ServerFinanceService } from './server-finance';
import { Transaction, TransactionType, ExpenseCategory } from '@/types/finance';

// Cache configuration
const CACHE_TAGS = {
  TRANSACTIONS: 'transactions',
  FINANCIAL_SUMMARY: 'financial-summary',
  ALL_TRANSACTIONS: 'all-transactions',
} as const;

// Cache durations (in seconds)
const CACHE_DURATION = {
  TRANSACTIONS: 300, // 5 minutes
  FINANCIAL_SUMMARY: 600, // 10 minutes
  ALL_TRANSACTIONS: 300, // 5 minutes
} as const;

// Server-side cached service (only use in API routes and server components)
export class CachedFinanceService {
  // Cached method to get paginated transactions
  static getTransactions = unstable_cache(
    async (page: number = 1, limit: number = 20) => {
      return FinanceService.getTransactions(page, limit);
    },
    ['transactions'],
    {
      tags: [CACHE_TAGS.TRANSACTIONS],
      revalidate: CACHE_DURATION.TRANSACTIONS,
    }
  );

  // Cached method to get all transactions
  static getAllTransactions = unstable_cache(
    async () => {
      return FinanceService.getAllTransactions();
    },
    ['all-transactions'],
    {
      tags: [CACHE_TAGS.ALL_TRANSACTIONS],
      revalidate: CACHE_DURATION.ALL_TRANSACTIONS,
    }
  );

  // Cached method to get financial summary
  static getFinancialSummary = unstable_cache(
    async () => {
      return FinanceService.getFinancialSummary();
    },
    ['financial-summary'],
    {
      tags: [CACHE_TAGS.FINANCIAL_SUMMARY],
      revalidate: CACHE_DURATION.FINANCIAL_SUMMARY,
    }
  );

  // Cache invalidation methods
  static async invalidateCache(tags?: string[]) {
    if (tags) {
      tags.forEach(tag => revalidateTag(tag, {}));
    } else {
      // Invalidate all financial data caches
      Object.values(CACHE_TAGS).forEach(tag => revalidateTag(tag, {}));
    }
  }

  // Add a new transaction (with cache invalidation)
  static async addTransaction(transaction: Omit<Transaction, 'id' | 'created_at' | 'updated_at'>): Promise<Transaction> {
    const result = await ServerFinanceService.addTransaction(transaction);
    await this.invalidateCache();
    return result;
  }

  // Update a transaction (with cache invalidation)
  static async updateTransaction(id: string, transaction: Partial<Omit<Transaction, 'id' | 'created_at' | 'updated_at'>>): Promise<Transaction> {
    const result = await ServerFinanceService.updateTransaction(id, transaction);
    await this.invalidateCache();
    return result;
  }

  // Delete a transaction (with cache invalidation)
  static async deleteTransaction(id: string): Promise<void> {
    await ServerFinanceService.deleteTransaction(id);
    await this.invalidateCache();
  }

  // Get transactions by type (cached)
  static getTransactionsByType = unstable_cache(
    async (type: TransactionType) => {
      return FinanceService.getTransactionsByType(type);
    },
    ['transactions-by-type'],
    {
      tags: [CACHE_TAGS.TRANSACTIONS],
      revalidate: CACHE_DURATION.TRANSACTIONS,
    }
  );

  // Get transactions by category (cached)
  static getTransactionsByCategory = unstable_cache(
    async (category: ExpenseCategory) => {
      return FinanceService.getTransactionsByCategory(category);
    },
    ['transactions-by-category'],
    {
      tags: [CACHE_TAGS.TRANSACTIONS],
      revalidate: CACHE_DURATION.TRANSACTIONS,
    }
  );
}

export { CACHE_TAGS, CACHE_DURATION };