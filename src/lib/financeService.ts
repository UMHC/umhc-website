import { supabase } from './supabase';
import { Transaction, FinancialSummary, TransactionType, ExpenseCategory } from '@/types/finance';

export class FinanceService {
  // Get paginated transactions
  static async getTransactions(page: number = 1, limit: number = 20): Promise<{
    data: Transaction[];
    count: number;
    hasMore: boolean;
  }> {
    try {
      const from = (page - 1) * limit;
      const to = from + limit - 1;

      const { data, error, count } = await supabase
        .schema('finance')
        .from('transactions')
        .select('*', { count: 'exact' })
        .order('date', { ascending: false })
        .range(from, to);

      if (error) {
        // If finance schema doesn't exist or isn't accessible, return empty result
        if (error.code === 'PGRST106' || error.code === '42P01' || error.code === '42501' || error.message?.includes('schema must be one of') || error.message?.includes('does not exist') || error.message?.includes('permission denied')) {
          return { data: [], count: 0, hasMore: false };
        }
        throw error;
      }

      const totalCount = count || 0;
      const hasMore = (from + limit) < totalCount;

      return {
        data: data || [],
        count: totalCount,
        hasMore
      };
    } catch {
      // Return empty result as fallback
      return { data: [], count: 0, hasMore: false };
    }
  }

  // Get all transactions (for charts - we still need all data for proper aggregation)
  static async getAllTransactions(): Promise<Transaction[]> {
    try {
      const { data, error } = await supabase
        .schema('finance')
        .from('transactions')
        .select('*')
        .order('date', { ascending: false });

      if (error) {
        // If finance schema doesn't exist or isn't accessible, return empty array
        if (error.code === 'PGRST106' || error.code === '42P01' || error.code === '42501' || error.message?.includes('schema must be one of') || error.message?.includes('does not exist') || error.message?.includes('permission denied')) {
          return [];
        }
        throw error;
      }

      return data || [];
    } catch {
      // Return empty array as fallback
      return [];
    }
  }

  // Get financial summary
  static async getFinancialSummary(): Promise<FinancialSummary | null> {
    try {
      const { data, error } = await supabase
        .schema('finance')
        .from('financial_summary')
        .select('*')
        .single();

      if (error) {
        // If finance schema doesn't exist or isn't accessible, return default summary
        if (error.code === 'PGRST106' || error.code === '42P01' || error.code === '42501' || error.message?.includes('schema must be one of') || error.message?.includes('does not exist') || error.message?.includes('permission denied')) {
          return {
            total_income: 0,
            total_expenses: 0,
            current_balance: 0,
            transaction_count: 0,
            last_updated: new Date().toISOString()
          };
        }
        throw error;
      }

      return data;
    } catch {
      // Return default summary as fallback
      return {
        total_income: 0,
        total_expenses: 0,
        current_balance: 0,
        transaction_count: 0,
        last_updated: new Date().toISOString()
      };
    }
  }

  // Add a new transaction
  static async addTransaction(transaction: Omit<Transaction, 'id' | 'created_at' | 'updated_at'>): Promise<Transaction> {
    const { data, error } = await supabase
      .schema('finance')
      .from('transactions')
      .insert([transaction])
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  }

  // Update a transaction
  static async updateTransaction(id: string, transaction: Partial<Omit<Transaction, 'id' | 'created_at' | 'updated_at'>>): Promise<Transaction> {
    const { data, error } = await supabase
      .schema('finance')
      .from('transactions')
      .update(transaction)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  }

  // Delete a transaction
  static async deleteTransaction(id: string): Promise<void> {
    const { error } = await supabase
      .schema('finance')
      .from('transactions')
      .delete()
      .eq('id', id);

    if (error) {
      throw error;
    }
  }

  // Get transactions by type
  static async getTransactionsByType(type: TransactionType): Promise<Transaction[]> {
    const { data, error } = await supabase
      .schema('finance')
      .from('transactions')
      .select('*')
      .eq('type', type)
      .order('date', { ascending: false });

    if (error) {
      throw error;
    }

    return data || [];
  }

