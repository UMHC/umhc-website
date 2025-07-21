export interface Transaction {
  id: string;
  date: string;
  title: string;
  description?: string;
  amount: number;
  type: 'income' | 'expense';
  category?: 'accommodation' | 'training' | 'equipment' | 'transport' | 'social_events' | 'insurance' | 'administration' | 'food_catering' | 'membership' | 'other';
  created_at: string;
  updated_at: string;
}

export interface FinancialSummary {
  total_income: number;
  total_expenses: number;
  current_balance: number;
  transaction_count: number;
  last_updated: string;
}

export type TransactionType = 'income' | 'expense';
export type ExpenseCategory = 'accommodation' | 'training' | 'equipment' | 'transport' | 'social_events' | 'insurance' | 'administration' | 'food_catering' | 'membership' | 'other';

export interface CategoryBudget {
  id: string;
  category: ExpenseCategory;
  budget_amount: number;
  budget_period: 'monthly' | 'quarterly' | 'annual';
  fiscal_year: number;
  created_at: string;
  updated_at: string;
}

export interface BudgetVsActual {
  category: ExpenseCategory;
  budget_amount: number;
  budget_period: 'monthly' | 'quarterly' | 'annual';
  fiscal_year: number;
  total_spent: number;
  remaining_budget: number;
  percentage_used: number;
  is_over_budget: boolean;
}
