import { useState, useEffect, useRef } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (transaction: TransactionData) => void;
}

interface TransactionData {
  type: 'income' | 'expense';
  title: string;
  amount: number;
  description: string;
  category: string;
  date: string;
}

export default function AddTransactionModal({ isOpen, onClose, onSubmit }: AddTransactionModalProps) {
  const [formData, setFormData] = useState<TransactionData>({
    type: 'income',
    title: '',
    amount: 0,
    description: '',
    category: '',
    date: new Date().toISOString().split('T')[0]
  });
  
  const [amountValue, setAmountValue] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const modalRef = useRef<HTMLDivElement>(null);

  // Currency validation and sanitization
  const sanitizeAmount = (input: string): string => {
    // Remove all non-numeric characters except decimal point
    return input.replace(/[^0-9.]/g, '');
  };

  const validateAmount = (value: string): boolean => {
    // Check if it's a valid currency format (up to 2 decimal places)
    const currencyRegex = /^\d+(\.\d{1,2})?$/;
    return currencyRegex.test(value) && parseFloat(value) > 0;
  };

  // Input sanitization functions
  const sanitizeText = (input: string): string => {
    // Remove potentially harmful characters and limit length
    return input.replace(/[<>]/g, '').substring(0, 255);
  };

  const sanitizeTitle = (input: string): string => {
    // Title should be alphanumeric with basic punctuation
    return input.replace(/[^a-zA-Z0-9\s\-_.,!?]/g, '').substring(0, 100);
  };

  const sanitizeDescription = (input: string): string => {
    // Description allows more characters but still sanitized
    return input.replace(/[<>]/g, '').substring(0, 500);
  };

  const incomeCategories = [
    'Membership',
    'Event Tickets',
    'Equipment Hire',
    'Donations',
    'Fundraising',
    'Other'
  ];

  const expenseCategories = [
    'Accommodation',
    'Training',
    'Equipment',
    'Transport',
    'Social Events',
    'Insurance',
    'Administration',
    'Food & Catering',
    'Membership',
    'Other'
  ];

  useEffect(() => {
    if (isOpen) {
      // Focus first input when modal opens
      setTimeout(() => {
        const firstInput = modalRef.current?.querySelector('input, select') as HTMLElement;
        firstInput?.focus();
      }, 100);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    
    // Validate form
    const newErrors: {[key: string]: string} = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    if (!amountValue || !validateAmount(amountValue)) {
      newErrors.amount = 'Please enter a valid amount (e.g., 10.50)';
    }
    
    if (!formData.type) {
      newErrors.type = 'Transaction type is required';
    }
    
    if (!formData.category) {
      newErrors.category = 'Category is required';
    }
    
    if (!formData.date) {
      newErrors.date = 'Date is required';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await onSubmit(formData);
      
      // Reset form
      setFormData({
        type: 'income',
        title: '',
        amount: 0,
        description: '',
        category: '',
        date: new Date().toISOString().split('T')[0]
      });
      setAmountValue('');
      setErrors({});
      
      onClose();
    } catch (error) {
      console.error('Error adding transaction:', error);
      
      // Handle authentication errors by redirecting to login
      if (error instanceof Error && error.message.includes('not authenticated')) {
        window.location.href = '/api/auth/login?post_login_redirect_url=/committee/finance';
        return;
      }
      
      // Handle permission errors
      if (error instanceof Error && error.message.includes('permission')) {
        setErrors({ submit: 'You do not have permission to add transactions. Committee access required.' });
        return;
      }
      
      // Handle other errors
      setErrors({ 
        submit: error instanceof Error ? error.message : 'Failed to add transaction. Please try again.' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div
        ref={modalRef}
        className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Add Transaction</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => {
                const sanitized = sanitizeTitle(e.target.value);
                setFormData(prev => ({ ...prev, title: sanitized }));
              }}
              className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-umhc-green focus:border-transparent ${
                errors.title ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Brief title for the transaction"
              maxLength={100}
              required
            />
            {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Amount (£)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-gray-500">£</span>
              <input
                type="text"
                value={amountValue}
                onChange={(e) => {
                  const sanitized = sanitizeAmount(e.target.value);
                  setAmountValue(sanitized);
                  
                  if (sanitized && validateAmount(sanitized)) {
                    setFormData(prev => ({
                      ...prev,
                      amount: parseFloat(sanitized)
                    }));
                  }
                }}
                className={`w-full border rounded-md pl-8 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-umhc-green focus:border-transparent ${
                  errors.amount ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="0.00"
                maxLength={10}
                required
              />
            </div>
            {errors.amount && <p className="text-red-500 text-sm mt-1">{errors.amount}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description (Optional)
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => {
                const sanitized = sanitizeDescription(e.target.value);
                setFormData(prev => ({ ...prev, description: sanitized }));
              }}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-umhc-green focus:border-transparent"
              placeholder="Detailed description of the transaction"
              rows={3}
              maxLength={500}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Transaction Type
            </label>
            <select
              value={formData.type}
              onChange={(e) => {
                const value = e.target.value as 'income' | 'expense';
                setFormData(prev => ({ ...prev, type: value, category: '' })); // Reset category when type changes
              }}
              className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-umhc-green focus:border-transparent ${
                errors.type ? 'border-red-500' : 'border-gray-300'
              }`}
              required
            >
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
            {errors.type && <p className="text-red-500 text-sm mt-1">{errors.type}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <select
              value={formData.category}
              onChange={(e) => {
                setFormData(prev => ({ ...prev, category: e.target.value }));
              }}
              className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-umhc-green focus:border-transparent ${
                errors.category ? 'border-red-500' : 'border-gray-300'
              }`}
              required
            >
              <option value="">Select category</option>
              {(formData.type === 'income' ? incomeCategories : expenseCategories).map(category => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
            {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date
            </label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => {
                setFormData(prev => ({ ...prev, date: e.target.value }));
              }}
              className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-umhc-green focus:border-transparent ${
                errors.date ? 'border-red-500' : 'border-gray-300'
              }`}
              max={new Date().toISOString().split('T')[0]} // Prevent future dates
              required
            />
            {errors.date && <p className="text-red-500 text-sm mt-1">{errors.date}</p>}
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            {errors.submit && (
              <div className="flex-1">
                <p className="text-red-500 text-sm">{errors.submit}</p>
              </div>
            )}
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-umhc-green text-white rounded-md hover:bg-stealth-green disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? 'Adding...' : 'Add Transaction'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
