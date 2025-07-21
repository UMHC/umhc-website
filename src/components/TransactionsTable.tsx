'use client';

import { useState } from 'react';
import { Transaction } from '@/types/finance';
import { formatCurrency, formatDate, getCategoryDisplayName } from '@/lib/financeService';
import { PencilIcon, TrashIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface TransactionsTableProps {
  transactions: Transaction[];
  isLoading?: boolean;
  canEdit?: boolean;
  onEditTransaction?: (id: number, updatedTransaction: Partial<Transaction>) => Promise<void>;
  onDeleteTransaction?: (id: number) => Promise<void>;
}

export default function TransactionsTable({ 
  transactions, 
  isLoading = false, 
  canEdit = false,
  onEditTransaction,
  onDeleteTransaction 
}: TransactionsTableProps) {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<Partial<Transaction>>({});

  const handleEditStart = (transaction: Transaction) => {
    setEditingId(transaction.id);
    setEditForm({
      title: transaction.title,
      description: transaction.description,
      amount: transaction.amount,
      category: transaction.category,
    });
  };

  const handleEditCancel = () => {
    setEditingId(null);
    setEditForm({});
  };

  const handleEditSave = async (id: number) => {
    if (onEditTransaction) {
      try {
        await onEditTransaction(id, editForm);
        setEditingId(null);
        setEditForm({});
      } catch (error) {
        console.error('Error editing transaction:', error);
      }
    }
  };

  const handleDelete = async (id: number) => {
    if (onDeleteTransaction && confirm('Are you sure you want to delete this transaction?')) {
      try {
        await onDeleteTransaction(id);
      } catch (error) {
        console.error('Error deleting transaction:', error);
      }
    }
  };

  if (transactions.length === 0 && !isLoading) {
    return (
      <div className="p-6">
        <div className="text-center py-8 text-gray-500">
          <p className="font-sans">No transactions found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6">
      {/* Mobile view - Cards */}
      <div className="block md:hidden space-y-4">
        {isLoading ? (
          // Loading skeleton cards
          Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4 animate-pulse">
              <div className="flex justify-between items-start mb-3">
                <div className="h-4 bg-gray-200 rounded w-24"></div>
                <div className="h-6 bg-gray-200 rounded w-20"></div>
              </div>
              <div className="space-y-2 mb-3">
                <div className="h-5 bg-gray-200 rounded w-32"></div>
                <div className="h-3 bg-gray-200 rounded w-24"></div>
              </div>
              <div className="flex justify-between items-center">
                <div className="h-4 bg-gray-200 rounded w-20"></div>
                <div className="h-6 bg-gray-200 rounded w-16"></div>
              </div>
            </div>
          ))
        ) : (
          transactions.map((transaction) => (
            <div key={transaction.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-3">
                <span className="text-sm text-gray-600 font-sans">
                  {formatDate(transaction.date)}
                </span>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full font-sans ${
                  transaction.type === 'income' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {transaction.type}
                </span>
              </div>
              
              <div className="mb-3">
                <h3 className="font-medium text-deep-black font-sans">{transaction.title}</h3>
                {transaction.description && (
                  <p className="text-sm text-gray-500 mt-1 font-sans">{transaction.description}</p>
                )}
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 font-sans">
                  {transaction.category ? getCategoryDisplayName(transaction.category) : 'General'}
                </span>
                <span className={`font-medium font-sans ${
                  transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {transaction.type === 'income' ? '+' : '-'}{formatCurrency(Math.abs(transaction.amount))}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Desktop view - Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="text-left py-2 font-semibold text-gray-700 font-sans">Date</th>
              <th className="text-left py-2 font-semibold text-gray-700 font-sans">Title</th>
              <th className="text-left py-2 font-semibold text-gray-700 font-sans">Type</th>
              <th className="text-left py-2 font-semibold text-gray-700 font-sans">Category</th>
              <th className="text-right py-2 font-semibold text-gray-700 font-sans">Amount</th>
              {canEdit && (
                <th className="text-center py-2 font-semibold text-gray-700 font-sans">Actions</th>
              )}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              // Loading skeleton rows
              Array.from({ length: 5 }).map((_, index) => (
                <tr key={index} className="border-b animate-pulse">
                  <td className="py-3">
                    <div className="h-4 bg-gray-200 rounded w-20"></div>
                  </td>
                  <td className="py-3">
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-32"></div>
                      <div className="h-3 bg-gray-200 rounded w-24"></div>
                    </div>
                  </td>
                  <td className="py-3">
                    <div className="h-6 bg-gray-200 rounded-full w-16"></div>
                  </td>
                  <td className="py-3">
                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                  </td>
                  <td className="py-3 text-right">
                    <div className="h-4 bg-gray-200 rounded w-16 ml-auto"></div>
                  </td>
                  {canEdit && (
                    <td className="py-3 text-center">
                      <div className="h-4 bg-gray-200 rounded w-8 mx-auto"></div>
                    </td>
                  )}
                </tr>
              ))
            ) : (
              transactions.map((transaction) => (
                <tr key={transaction.id} className="border-b hover:bg-gray-50">
                  <td className="py-3 text-gray-600 font-sans">
                    {formatDate(transaction.date)}
                  </td>
                  <td className="py-3">
                    {editingId === transaction.id ? (
                      <div className="space-y-2">
                        <input
                          type="text"
                          value={editForm.title || ''}
                          onChange={(e) => setEditForm({...editForm, title: e.target.value})}
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                          placeholder="Title"
                        />
                        <textarea
                          value={editForm.description || ''}
                          onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                          placeholder="Description"
                          rows={2}
                        />
                      </div>
                    ) : (
                      <div>
                        <p className="font-medium text-deep-black font-sans">{transaction.title}</p>
                        {transaction.description && (
                          <p className="text-sm text-gray-500 mt-1 font-sans">{transaction.description}</p>
                        )}
                      </div>
                    )}
                  </td>
                  <td className="py-3">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full font-sans ${
                      transaction.type === 'income' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {transaction.type}
                    </span>
                  </td>
                  <td className="py-3 text-gray-600 font-sans">
                    {editingId === transaction.id ? (
                      <select
                        value={editForm.category || ''}
                        onChange={(e) => setEditForm({...editForm, category: e.target.value})}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                      >
                        <option value="">Select category</option>
                        <option value="accommodation">Accommodation</option>
                        <option value="training">Training</option>
                        <option value="equipment">Equipment</option>
                        <option value="transport">Transport</option>
                        <option value="social_events">Social Events</option>
                        <option value="insurance">Insurance</option>
                        <option value="administration">Administration</option>
                        <option value="food_catering">Food & Catering</option>
                        <option value="membership">Membership</option>
                        <option value="other">Other</option>
                      </select>
                    ) : (
                      transaction.category ? getCategoryDisplayName(transaction.category) : '-'
                    )}
                  </td>
                  <td className={`py-3 text-right font-medium font-sans ${
                    transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {editingId === transaction.id ? (
                      <input
                        type="number"
                        value={editForm.amount || ''}
                        onChange={(e) => setEditForm({...editForm, amount: parseFloat(e.target.value) || 0})}
                        className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-right"
                        placeholder="Amount"
                        min="0"
                        step="0.01"
                      />
                    ) : (
                      <>
                        {transaction.type === 'income' ? '+' : '-'}{formatCurrency(Math.abs(transaction.amount))}
                      </>
                    )}
                  </td>
                  {canEdit && (
                    <td className="py-3 text-center">
                      {editingId === transaction.id ? (
                        <div className="flex justify-center space-x-2">
                          <button
                            onClick={() => handleEditSave(transaction.id)}
                            className="p-1 text-green-600 hover:text-green-700"
                          >
                            <CheckIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={handleEditCancel}
                            className="p-1 text-red-600 hover:text-red-700"
                          >
                            <XMarkIcon className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex justify-center space-x-2">
                          <button
                            onClick={() => handleEditStart(transaction)}
                            className="p-1 text-blue-600 hover:text-blue-700"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(transaction.id)}
                            className="p-1 text-red-600 hover:text-red-700"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
