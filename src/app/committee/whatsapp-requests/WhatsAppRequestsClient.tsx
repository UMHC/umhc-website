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

      const reviewerName = user?.given_name || user?.family_name
        ? `${user.given_name || ''} ${user.family_name || ''}`.trim()
        : user?.email || 'Unknown Admin';
      
      const response = await fetch('/api/committee/whatsapp-requests', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requestId,
          action,
          reviewedBy: reviewerName
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
    <main className="min-h-screen bg-[#f6f6f4] pt-24 px-4 sm:px-6 lg:px-8 pb-14">
      <div className="max-w-5xl mx-auto">
        <div className="py-6 sm:py-10 space-y-6">
          <header className="px-2 sm:px-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-umhc-green/80 mb-2">
                  Tools
                </p>
                <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-deep-black mb-3">
                  WhatsApp Access Requests
                </h1>
                <p className="max-w-2xl text-[17px] text-slate-grey leading-relaxed font-medium">
                  Review and approve manual WhatsApp access requests from users without .ac.uk email addresses.
                </p>
              </div>
              <div className="pt-2">
                <Link
                  href="/committee"
                  className="flex items-center justify-center gap-2 whitespace-nowrap bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold text-sm px-4 py-2 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300"
                >
                  <ArrowLeftIcon className="w-4 h-4" />
                  Back to Dashboard
                </Link>
              </div>
            </div>
          </header>

          <section aria-labelledby="whatsapp-requests-content">
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
                <div className="mb-8 mt-2">
                  <h2 className="text-xl font-semibold text-deep-black mb-4 flex items-center gap-2 pl-2">
                    <ClockIcon className="w-5 h-5 text-yellow-500" />
                    Pending Requests ({pendingRequests.length})
                  </h2>
                  
                  {pendingRequests.length === 0 ? (
                    <div className="bg-cream-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-200 rounded-lg p-10 text-center">
                      <ClockIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-slate-grey font-medium text-lg">No pending requests</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {pendingRequests.map((request) => (
                        <div key={request.id} className="bg-cream-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-200 rounded-lg p-6">
                          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <UserIcon className="w-5 h-5 text-slate-grey" />
                                <h3 className="text-lg font-semibold text-deep-black">
                                  {request.first_name} {request.surname}
                                </h3>
                                <span className={`ml-2 px-2 py-1 text-xs font-medium rounded border ${getStatusBadge(request.status)}`}>
                                  {formatUserType(request.user_type)}
                                </span>
                              </div>
                              
                              <div className="space-y-1.5 text-sm text-slate-grey mt-3">
                                <div className="flex items-center gap-2">
                                  <EnvelopeIcon className="w-4 h-4" />
                                  <span>{request.email}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <PhoneIcon className="w-4 h-4" />
                                  <span>{request.phone}</span>
                                </div>
                                {request.trips && (
                                  <div className="flex items-start gap-2 mt-2 pt-2 border-t border-gray-100">
                                    <div className="w-4 h-4 mt-0.5 flex-shrink-0">
                                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" role="img" aria-hidden="true">
                                        <title>Location</title>
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                      </svg>
                                    </div>
                                    <div>
                                      <span className="font-medium text-gray-700">Previous trips:</span>
                                      <div className="text-sm mt-1 bg-gray-50/50 p-3 rounded-md border border-gray-100 max-w-xl text-gray-600">
                                        {request.trips}
                                      </div>
                                    </div>
                                  </div>
                                )}
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
                  <h2 className="text-xl font-semibold text-deep-black mb-4 mt-12 flex items-center gap-2 pl-2">
                    <CheckIcon className="w-5 h-5 text-green-600" />
                    Processed Requests
                  </h2>
                  
                  {processedRequests.length === 0 ? (
                    <div className="bg-cream-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-200 rounded-lg p-10 text-center">
                      <CheckIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-slate-grey font-medium text-lg">No processed requests</p>
                    </div>
                  ) : (
                    <div className="bg-cream-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-200 rounded-lg overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50/50">
                            <tr>
                              <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                Name & Details
                              </th>
                              <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                Type & Trips
                              </th>
                              <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                Status
                              </th>
                              <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                Date
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {processedRequests.map((request) => (
                              <tr key={request.id} className="hover:bg-gray-50/50 transition-colors">
                                <td className="px-6 py-4">
                                  <div className="font-medium text-gray-900">{request.first_name} {request.surname}</div>
                                  <div className="text-sm text-gray-500 mt-1">
                                    <div>{request.email}</div>
                                    <div>{request.phone}</div>
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  <div className="text-sm text-gray-900">{formatUserType(request.user_type)}</div>
                                  {request.trips && (
                                    <div className="text-xs text-gray-500 mt-1 max-w-xs truncate" title={request.trips}>
                                      {request.trips}
                                    </div>
                                  )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${getStatusBadge(request.status)}`}>
                                    {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                                  </span>
                                  {request.reviewed_by && (
                                    <div className="text-xs text-gray-500 mt-1" title={`Reviewed by: ${request.reviewed_by}`}>
                                      By: {request.reviewed_by}
                                    </div>
                                  )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {formatDate(request.created_at)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}