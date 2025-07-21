'use client';

import { FinancialSummary } from '@/types/finance';
import { formatCurrency, formatDate } from '@/lib/financeService';

interface FinancialSummaryCardProps {
  summary: FinancialSummary;
}

export default function FinancialSummaryCard({ summary }: FinancialSummaryCardProps) {
  const balanceColor = summary.current_balance >= 0 ? 'text-green-600' : 'text-red-600';
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-xl font-bold text-deep-black mb-4">Financial Summary</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div className="text-center p-4 bg-green-50 rounded-lg">
          <p className="text-sm text-gray-600 mb-1">Total Income</p>
          <p className="text-2xl font-bold text-green-600">
            {formatCurrency(summary.total_income)}
          </p>
        </div>
        
        <div className="text-center p-4 bg-red-50 rounded-lg">
          <p className="text-sm text-gray-600 mb-1">Total Expenses</p>
          <p className="text-2xl font-bold text-red-600">
            {formatCurrency(summary.total_expenses)}
          </p>
        </div>
        
        <div className="text-center p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-gray-600 mb-1">Current Balance</p>
          <p className={`text-2xl font-bold ${balanceColor}`}>
            {formatCurrency(summary.current_balance)}
          </p>
        </div>
      </div>
      
      <div className="flex justify-between items-center text-sm text-gray-600 pt-4 border-t">
        <span>Total Transactions: {summary.transaction_count}</span>
        <span>Last Updated: {formatDate(summary.last_updated)}</span>
      </div>
    </div>
  );
}
