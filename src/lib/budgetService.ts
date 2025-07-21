import { supabaseAdmin } from './supabase-admin';
import { CategoryBudget, BudgetVsActual, ExpenseCategory } from '@/types/finance';

export class BudgetService {
  /**
   * Get all category budgets for the current fiscal year
   */
  static async getCategoryBudgets(fiscalYear?: number): Promise<CategoryBudget[]> {
    const year = fiscalYear || new Date().getFullYear();
    
    console.log('Fetching category budgets for year:', year);
    
    const { data, error } = await supabaseAdmin
      .schema('finance')
      .from('category_budgets')
      .select('*')
      .eq('fiscal_year', year)
      .order('category');

    console.log('Category budgets result:', { dataLength: data?.length, error: error?.message });

    if (error) {
      console.error('Error fetching category budgets:', error);
      throw new Error('Failed to fetch category budgets');
    }

    return data || [];
  }

  /**
   * Get budget vs actual spending for all categories
   */
  static async getBudgetVsActual(fiscalYear?: number): Promise<BudgetVsActual[]> {
    const year = fiscalYear || new Date().getFullYear();
    
    console.log('Fetching budget vs actual for year:', year);
    
    const { data, error } = await supabaseAdmin
      .schema('finance')
      .from('budget_vs_actual')
      .select('*')
      .eq('fiscal_year', year)
      .order('category');

    console.log('Budget vs actual result:', { dataLength: data?.length, error: error?.message });

    if (error) {
      console.error('Error fetching budget vs actual:', error);
      throw new Error('Failed to fetch budget vs actual data');
    }

    return data || [];
  }

  /**
   * Update budget for a specific category
   */
  static async updateCategoryBudget(
    category: ExpenseCategory,
    budgetAmount: number,
    fiscalYear?: number,
    budgetPeriod: 'monthly' | 'quarterly' | 'annual' = 'annual'
  ): Promise<CategoryBudget> {
    const year = fiscalYear || new Date().getFullYear();
    
    const { data, error } = await supabaseAdmin
      .schema('finance')
      .from('category_budgets')
      .upsert({
        category,
        budget_amount: budgetAmount,
        budget_period: budgetPeriod,
        fiscal_year: year
      }, {
        onConflict: 'category,fiscal_year,budget_period'
      })
      .select()
      .single();

    if (error) {
      console.error('Error updating category budget:', error);
      throw new Error('Failed to update category budget');
    }

    return data;
  }

  /**
   * Create budget for a new category
   */
  static async createCategoryBudget(
    category: ExpenseCategory,
    budgetAmount: number,
    fiscalYear?: number,
    budgetPeriod: 'monthly' | 'quarterly' | 'annual' = 'annual'
  ): Promise<CategoryBudget> {
    const year = fiscalYear || new Date().getFullYear();
    
    const { data, error } = await supabaseAdmin
      .schema('finance')
      .from('category_budgets')
      .insert({
        category,
        budget_amount: budgetAmount,
        budget_period: budgetPeriod,
        fiscal_year: year
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating category budget:', error);
      throw new Error('Failed to create category budget');
    }

    return data;
  }

  /**
   * Delete budget for a specific category
   */
  static async deleteCategoryBudget(
    category: ExpenseCategory,
    fiscalYear?: number,
    budgetPeriod: 'monthly' | 'quarterly' | 'annual' = 'annual'
  ): Promise<void> {
    const year = fiscalYear || new Date().getFullYear();
    
    const { error } = await supabaseAdmin
      .schema('finance')
      .from('category_budgets')
      .delete()
      .eq('category', category)
      .eq('fiscal_year', year)
      .eq('budget_period', budgetPeriod);

    if (error) {
      console.error('Error deleting category budget:', error);
      throw new Error('Failed to delete category budget');
    }
  }

  /**
   * Get budget summary statistics
   */
  static async getBudgetSummary(fiscalYear?: number): Promise<{
    totalBudget: number;
    totalSpent: number;
    totalRemaining: number;
    categoriesOverBudget: number;
    averagePercentageUsed: number;
  }> {
    console.log('Calculating budget summary');
    const budgetData = await this.getBudgetVsActual(fiscalYear);
    
    const totalBudget = budgetData.reduce((sum, item) => sum + item.budget_amount, 0);
    const totalSpent = budgetData.reduce((sum, item) => sum + item.total_spent, 0);
    const totalRemaining = totalBudget - totalSpent;
    const categoriesOverBudget = budgetData.filter(item => item.is_over_budget).length;
    const averagePercentageUsed = budgetData.length > 0 
      ? budgetData.reduce((sum, item) => sum + item.percentage_used, 0) / budgetData.length
      : 0;

    const summary = {
      totalBudget,
      totalSpent,
      totalRemaining,
      categoriesOverBudget,
      averagePercentageUsed
    };
    
    console.log('Budget summary calculated:', { totalBudget, totalSpent, categoriesCount: budgetData.length });
    return summary;
  }

  /**
   * Get category display name
   */
  static getCategoryDisplayName(category: ExpenseCategory): string {
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
      other: 'Other'
    };
    
    return categoryNames[category] || category;
  }
}
