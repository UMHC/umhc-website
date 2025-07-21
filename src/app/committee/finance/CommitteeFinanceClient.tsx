'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  PlusIcon,
  ArrowLeftIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';
import { LogoutLink } from "@kinde-oss/kinde-auth-nextjs/components";
import { Transaction, FinancialSummary } from '@/types/finance';
import { FinanceService } from '@/lib/financeService';
import FinancialSummaryCard from '@/components/FinancialSummaryCard';
import TransactionsTable from '@/components/TransactionsTable';
import MonthlyIncomeExpensesChart from '@/components/MonthlyIncomeExpensesChart';
import ExpensesCategoryChart from '@/components/ExpensesCategoryChart';
import PaginationControls from '@/components/PaginationControls';
import AddTransactionModal from '@/components/AddTransactionModal';
import BudgetManagement from '@/components/BudgetManagement';

interface CommitteeFinanceClientProps {
  user: {
    id: string;
    email: string | null;
    given_name: string | null;
    family_name: string | null;
    picture: string | null;
  };
  canEditFinances: boolean;
  isTreasurer: boolean;
}

interface TransactionData {
  type: 'income' | 'expense';
  title: string;
  amount: number;
  description: string;
  category: string;
  date: string;
}

export default function CommitteeFinanceClient({ user, canEditFinances, isTreasurer }: CommitteeFinanceClientProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
  const [summary, setSummary] = useState<FinancialSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPaginating, setIsPaginating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const pageSize = 15;

  // Debug logging
  console.log('CommitteeFinanceClient props:', { 
    canEditFinances, 
    isTreasurer, 
    userEmail: user?.email 
  });

  const fetchData = useCallback(async () => {
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
  }, [currentPage, pageSize]);

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

  const handleEditTransaction = async (id: string, updatedTransaction: Partial<Transaction>) => {
    try {
      
      const response = await fetch(`/api/finance/transactions/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedTransaction),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Error: ${response.status}`);
      }
      
      await fetchData();
    } catch (err) {
      console.error('Error editing transaction:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while editing the transaction');
    }
  };

  const handleDeleteTransaction = async (id: string) => {
    try {
      
      const response = await fetch(`/api/finance/transactions/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Error: ${response.status}`);
      }
      
      await fetchData();
    } catch (err) {
      console.error('Error deleting transaction:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while deleting the transaction');
    }
  };

  const handleAddTransaction = async (transactionData: TransactionData) => {
    try {
      
      // Map display category names to database category names
      const categoryMapping: { [key: string]: string } = {
        'Accommodation': 'accommodation',
        'Training': 'training',
        'Equipment': 'equipment',
        'Transport': 'transport',
        'Social Events': 'social_events',
        'Insurance': 'insurance',
        'Administration': 'administration',
        'Food & Catering': 'food_catering',
        'Membership': 'membership',
        'Other': 'other',
        // Income categories
        'Event Tickets': 'other',
        'Equipment Hire': 'other',
        'Donations': 'other',
        'Fundraising': 'other',
      };
      
      // Map the TransactionData to the Transaction type expected by the service
      const transactionToAdd = {
        date: transactionData.date,
        title: transactionData.title,
        description: transactionData.description || undefined,
        amount: transactionData.amount,
        type: transactionData.type as 'income' | 'expense',
        category: categoryMapping[transactionData.category] || undefined,
      };
      
      // Call the API endpoint to add the transaction
      const response = await fetch('/api/finance/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(transactionToAdd),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('API Error:', errorData);
        
        // Handle different error types with user-friendly messages
        switch (response.status) {
          case 401:
            throw new Error('You are not authenticated. Please log in again.');
          case 403:
            throw new Error('You do not have permission to add transactions. Committee access required.');
          case 400:
            throw new Error(`Invalid input: ${errorData.error}`);
          case 409:
            throw new Error('This transaction already exists.');
          case 500:
            throw new Error('Server error. Please try again later or contact support.');
          default:
            throw new Error(errorData.error || `Error: ${response.status}`);
        }
      }
      
      const result = await response.json();
      console.log('Transaction added successfully:', result);
      
      // Close modal and refresh data
      setIsAddModalOpen(false);
      await fetchData();
    } catch (err) {
      console.error('Error adding transaction:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while adding the transaction');
    }
  };

  useEffect(() => {
    // Update time every minute
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    fetchData();

    return () => clearInterval(interval);
  }, [fetchData]);

  if (isLoading) {
    return (
      <div className="bg-whellow min-h-screen">
        {/* Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-4">
                {/* Logo */}
                <Link 
                  href="/"
                  className="h-[32px] w-[56px] relative shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-umhc-green focus-visible:ring-offset-2 rounded"
                  aria-label="UMHC Homepage"
                >
                  <div className="relative w-full h-full">
                    <Image
                      src="/images/umhc-logo.webp"
                      alt="UMHC - University of Manchester Hiking Club"
                      fill
                      sizes="56px"
                      className="object-contain"
                      priority
                    />
                  </div>
                </Link>
                
                {/* Title */}
                <div>
                  <h1 className="text-xl font-semibold text-gray-900">Finance Management</h1>
                  <p className="text-sm text-gray-500">Manage club finances and transactions</p>
                </div>
              </div>
              
              <Link
                href="/committee"
                className="flex items-center text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                <ArrowLeftIcon className="w-4 h-4 mr-1" />
                Back to Console
              </Link>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
      <div className="bg-whellow min-h-screen">
        {/* Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-4">
                {/* Logo */}
                <Link 
                  href="/"
                  className="h-[32px] w-[56px] relative shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-umhc-green focus-visible:ring-offset-2 rounded"
                  aria-label="UMHC Homepage"
                >
                  <div className="relative w-full h-full">
                    <Image
                      src="/images/umhc-logo.webp"
                      alt="UMHC - University of Manchester Hiking Club"
                      fill
                      sizes="56px"
                      className="object-contain"
                      priority
                    />
                  </div>
                </Link>
                
                {/* Title */}
                <div>
                  <h1 className="text-xl font-semibold text-gray-900">Finance Management</h1>
                  <p className="text-sm text-gray-500">Manage club finances and transactions</p>
                </div>
              </div>
              
              <Link
                href="/committee"
                className="flex items-center text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                <ArrowLeftIcon className="w-4 h-4 mr-1" />
                Back to Console
              </Link>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
    <div className="bg-whellow min-h-screen">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              {/* Logo */}
              <Link 
                href="/"
                className="h-[32px] w-[56px] relative shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-umhc-green focus-visible:ring-offset-2 rounded"
                aria-label="UMHC Homepage"
              >
                <div className="relative w-full h-full">
                  <Image
                    src="/images/umhc-logo.webp"
                    alt="UMHC - University of Manchester Hiking Club"
                    fill
                    sizes="56px"
                    className="object-contain"
                    priority
                  />
                </div>
              </Link>
              
              {/* Title and Date */}
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Finance Management</h1>
                <p className="text-sm text-gray-500">
                  {currentTime.toLocaleDateString('en-UK', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/committee"
                className="flex items-center text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                <ArrowLeftIcon className="w-4 h-4 mr-1" />
                Back to Console
              </Link>
              
              <div className="h-4 w-px bg-gray-300"></div>
              
              <span className="text-sm text-gray-500">
                Welcome, {user?.given_name || user?.email || 'Committee Member'}
              </span>
              <LogoutLink
                className="flex items-center text-sm text-gray-500 hover:text-gray-700"
                postLogoutRedirectURL="/"
              >
                <ArrowRightOnRectangleIcon className="w-4 h-4 mr-1" />
                Sign out
              </LogoutLink>
              <div className="h-4 w-px bg-gray-300"></div>
              <span className="text-sm text-gray-500">
                {currentTime.toLocaleTimeString('en-UK', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Main Content */}
        <main className="space-y-8 sm:space-y-10 md:space-y-12" role="main">
          {/* Financial Summary */}
          {summary && (
            <div className="space-y-4">
              <FinancialSummaryCard summary={summary} />
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

          {/* Budget Management Section */}
          <section className="space-y-4 sm:space-y-6" aria-labelledby="budget-heading">
            <h2 id="budget-heading" className="text-xl sm:text-2xl md:text-3xl font-bold text-deep-black font-sans">
              Budget Management
            </h2>
            <BudgetManagement onBudgetUpdate={fetchData} canEdit={isTreasurer} />
          </section>

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
                  {isTreasurer 
                    ? 'No transactions have been recorded yet. Click "Add Transaction" to get started.'
                    : 'No transactions have been recorded yet.'
                  }
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
              {canEditFinances && (
                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="bg-umhc-green text-white px-4 py-2 rounded-md hover:bg-stealth-green focus:outline-none focus:ring-2 focus:ring-umhc-green focus:ring-offset-2 transition-colors flex items-center text-sm font-medium w-fit"
                >
                  <PlusIcon className="w-4 h-4 mr-2" />
                  Add Transaction
                </button>
              )}
            </div>

            {/* Transactions Table */}
            <div className="w-full overflow-x-auto bg-white rounded-lg shadow-md">
              <TransactionsTable 
                transactions={transactions} 
                isLoading={isPaginating}
                canEdit={isTreasurer}
                onEditTransaction={handleEditTransaction}
                onDeleteTransaction={handleDeleteTransaction}
              />
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

      {/* Add Transaction Modal */}
      <AddTransactionModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddTransaction}
      />
    </div>
  );
}
