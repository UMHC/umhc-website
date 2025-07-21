'use client';

import { useState, useEffect } from 'react';
import { BudgetVsActual, CategoryBudget, ExpenseCategory } from '@/types/finance';
import { getCategoryDisplayName } from '@/lib/financeService';
import DoughnutChart from './DoughnutChart';
import { 
  PencilIcon, 
  CheckIcon, 
  XMarkIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

interface BudgetManagementProps {
  onBudgetUpdate?: () => void;
  canEdit?: boolean;
}

export default function BudgetManagement({ onBudgetUpdate, canEdit = false }: BudgetManagementProps) {
  const [budgetData, setBudgetData] = useState<BudgetVsActual[]>([]);
  const [budgetSummary, setBudgetSummary] = useState<{
    totalBudget: number;
    totalSpent: number;
    totalRemaining: number;
    categoriesOverBudget: number;
    averagePercentageUsed: number;
  } | null>(null);
  const [editingCategory, setEditingCategory] = useState<ExpenseCategory | null>(null);
  const [editingAmount, setEditingAmount] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  // Debug logging
  console.log('BudgetManagement props:', { canEdit, onBudgetUpdate: !!onBudgetUpdate });
  const [error, setError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchBudgetData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const [budgetVsActualResponse, summaryResponse] = await Promise.all([
        fetch('/api/finance/budgets?type=vs-actual'),
        fetch('/api/finance/budgets?type=summary')
      ]);

      console.log('Budget API responses:', {
        budgetVsActual: { ok: budgetVsActualResponse.ok, status: budgetVsActualResponse.status },
        summary: { ok: summaryResponse.ok, status: summaryResponse.status }
      });

      if (!budgetVsActualResponse.ok || !summaryResponse.ok) {
        // Get error details for debugging
        const budgetError = budgetVsActualResponse.ok ? null : await budgetVsActualResponse.text();
        const summaryError = summaryResponse.ok ? null : await summaryResponse.text();
        console.error('Budget API errors:', { 
          budgetError, 
          summaryError,
          budgetStatus: budgetVsActualResponse.status,
          summaryStatus: summaryResponse.status
        });
        
        // If tables don't exist, show a user-friendly message
        if (budgetVsActualResponse.status === 500 || summaryResponse.status === 500) {
          throw new Error('Budget tables not set up. Please run database setup first.');
        }
        
        throw new Error(`Failed to fetch budget data. Status: ${budgetVsActualResponse.status}, ${summaryResponse.status}`);
      }

      const [budgetVsActual, summary] = await Promise.all([
        budgetVsActualResponse.json(),
        summaryResponse.json()
      ]);
      
      // Ensure budgetVsActual is an array
      setBudgetData(Array.isArray(budgetVsActual) ? budgetVsActual : []);
      setBudgetSummary(summary);
    } catch (err) {
      console.error('Error fetching budget data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch budget data');
      setBudgetData([]); // Ensure it's always an array
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBudgetData();
  }, []);

  const handleEditStart = (category: ExpenseCategory, currentAmount: number) => {
    setEditingCategory(category);
    setEditingAmount(currentAmount.toString());
  };

  const handleEditCancel = () => {
    setEditingCategory(null);
    setEditingAmount('');
  };

  const handleEditSave = async (category: ExpenseCategory) => {
    if (!editingAmount || isNaN(parseFloat(editingAmount))) {
      setError('Please enter a valid amount');
      return;
    }

    try {
      setIsUpdating(true);
      setError(null);

      const response = await fetch('/api/finance/budgets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          category,
          budget_amount: parseFloat(editingAmount),
          fiscal_year: new Date().getFullYear(),
          budget_period: 'annual'
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update budget');
      }

      await fetchBudgetData();
      setEditingCategory(null);
      setEditingAmount('');
      onBudgetUpdate?.();
    } catch (err) {
      console.error('Error updating budget:', err);
      setError('Failed to update budget');
    } finally {
      setIsUpdating(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-4 bg-gray-200 rounded w-full"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-red-600 text-center">
          <div className="mb-2 font-semibold">Budget System Error</div>
          <div className="text-sm">{error}</div>
          {error.includes('setup') && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded text-yellow-800 text-sm">
              <strong>Setup Required:</strong> The budget tables need to be created in your database. 
              Run the SQL script in <code>database/create-budget-table.sql</code> in your Supabase SQL editor.
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold text-gray-900">Budget Management</h2>
        <div className="text-xs text-gray-500">
          Fiscal Year: {new Date().getFullYear()}
        </div>
      </div>

      {/* Budget Summary */}
      {budgetSummary && (
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-xs">
            <div className="text-center">
              <div className="text-gray-600">Total Budget</div>
              <div className="text-sm font-semibold text-gray-900">
                {formatCurrency(budgetSummary.totalBudget)}
              </div>
            </div>
            <div className="text-center">
              <div className="text-gray-600">Total Spent</div>
              <div className="text-sm font-semibold text-gray-900">
                {formatCurrency(budgetSummary.totalSpent)}
              </div>
            </div>
            <div className="text-center">
              <div className="text-gray-600">Remaining</div>
              <div className={`text-sm font-semibold ${
                budgetSummary.totalRemaining < 0 ? 'text-red-600' : 'text-green-600'
              }`}>
                {formatCurrency(budgetSummary.totalRemaining)}
              </div>
            </div>
            <div className="text-center">
              <div className="text-gray-600">Over Budget</div>
              <div className={`text-sm font-semibold ${
                budgetSummary.categoriesOverBudget > 0 ? 'text-red-600' : 'text-green-600'
              }`}>
                {budgetSummary.categoriesOverBudget}
              </div>
            </div>
            <div className="text-center">
              <div className="text-gray-600">Avg. Usage</div>
              <div className="text-sm font-semibold text-gray-900">
                {budgetSummary.averagePercentageUsed?.toFixed(1) || '0'}%
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Budget Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {Array.isArray(budgetData) && budgetData.map((item) => (
          <div
            key={item.category}
            className={`p-3 rounded-lg border ${
              item.is_over_budget ? 'border-red-200 bg-red-50' : 'border-gray-200 bg-white'
            }`}
          >
            <div className="flex items-center gap-3">
              {/* Doughnut Chart */}
              <div className="flex-shrink-0">
                <DoughnutChart
                  percentage={item.percentage_used}
                  isOverBudget={item.is_over_budget}
                  size={48}
                  strokeWidth={5}
                />
              </div>
              
              {/* Category Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2 min-w-0">
                    <h3 className="font-medium text-gray-900 text-sm truncate">
                      {getCategoryDisplayName(item.category)}
                    </h3>
                    {item.is_over_budget && (
                      <ExclamationTriangleIcon className="h-4 w-4 text-red-500 flex-shrink-0" />
                    )}
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {canEdit && (
                      <>
                        {editingCategory === item.category ? (
                          <div className="flex items-center gap-1">
                            <input
                              type="number"
                              value={editingAmount}
                              onChange={(e) => setEditingAmount(e.target.value)}
                              className="w-16 px-1 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                              placeholder="Amount"
                              min="0"
                              step="0.01"
                            />
                            <button
                              onClick={() => handleEditSave(item.category)}
                              disabled={isUpdating}
                              className="p-1 text-green-600 hover:text-green-700 disabled:opacity-50"
                            >
                              <CheckIcon className="h-3 w-3" />
                            </button>
                            <button
                              onClick={handleEditCancel}
                              disabled={isUpdating}
                              className="p-1 text-red-600 hover:text-red-700 disabled:opacity-50"
                            >
                              <XMarkIcon className="h-3 w-3" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleEditStart(item.category, item.budget_amount)}
                            className="p-1 text-gray-600 hover:text-gray-700"
                          >
                            <PencilIcon className="h-3 w-3" />
                          </button>
                        )}
                      </>
                    )}
                    {!canEdit && (
                      <div className="w-6 h-6" /> // Spacer to maintain layout
                    )}
                  </div>
                </div>
                
                <div className="text-xs text-gray-600 mb-1">
                  {formatCurrency(item.total_spent)} / {formatCurrency(item.budget_amount)}
                </div>
                
                <div className="text-xs text-gray-500">
                  <span className={item.remaining_budget < 0 ? 'text-red-600' : 'text-green-600'}>
                    {formatCurrency(item.remaining_budget)} left
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {(!Array.isArray(budgetData) || budgetData.length === 0) && !isLoading && (
        <div className="text-center py-8 text-gray-500">
          No budget data available. Create some budgets to get started.
        </div>
      )}
    </div>
  );
}
