import { useState, useEffect, useCallback } from 'react';
import { CategoryBudget, BudgetVsActual } from '@/types/finance';

interface BudgetSummary {
  totalBudget: number;
  totalSpent: number;
  totalRemaining: number;
  categoriesOverBudget: number;
  averagePercentageUsed: number;
}

export const useBudgetData = (fiscalYear?: number) => {
  const [budgets, setBudgets] = useState<CategoryBudget[]>([]);
  const [budgetVsActual, setBudgetVsActual] = useState<BudgetVsActual[]>([]);
  const [budgetSummary, setBudgetSummary] = useState<BudgetSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBudgetData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const year = fiscalYear || new Date().getFullYear();
      const baseUrl = '/api/finance/budgets';
      
      const [budgetsResponse, vsActualResponse, summaryResponse] = await Promise.all([
        fetch(`${baseUrl}?fiscalYear=${year}`),
        fetch(`${baseUrl}?type=vs-actual&fiscalYear=${year}`),
        fetch(`${baseUrl}?type=summary&fiscalYear=${year}`)
      ]);

      if (!budgetsResponse.ok || !vsActualResponse.ok || !summaryResponse.ok) {
        throw new Error('Failed to fetch budget data');
      }

      const [budgetsData, vsActualData, summaryData] = await Promise.all([
        budgetsResponse.json(),
        vsActualResponse.json(),
        summaryResponse.json()
      ]);

      setBudgets(budgetsData);
      setBudgetVsActual(vsActualData);
      setBudgetSummary(summaryData);
    } catch (err) {
      console.error('Error fetching budget data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch budget data');
    } finally {
      setIsLoading(false);
    }
  }, [fiscalYear]);

  const updateBudget = async (
    category: string,
    amount: number,
    year?: number,
    period: 'monthly' | 'quarterly' | 'annual' = 'annual'
  ) => {
    try {
      const response = await fetch('/api/finance/budgets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          category,
          budget_amount: amount,
          fiscal_year: year || new Date().getFullYear(),
          budget_period: period
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update budget');
      }

      await fetchBudgetData();
      return await response.json();
    } catch (err) {
      console.error('Error updating budget:', err);
      throw err;
    }
  };

  const deleteBudget = async (
    category: string,
    year?: number,
    period: 'monthly' | 'quarterly' | 'annual' = 'annual'
  ) => {
    try {
      const params = new URLSearchParams({
        category,
        fiscalYear: (year || new Date().getFullYear()).toString(),
        budgetPeriod: period
      });

      const response = await fetch(`/api/finance/budgets?${params}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete budget');
      }

      await fetchBudgetData();
    } catch (err) {
      console.error('Error deleting budget:', err);
      throw err;
    }
  };

  useEffect(() => {
    fetchBudgetData();
  }, [fetchBudgetData]);

  return {
    budgets,
    budgetVsActual,
    budgetSummary,
    isLoading,
    error,
    refetch: fetchBudgetData,
    updateBudget,
    deleteBudget
  };
};
