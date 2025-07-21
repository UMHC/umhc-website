'use client';

import { useState, useEffect } from 'react';
import { BudgetVsActual } from '@/types/finance';
import { BudgetService } from '@/lib/budgetService';
import { ExclamationTriangleIcon, ChartBarIcon } from '@heroicons/react/24/outline';

interface BudgetOverviewProps {
  className?: string;
}

export default function BudgetOverview({ className = '' }: BudgetOverviewProps) {
  const [budgetData, setBudgetData] = useState<BudgetVsActual[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBudgetData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch('/api/finance/budgets?type=vs-actual');
      if (!response.ok) {
        throw new Error('Failed to fetch budget data');
      }
      
      const data = await response.json();
      setBudgetData(data);
    } catch (err) {
      console.error('Error fetching budget data:', err);
      setError('Failed to fetch budget data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBudgetData();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const overBudgetCategories = budgetData.filter(item => item.is_over_budget);
  const totalBudget = budgetData.reduce((sum, item) => sum + item.budget_amount, 0);
  const totalSpent = budgetData.reduce((sum, item) => sum + item.total_spent, 0);
  const totalRemaining = totalBudget - totalSpent;

  if (isLoading) {
    return (
      <div className={`bg-white rounded-lg shadow-sm p-4 ${className}`}>
        <div className="animate-pulse">
          <div className="h-5 bg-gray-200 rounded w-1/3 mb-3"></div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || budgetData.length === 0) {
    return (
      <div className={`bg-white rounded-lg shadow-sm p-4 ${className}`}>
        <div className="flex items-center gap-2 mb-2">
          <ChartBarIcon className="h-5 w-5 text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-900">Budget Overview</h3>
        </div>
        <div className="text-sm text-gray-500">
          {error || 'No budget data available'}
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm p-4 ${className}`}>
      <div className="flex items-center gap-2 mb-4">
        <ChartBarIcon className="h-5 w-5 text-gray-600" />
        <h3 className="text-lg font-semibold text-gray-900">Budget Overview</h3>
      </div>

      <div className="space-y-4">
        {/* Budget Summary */}
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div className="text-center">
            <div className="text-gray-600">Total Budget</div>
            <div className="text-lg font-semibold text-gray-900">
              {formatCurrency(totalBudget)}
            </div>
          </div>
          <div className="text-center">
            <div className="text-gray-600">Total Spent</div>
            <div className="text-lg font-semibold text-gray-900">
              {formatCurrency(totalSpent)}
            </div>
          </div>
          <div className="text-center">
            <div className="text-gray-600">Remaining</div>
            <div className={`text-lg font-semibold ${
              totalRemaining < 0 ? 'text-red-600' : 'text-green-600'
            }`}>
              {formatCurrency(totalRemaining)}
            </div>
          </div>
        </div>

        {/* Over Budget Alert */}
        {overBudgetCategories.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />
              <span className="text-sm font-medium text-red-800">
                {overBudgetCategories.length} categories over budget
              </span>
            </div>
            <div className="text-sm text-red-700 space-y-1">
              {overBudgetCategories.slice(0, 3).map((category) => (
                <div key={category.category} className="flex justify-between">
                  <span>{BudgetService.getCategoryDisplayName(category.category)}</span>
                  <span className="font-medium">
                    {formatCurrency(category.total_spent - category.budget_amount)} over
                  </span>
                </div>
              ))}
              {overBudgetCategories.length > 3 && (
                <div className="text-red-600">
                  +{overBudgetCategories.length - 3} more categories
                </div>
              )}
            </div>
          </div>
        )}

        {/* Top Categories by Usage */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">Top Categories by Usage</h4>
          <div className="space-y-2">
            {budgetData
              .sort((a, b) => b.percentage_used - a.percentage_used)
              .slice(0, 5)
              .map((category) => (
                <div key={category.category} className="flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-sm text-gray-900 truncate">
                      {BudgetService.getCategoryDisplayName(category.category)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${
                          category.is_over_budget 
                            ? 'bg-red-500' 
                            : category.percentage_used >= 80 
                              ? 'bg-yellow-500' 
                              : 'bg-green-500'
                        }`}
                        style={{ width: `${Math.min(category.percentage_used, 100)}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium text-gray-600 min-w-[40px] text-right">
                      {category.percentage_used.toFixed(0)}%
                    </span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
