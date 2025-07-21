// This file should only be used in API routes (server-side)
// DO NOT import this in client-side components

import { createClient } from '@supabase/supabase-js'
import { Transaction } from '@/types/finance'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// Only create admin client if service role key is available
export const supabaseAdmin = supabaseServiceRoleKey 
  ? createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      },
      db: {
        schema: 'public'
      }
    })
  : null

// Server-only functions for admin operations
export class ServerFinanceService {
  static async addTransaction(transaction: Omit<Transaction, 'id' | 'created_at' | 'updated_at'>): Promise<Transaction> {
    if (!supabaseAdmin) {
      throw new Error('Admin client not available - using RLS instead')
    }
    
    const { data, error } = await supabaseAdmin
      .schema('finance')
      .from('transactions')
      .insert([transaction])
      .select()
      .single()

    if (error) {
      throw error
    }

    return data
  }

  static async updateTransaction(id: string, transaction: Partial<Omit<Transaction, 'id' | 'created_at' | 'updated_at'>>): Promise<Transaction> {
    if (!supabaseAdmin) {
      throw new Error('Admin client not available - using RLS instead')
    }
    
    const { data, error } = await supabaseAdmin
      .schema('finance')
      .from('transactions')
      .update(transaction)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw error
    }

    return data
  }

  static async deleteTransaction(id: string): Promise<void> {
    if (!supabaseAdmin) {
      throw new Error('Admin client not available - using RLS instead')
    }
    
    const { error } = await supabaseAdmin
      .schema('finance')
      .from('transactions')
      .delete()
      .eq('id', id)

    if (error) {
      throw error
    }
  }
}
