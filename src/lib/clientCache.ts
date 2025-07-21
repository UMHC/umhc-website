'use client';

// Cache item structure
interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

// Client-side cache using localStorage for non-sensitive financial data
export class ClientCache {
  private static readonly PREFIX = 'umhc_finance_';
  private static readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes in milliseconds

  // Check if localStorage is available (SSR-safe)
  private static isLocalStorageAvailable(): boolean {
    try {
      return typeof window !== 'undefined' && window.localStorage !== null;
    } catch {
      return false;
    }
  }

  // Generate cache key with prefix
  private static getCacheKey(key: string): string {
    return `${this.PREFIX}${key}`;
  }

  // Set item in cache with TTL
  static set<T>(key: string, data: T, ttl: number = this.DEFAULT_TTL): void {
    if (!this.isLocalStorageAvailable()) return;

    try {
      const cacheItem: CacheItem<T> = {
        data,
        timestamp: Date.now(),
        ttl,
      };

      localStorage.setItem(this.getCacheKey(key), JSON.stringify(cacheItem));
    } catch (error) {
      console.warn('Failed to cache data in localStorage:', error);
    }
  }

  // Get item from cache, returns null if expired or not found
  static get<T>(key: string): T | null {
    if (!this.isLocalStorageAvailable()) return null;

    try {
      const cached = localStorage.getItem(this.getCacheKey(key));
      if (!cached) return null;

      const cacheItem: CacheItem<T> = JSON.parse(cached);
      const now = Date.now();

      // Check if cache item has expired
      if (now - cacheItem.timestamp > cacheItem.ttl) {
        this.remove(key);
        return null;
      }

      return cacheItem.data;
    } catch (error) {
      console.warn('Failed to retrieve cached data from localStorage:', error);
      this.remove(key); // Remove corrupted cache
      return null;
    }
  }

  // Remove specific item from cache
  static remove(key: string): void {
    if (!this.isLocalStorageAvailable()) return;

    try {
      localStorage.removeItem(this.getCacheKey(key));
    } catch (error) {
      console.warn('Failed to remove cached data from localStorage:', error);
    }
  }

  // Clear all UMHC finance cache
  static clear(): void {
    if (!this.isLocalStorageAvailable()) return;

    try {
      const keysToRemove: string[] = [];
      
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(this.PREFIX)) {
          keysToRemove.push(key);
        }
      }

      keysToRemove.forEach(key => localStorage.removeItem(key));
    } catch (error) {
      console.warn('Failed to clear cache from localStorage:', error);
    }
  }

  // Get cache size and info
  static getCacheInfo(): { size: number; keys: string[] } {
    if (!this.isLocalStorageAvailable()) {
      return { size: 0, keys: [] };
    }

    try {
      const keys: string[] = [];
      
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(this.PREFIX)) {
          keys.push(key.replace(this.PREFIX, ''));
        }
      }

      return { size: keys.length, keys };
    } catch (error) {
      console.warn('Failed to get cache info:', error);
      return { size: 0, keys: [] };
    }
  }

  // Clean up expired cache items
  static cleanup(): void {
    if (!this.isLocalStorageAvailable()) return;

    try {
      const keysToRemove: string[] = [];
      const now = Date.now();

      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(this.PREFIX)) {
          try {
            const cached = localStorage.getItem(key);
            if (cached) {
              const cacheItem = JSON.parse(cached);
              if (now - cacheItem.timestamp > cacheItem.ttl) {
                keysToRemove.push(key);
              }
            }
          } catch {
            // Remove corrupted cache items
            keysToRemove.push(key);
          }
        }
      }

      keysToRemove.forEach(key => localStorage.removeItem(key));
    } catch (error) {
      console.warn('Failed to cleanup cache:', error);
    }
  }
}

// Specific cache keys for financial data
export const CACHE_KEYS = {
  FINANCIAL_SUMMARY: 'financial_summary',
  CHART_DATA_MONTHLY: 'chart_data_monthly',
  CHART_DATA_CATEGORIES: 'chart_data_categories',
  USER_PREFERENCES: 'user_preferences',
} as const;

// Enhanced financial data caching with specific TTL
export class FinancialDataCache {
  // Cache financial summary (10 minutes)
  static cacheFinancialSummary(summary: any): void {
    ClientCache.set(CACHE_KEYS.FINANCIAL_SUMMARY, summary, 10 * 60 * 1000);
  }

  static getFinancialSummary(): any | null {
    return ClientCache.get(CACHE_KEYS.FINANCIAL_SUMMARY);
  }

  // Cache chart data (5 minutes)
  static cacheMonthlyChartData(data: any): void {
    ClientCache.set(CACHE_KEYS.CHART_DATA_MONTHLY, data, 5 * 60 * 1000);
  }

  static getMonthlyChartData(): any | null {
    return ClientCache.get(CACHE_KEYS.CHART_DATA_MONTHLY);
  }

  static cacheCategoryChartData(data: any): void {
    ClientCache.set(CACHE_KEYS.CHART_DATA_CATEGORIES, data, 5 * 60 * 1000);
  }

  static getCategoryChartData(): any | null {
    return ClientCache.get(CACHE_KEYS.CHART_DATA_CATEGORIES);
  }

  // Cache user preferences (1 hour)
  static cacheUserPreferences(preferences: any): void {
    ClientCache.set(CACHE_KEYS.USER_PREFERENCES, preferences, 60 * 60 * 1000);
  }

  static getUserPreferences(): any | null {
    return ClientCache.get(CACHE_KEYS.USER_PREFERENCES);
  }

  // Clear all financial cache
  static clearAllCache(): void {
    Object.values(CACHE_KEYS).forEach(key => ClientCache.remove(key));
  }
}

// Auto cleanup on page load (run once when module loads in browser)
if (typeof window !== 'undefined') {
  // Run cleanup after a short delay to not block initial page load
  setTimeout(() => {
    ClientCache.cleanup();
  }, 1000);
}