import { supabase } from './supabase';
import { Transaction, FinancialSummary } from '@/types/finance';

export class SecureFinanceService {
  // Add a new transaction with RLS
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  static async addTransaction(transaction: Omit<Transaction, 'id' | 'created_at' | 'updated_at'>, _userId?: string): Promise<Transaction> {
    console.log('Adding transaction with RLS:', transaction);
    
    // Use the regular supabase client which respects RLS
    const { data, error } = await supabase
      .schema('finance')
      .from('transactions')
      .insert([{
        ...transaction,
        // You can add user tracking if needed
        // created_by: userId
      }])
      .select()
      .single();

    if (error) {
      console.error('Error adding transaction:', error);
      throw error;
    }

    console.log('Transaction added successfully:', data);
    return data;
  }

  // Update a transaction with RLS
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  static async updateTransaction(id: string, transaction: Partial<Omit<Transaction, 'id' | 'created_at' | 'updated_at'>>, _userId?: string): Promise<Transaction> {
    const { data, error } = await supabase
      .schema('finance')
      .from('transactions')
      .update({
        ...transaction,
        // updated_by: userId
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating transaction:', error);
      throw error;
    }

    return data;
  }

  // Delete a transaction with RLS
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  static async deleteTransaction(id: string, _userId?: string): Promise<void> {
    const { error } = await supabase
      .schema('finance')
      .from('transactions')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting transaction:', error);
      throw error;
    }
  }

  // Get transactions (read operations work with regular client)
  static async getTransactions(page: number = 1, limit: number = 20): Promise<{
    data: Transaction[];
    count: number;
    hasMore: boolean;
  }> {
    try {
      console.log(`Fetching transactions from finance schema... (page ${page}, limit ${limit})`);
      
      const from = (page - 1) * limit;
      const to = from + limit - 1;

      const { data, error, count } = await supabase
        .schema('finance')
        .from('transactions')
        .select('*', { count: 'exact' })
        .order('date', { ascending: false })
        .range(from, to);

      if (error) {
        console.error('Error fetching transactions:', error);
        throw error;
      }

      const totalCount = count || 0;
      const hasMore = (from + limit) < totalCount;

      console.log(`Successfully fetched ${data?.length || 0} transactions (${totalCount} total)`);
      return {
        data: data || [],
        count: totalCount,
        hasMore
      };
    } catch (err) {
      console.error('Error in getTransactions:', err);
      throw err;
    }
  }

  // Get all transactions
  static async getAllTransactions(): Promise<Transaction[]> {
    try {
      console.log('Fetching all transactions for charts...');
      
      const { data, error } = await supabase
        .schema('finance')
        .from('transactions')
        .select('*')
        .order('date', { ascending: false });

      if (error) {
        console.error('Error fetching all transactions:', error);
        throw error;
      }

      console.log(`Successfully fetched ${data?.length || 0} transactions for charts`);
      return data || [];
    } catch (err) {
      console.error('Error in getAllTransactions:', err);
      throw err;
    }
  }

  // Get financial summary
  static async getFinancialSummary(): Promise<FinancialSummary | null> {
    try {
      console.log('Fetching financial summary from finance schema...');
      
      const { data, error } = await supabase
        .schema('finance')
        .from('financial_summary')
        .select('*')
        .single();

      if (error) {
        console.error('Error fetching financial summary:', error);
        throw error;
      }

      console.log('Successfully fetched financial summary');
      return data;
    } catch (err) {
      console.error('Error in getFinancialSummary:', err);
      throw err;
    }
  }
}
