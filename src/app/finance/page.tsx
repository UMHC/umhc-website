'use client';

import { useState, useEffect } from 'react';
import type { Metadata } from 'next';
import { Transaction, FinancialSummary } from '@/types/finance';
import { FinanceService } from '@/lib/financeService';
import FinancialSummaryCard from '@/components/FinancialSummaryCard';
import TransactionsTable from '@/components/TransactionsTable';
import MonthlyIncomeExpensesChart from '@/components/MonthlyIncomeExpensesChart';
import ExpensesCategoryChart from '@/components/ExpensesCategoryChart';
import PaginationControls from '@/components/PaginationControls';

export default function FinancePage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
  const [summary, setSummary] = useState<FinancialSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPaginating, setIsPaginating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const pageSize = 15;

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const [transactionsResult, allTransactionsData, summaryData] = await Promise.all([
        FinanceService.getTransactions(currentPage, pageSize),
        FinanceService.getAllTransactions(),
        FinanceService.getFinancialSummary()
      ]);
      
      setTransactions(transactionsResult.data);
      setTotalCount(transactionsResult.count);
      setHasMore(transactionsResult.hasMore);
      setAllTransactions(allTransactionsData);
      setSummary(summaryData);
    } catch (err) {
      console.error('Error in fetchData:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while fetching data');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPage = async (page: number) => {
    try {
      setIsPaginating(true);
      setError(null);
      
      const transactionsResult = await FinanceService.getTransactions(page, pageSize);
      setTransactions(transactionsResult.data);
      setTotalCount(transactionsResult.count);
      setHasMore(transactionsResult.hasMore);
      setCurrentPage(page);
    } catch (err) {
      console.error('Error in fetchPage:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while fetching data');
    } finally {
      setIsPaginating(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="bg-whellow min-h-screen px-4 sm:px-6 md:px-8 lg:px-12 pt-16 sm:pt-20 pb-8 sm:pb-12">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-8" role="status" aria-live="polite">
            <div 
              className="animate-spin rounded-full h-12 w-12 border-b-2 border-umhc-green mx-auto"
              aria-hidden="true"
            ></div>
            <p className="mt-4 text-gray-600 text-sm sm:text-base">Loading finance data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-whellow min-h-screen px-4 sm:px-6 md:px-8 lg:px-12 pt-16 sm:pt-20 pb-8 sm:pb-12">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-8">
            <div 
              className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mx-auto max-w-md"
              role="alert"
              aria-live="assertive"
            >
              <p className="font-bold">Error loading finance data</p>
              <p className="text-sm">{error}</p>
            </div>
            <button
              onClick={fetchData}
              className="mt-4 bg-umhc-green text-white px-4 py-2 rounded-md hover:bg-stealth-green focus:outline-none focus:ring-2 focus:ring-umhc-green focus:ring-offset-2 transition-colors"
              aria-label="Retry loading finance data"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-whellow min-h-screen px-4 sm:px-6 md:px-8 lg:px-12 pt-16 sm:pt-20 pb-8 sm:pb-12">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <header className="text-center space-y-2 mb-8 sm:mb-12">
          <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-deep-black leading-tight font-sans px-2">
            Finance
          </h1>
          <div className="max-w-5xl mx-auto px-2">
            <p className="text-sm sm:text-base md:text-lg text-deep-black font-medium font-sans leading-relaxed">
              We believe in transparency when it comes to our society finances. Here you can find information about membership fees, trip costs, and how we manage our budget to provide the best possible experience for all members. Understanding our financial structure helps ensure fair pricing and sustainable operations for our hiking community.
            </p>
          </div>
        </header>

        {/* Main Content */}
        <main className="space-y-8 sm:space-y-10 md:space-y-12" role="main">

          {/* Financial Summary */}
          {summary && (
            <div className="space-y-4">
              <FinancialSummaryCard summary={summary} />
              <div className="bg-blue-50 border-l-4 border-blue-400 p-4 sm:p-6 rounded-r-lg">
                <div className="flex">
                  <div className="ml-3">
                    <p className="text-sm sm:text-base text-blue-800 font-sans leading-relaxed">
                      <strong className="font-semibold">Note:</strong> We prepay a large majority of our expenses early on such as bus transport and accommodation, therefore we'll appear in debt since this hasn't accounted for what we make off of ticket sales until later in the year.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Charts Section */}
          {allTransactions.length > 0 && (
            <section className="space-y-6 sm:space-y-8" aria-labelledby="charts-heading">
              <h2 id="charts-heading" className="text-xl sm:text-2xl md:text-3xl font-bold text-deep-black font-sans">
                Financial Overview
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
                <div className="w-full">
                  <MonthlyIncomeExpensesChart transactions={allTransactions} />
                </div>
                <div className="w-full">
                  <ExpensesCategoryChart transactions={allTransactions} />
                </div>
              </div>
            </section>
          )}

          {/* Message when finance data isn't available */}
          {summary && summary.transaction_count === 0 && transactions.length === 0 && (
            <section 
              className="bg-blue-50 border border-blue-200 rounded-lg p-6 sm:p-8 text-center"
              role="status"
              aria-live="polite"
            >
              <div className="text-blue-800">
                <h3 className="text-lg sm:text-xl font-semibold mb-2 font-sans">No Financial Data</h3>
                <p className="text-sm sm:text-base font-sans">
                  No transactions have been recorded yet. Once financial data is added, it will appear here.
                </p>
              </div>
            </section>
          )}

          {/* Transactions Section */}
          <section className="space-y-4 sm:space-y-6" aria-labelledby="transactions-heading">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-4">
              <h2 id="transactions-heading" className="text-xl sm:text-2xl md:text-3xl font-bold text-deep-black font-sans">
                Transactions
              </h2>
            </div>

            {/* Transactions Table */}
            <div className="w-full overflow-x-auto bg-white rounded-lg shadow-md">
              <TransactionsTable transactions={transactions} isLoading={isPaginating} />
              {totalCount > 0 && (
                <PaginationControls
                  currentPage={currentPage}
                  totalCount={totalCount}
                  pageSize={pageSize}
                  hasMore={hasMore}
                  onPageChange={fetchPage}
                  isLoading={isPaginating}
                />
              )}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
