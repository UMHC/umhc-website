'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ArrowLeftIcon,
  CheckIcon,
  XMarkIcon,
  ClockIcon,
  EnvelopeIcon,
  PhoneIcon,
  UserIcon
} from '@heroicons/react/24/outline';

interface WhatsAppRequest {
  id: string;
  first_name: string;
  surname: string;
  email: string;
  phone: string;
  user_type: string;
  trips?: string;
  status: 'pending' | 'approved' | 'rejected';
  reviewed_by?: string;
  reviewed_at?: string;
  created_at: string;
}

interface WhatsAppRequestsClientProps {
  user: {
    id: string;
    email: string | null;
    given_name: string | null;
    family_name: string | null;
  };
}

export default function WhatsAppRequestsClient({ user }: WhatsAppRequestsClientProps) {
  const [requests, setRequests] = useState<WhatsAppRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());

  // Load requests from API
  const loadRequests = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/committee/whatsapp-requests');
      
      if (!response.ok) {
        throw new Error('Failed to load requests');
      }
      
      const data = await response.json();
      setRequests(data.requests || []);
      setError('');
    } catch (err) {
      console.error('Error loading requests:', err);
      setError('Failed to load WhatsApp requests. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  };

  // Handle approve/reject actions
  const handleAction = async (requestId: string, action: 'approve' | 'reject') => {
    try {
      setProcessingIds(prev => new Set(prev).add(requestId));
      
      const response = await fetch('/api/committee/whatsapp-requests', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requestId,
          action,
          reviewedBy: user.email
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to ${action} request`);
      }
      
      // Reload requests to get updated data
      await loadRequests();
      
    } catch (err) {
      console.error(`Error ${action}ing request:`, err);
      setError(`Failed to ${action} request. Please try again.`);
    } finally {
      setProcessingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(requestId);
        return newSet;
      });
    }
  };

  // Load requests on component mount
  useEffect(() => {
    loadRequests();
  }, []);

  // Format user type for display
  const formatUserType = (type: string) => {
    switch (type) {
      case 'alumni': return 'Alumni';
      case 'public': return 'Member of the Public';
      case 'incoming': return 'Incoming Student';
      case 'other': return 'Other';
      default: return type;
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get status badge styling
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const pendingRequests = requests.filter(req => req.status === 'pending');
  const processedRequests = requests.filter(req => req.status !== 'pending');

  return (
    <div className="min-h-screen bg-whellow">
      {/* Header */}
      <div className="bg-cream-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link
                href="/committee"
                className="flex items-center gap-2 text-slate-grey hover:text-umhc-green transition-colors"
                aria-label="Back to committee console"
              >
                <ArrowLeftIcon className="w-5 h-5" />
                <span className="font-medium">Back to Console</span>
              </Link>
            </div>
            <div className="text-right">
              <p className="text-sm text-slate-grey">
                Logged in as {user.given_name} {user.family_name}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-deep-black mb-2">
            WhatsApp Access Requests
          </h1>
          <p className="text-slate-grey">
            Review and approve manual WhatsApp access requests from users without .ac.uk email addresses.
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-umhc-green mx-auto"></div>
            <p className="text-slate-grey mt-4">Loading requests...</p>
          </div>
        )}

        {/* Pending Requests */}
        {!loading && (
          <>
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-deep-black mb-4 flex items-center gap-2">
                <ClockIcon className="w-5 h-5 text-yellow-600" />
                Pending Requests ({pendingRequests.length})
              </h2>
              
              {pendingRequests.length === 0 ? (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
                  <ClockIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-slate-grey">No pending requests</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingRequests.map((request) => (
                    <div key={request.id} className="bg-cream-white border border-gray-200 rounded-lg p-6">
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <UserIcon className="w-5 h-5 text-slate-grey" />
                            <h3 className="text-lg font-semibold text-deep-black">
                              {request.first_name} {request.surname}
                            </h3>
                            <span className={`px-2 py-1 text-xs font-medium rounded border ${getStatusBadge(request.status)}`}>
                              {formatUserType(request.user_type)}
                            </span>
                          </div>
                          
                          <div className="space-y-1 text-sm text-slate-grey">
                            <div className="flex items-center gap-2">
                              <EnvelopeIcon className="w-4 h-4" />
                              <span>{request.email}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <PhoneIcon className="w-4 h-4" />
                              <span>{request.phone}</span>
                            </div>
                            {request.trips && (
                              <div className="flex items-start gap-2">
                                <div className="w-4 h-4 mt-0.5 flex-shrink-0">
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                  </svg>
                                </div>
                                <div>
                                  <span className="font-medium">Previous trips:</span>
                                  <div className="text-xs mt-1 bg-gray-50 p-2 rounded border max-w-md">
                                    {request.trips}
                                  </div>
                                </div>
                              </div>
                            )}
                            <div className="flex items-center gap-2">
                              <ClockIcon className="w-4 h-4" />
                              <span>Submitted {formatDate(request.created_at)}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex gap-3">
                          <button
                            onClick={() => handleAction(request.id, 'approve')}
                            disabled={processingIds.has(request.id)}
                            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white px-4 py-2 rounded-lg transition-colors font-medium"
                          >
                            <CheckIcon className="w-4 h-4" />
                            {processingIds.has(request.id) ? 'Processing...' : 'Approve'}
                          </button>
                          <button
                            onClick={() => handleAction(request.id, 'reject')}
                            disabled={processingIds.has(request.id)}
                            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white px-4 py-2 rounded-lg transition-colors font-medium"
                          >
                            <XMarkIcon className="w-4 h-4" />
                            Reject
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Processed Requests */}
            <div>
              <h2 className="text-xl font-semibold text-deep-black mb-4">
                Recent Processed Requests ({processedRequests.length})
              </h2>
              
              {processedRequests.length === 0 ? (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
                  <p className="text-slate-grey">No processed requests yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {processedRequests.slice(0, 10).map((request) => (
                    <div key={request.id} className="bg-cream-white border border-gray-200 rounded-lg p-4 opacity-75">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium text-deep-black">
                              {request.first_name} {request.surname}
                            </h4>
                            <span className={`px-2 py-1 text-xs font-medium rounded border ${getStatusBadge(request.status)}`}>
                              {request.status}
                            </span>
                          </div>
                          <div className="text-sm text-slate-grey">
                            {formatUserType(request.user_type)} • {request.email}
                          </div>
                        </div>
                        
                        <div className="text-xs text-slate-grey">
                          {request.status === 'approved' ? 'Approved' : 'Rejected'} by {request.reviewed_by || 'Unknown'}<br />
                          {formatDate(request.reviewed_at || request.created_at)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}