  // Get transactions by category
  static async getTransactionsByCategory(category: ExpenseCategory): Promise<Transaction[]> {
    const { data, error } = await supabase
      .schema('finance')
      .from('transactions')
      .select('*')
      .eq('category', category)
      .order('date', { ascending: false });

    if (error) {
      throw error;
    }

    return data || [];
  }
}

// Utility functions for formatting
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
  }).format(amount);
};

export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

export const getCategoryDisplayName = (category: ExpenseCategory): string => {
  const categoryNames: Record<ExpenseCategory, string> = {
    accommodation: 'Accommodation',
    training: 'Training',
    equipment: 'Equipment',
    transport: 'Transport',
    social_events: 'Social Events',
    insurance: 'Insurance',
    administration: 'Administration',
    food_catering: 'Food & Catering',
    membership: 'Membership',
    other: 'Other',
  };
  return categoryNames[category];
};

// Chart data aggregation functions
export const getMonthlyIncomeVsExpenses = (transactions: Transaction[]): {
  labels: string[];
  incomeData: number[];
  expenseData: number[];
} => {
  const monthlyData = new Map<string, { income: number; expenses: number }>();
  
  // Create 12 months starting from June 2025
  const months = [
    'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
    'Jan', 'Feb', 'Mar', 'Apr', 'May'
  ];
  
  const years = [2025, 2025, 2025, 2025, 2025, 2025, 2025, 2026, 2026, 2026, 2026, 2026];
  
  // Initialize all 12 months with zero values
  months.forEach((month, index) => {
    const monthKey = `${month} ${years[index]}`;
    monthlyData.set(monthKey, { income: 0, expenses: 0 });
  });
  
  // Add transaction data
  transactions.forEach(transaction => {
    const date = new Date(transaction.date);
    const monthKey = date.toLocaleString('en-GB', { month: 'short', year: 'numeric' });
    
    if (monthlyData.has(monthKey)) {
      const monthData = monthlyData.get(monthKey)!;
      if (transaction.type === 'income') {
        monthData.income += Number(transaction.amount);
      } else {
        monthData.expenses += Number(transaction.amount);
      }
    }
  });
  
  // Return data in chronological order (June 2025 to May 2026)
  const sortedEntries = months.map((month, index) => {
    const monthKey = `${month} ${years[index]}`;
    return [monthKey, monthlyData.get(monthKey)!] as [string, { income: number; expenses: number }];
  });
  
  return {
    labels: sortedEntries.map(([month]) => month),
    incomeData: sortedEntries.map(([, data]) => data.income),
    expenseData: sortedEntries.map(([, data]) => data.expenses),
  };
};

export const getExpensesByCategory = (transactions: Transaction[]): {
  labels: string[];
  data: number[];
  colors: string[];
} => {
  const categoryTotals = new Map<ExpenseCategory, number>();
  
  transactions
    .filter(t => t.type === 'expense' && t.category)
    .forEach(transaction => {
      const category = transaction.category!;
      const current = categoryTotals.get(category) || 0;
      categoryTotals.set(category, current + Number(transaction.amount));
    });
  
  const colors = [
    '#1C5713', // umhc-green (forest green)
    '#8B4513', // saddle brown (earth/trail)
    '#228B22', // forest green (lighter)
    '#CD853F', // sandy brown (desert/rock)
    '#2E8B57', // sea green (lake/water)
    '#A0522D', // sienna (mountain soil)
    '#6B8E23', // olive drab (moss/vegetation)
    '#4682B4', // steel blue (sky/river)
    '#D2691E', // chocolate (bark/wood)
    '#32CD32', // lime green (spring foliage)
    '#8FBC8F', // dark sea green (additional color)
    '#5F8A5F', // dark olive green (additional color)
  ];
  
  const sortedEntries = Array.from(categoryTotals.entries()).sort((a, b) => b[1] - a[1]);
  
  return {
    labels: sortedEntries.map(([category]) => getCategoryDisplayName(category)),
    data: sortedEntries.map(([, amount]) => amount),
    colors: colors.slice(0, sortedEntries.length),
  };
};
