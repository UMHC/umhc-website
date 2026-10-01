'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Button from './Button';
import {
  LinkIcon,
  ClockIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  DocumentArrowDownIcon,
  CheckIcon,
  XMarkIcon,
  EnvelopeIcon,
  PhoneIcon,
  UserIcon,
} from '@heroicons/react/24/outline';

interface AccessLog {
  id: string;
  email: string;
  phone?: string;
  verification_method: 'ac_uk_email' | 'manual_approval';
  status: string;
  created_at: string;
}

interface WomxnWhatsAppConfig {
  whatsapp_womxn_link: string;
}

interface ConsoleData {
  config: WomxnWhatsAppConfig;
  accessLogs: AccessLog[];
  cleanupResult?: {
    expiredTokensCleaned: number;
  };
}

interface RequestsApiResponse {
  success?: boolean;
  requests?: WomxnWhatsAppRequest[];
  setupWarning?: string;
  error?: string;
  details?: string;
}

interface WomxnWhatsAppRequest {
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

interface WomxnWhatsAppConsoleProps {
  user?: {
    id: string;
    email: string | null;
    given_name: string | null;
    family_name: string | null;
  };
}

export default function WomxnWhatsAppConsole({ user }: WomxnWhatsAppConsoleProps) {
  const [data, setData] = useState<ConsoleData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [updating, setUpdating] = useState(false);
  const [newWhatsAppLink, setNewWhatsAppLink] = useState('');

  const [requests, setRequests] = useState<WomxnWhatsAppRequest[]>([]);
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());

  const [recentUpdate, setRecentUpdate] = useState<{
    config: WomxnWhatsAppConfig;
    timestamp: number;
  } | null>(null);

  const formatStatus = (status: string) => {
    switch (status) {
      case 'successful_join': return 'Successful Join';
      case 'pending': return 'Pending';
      case 'approved': return 'Approved';
      case 'rejected': return 'Rejected';
      default: return status.charAt(0).toUpperCase() + status.slice(1).replace(/_/g, ' ');
    }
  };

  const loadData = useCallback(async () => {
    try {
      setLoading(true);

      const [configRes, requestsRes] = await Promise.all([
        fetch('/api/committee/womxn-whatsapp-config'),
        fetch('/api/committee/womxn-whatsapp-requests'),
      ]);

      const configResult = await configRes.json();

      if (configRes.ok) {
        const now = Date.now();
        const cacheValidFor = 60000;

        if (recentUpdate && now - recentUpdate.timestamp < cacheValidFor) {
          setData({ ...configResult, config: recentUpdate.config });
          setNewWhatsAppLink(recentUpdate.config.whatsapp_womxn_link);
        } else {
          setData(configResult);
          setNewWhatsAppLink(configResult.config.whatsapp_womxn_link);
          if (recentUpdate && now - recentUpdate.timestamp >= cacheValidFor) {
            setRecentUpdate(null);
          }
        }
        setError('');
      } else {
        setError(configResult.error || 'Failed to load configuration');
      }

      const reqData = (await requestsRes.json()) as RequestsApiResponse;
      if (requestsRes.ok) {
        setRequests(reqData.requests || []);
        if (reqData.setupWarning) {
          setError(reqData.setupWarning);
        }
      } else {
        setRequests([]);
        const requestError = reqData.error || 'Failed to load Womxn requests';
        const requestDetails = reqData.details ? ` (${reqData.details})` : '';
        setError(`${requestError}${requestDetails}`);
      }
    } catch {
      setError('Network error loading data');
    } finally {
      setLoading(false);
    }
  }, [recentUpdate]);

  const handleUpdateConfig = async () => {
    if (!newWhatsAppLink.startsWith('https://chat.whatsapp.com/')) {
      setError('WhatsApp link must start with https://chat.whatsapp.com/');
      return;
    }

    try {
      setUpdating(true);
      setError('');

      const response = await fetch('/api/committee/womxn-whatsapp-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ whatsapp_womxn_link: newWhatsAppLink }),
      });

      const result = await response.json();

      if (response.ok) {
        if (result.success && result.message) {
          const updatedConfig: WomxnWhatsAppConfig = { whatsapp_womxn_link: newWhatsAppLink };
          setRecentUpdate({ config: updatedConfig, timestamp: Date.now() });
          setNewWhatsAppLink(updatedConfig.whatsapp_womxn_link);
          alert(`✅ ${result.message}`);
          loadData();
        } else if (result.manualInstructions) {
          setError(`Configuration update failed: ${result.message}\n\n${result.manualInstructions}`);
        }
      } else {
        setError(result.error || 'Failed to update configuration');
      }
    } catch {
      setError('Network error updating configuration');
    } finally {
      setUpdating(false);
    }
  };

  const handleAction = async (requestId: string, action: 'approve' | 'reject') => {
    try {
      setProcessingIds((prev) => new Set(prev).add(requestId));

      const reviewerName =
        user?.given_name || user?.family_name
          ? `${user.given_name || ''} ${user.family_name || ''}`.trim()
          : user?.email || 'Unknown Admin';

      const response = await fetch('/api/committee/womxn-whatsapp-requests', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId, action, reviewedBy: reviewerName }),
      });

      if (!response.ok) throw new Error(`Failed to ${action} request`);

      await loadData();
    } catch (err) {
      console.error(`Error ${action}ing Womxn request:`, err);
      alert(`Failed to ${action} request. Please try again.`);
    } finally {
      setProcessingIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(requestId);
        return newSet;
      });
    }
  };

  const exportAccessLogs = () => {
    if (!data?.accessLogs) return;
    const csvContent = [
      ['Email', 'Phone', 'Verification Method', 'Status', 'Date'].join(','),
      ...data.accessLogs.map((log) =>
        [log.email, log.phone || 'N/A', log.verification_method, log.status, new Date(log.created_at).toISOString()].join(',')
      ),
    ].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `womxn-whatsapp-access-logs-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleString('en-GB', {
      day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
    });

  const maskPhone = (phone?: string) => {
    if (!phone) return 'No Phone';
    return '***' + phone.slice(-4);
  };

  const maskEmail = (email: string) => {
    const [username, domain] = email.split('@');
    if (username.length <= 2) return email;
    return `${username.substring(0, 2)}***@${domain}`;
  };

  const formatUserType = (type: string) => {
    switch (type) {
      case 'alumni': return 'Alumni';
      case 'public': return 'Member of the Public';
      case 'incoming': return 'Incoming Student';
      case 'other': return 'Other';
      default: return type;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'approved': return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  useEffect(() => { loadData(); }, [loadData]);

  if (loading && !data) {
    return (
      <div className="flex flex-col items-center justify-center p-12">
        <ArrowPathIcon className="w-8 h-8 text-umhc-green animate-spin" />
        <span className="mt-4 text-slate-grey font-sans font-medium">Loading Womxn console...</span>
      </div>
    );
  }

  const pendingRequests = requests.filter((req) => req.status === 'pending');
  const processedRequests = requests.filter((req) => req.status !== 'pending');

  return (
    <div className="space-y-8">
      {/* Top Action Bar */}
      <div className="flex justify-end items-center">
        <button
          onClick={loadData}
          disabled={loading}
          className="flex items-center justify-center gap-2 whitespace-nowrap bg-earth-orange hover:bg-[#a14a32] text-cream-white font-semibold text-sm px-4 py-2 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-umhc-green disabled:opacity-50"
        >
          <ArrowPathIcon className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg flex items-center gap-2">
          <ExclamationTriangleIcon className="w-5 h-5" />
          {error}
        </div>
      )}

      {/* Manual Join Requests Section */}
      <div className="bg-cream-white rounded-lg p-6 border border-gray-200 shadow-sm">
        <h2 className="text-xl font-semibold text-deep-black font-sans mb-6 flex items-center gap-2">
          <UserIcon className="w-6 h-6 text-umhc-green" />
          Womxn WhatsApp Join Requests
        </h2>

        {/* Pending */}
        <div className="mb-8">
          <h3 className="text-lg font-medium text-deep-black mb-4 flex items-center gap-2 pl-1">
            <ClockIcon className="w-5 h-5 text-yellow-500" />
            Pending — Needs Action ({pendingRequests.length})
          </h3>

          {pendingRequests.length === 0 ? (
            <div className="bg-gray-50/50 border border-dashed border-gray-300 rounded-lg p-8 text-center">
              <CheckCircleIcon className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-slate-grey font-medium text-sm">All caught up! No pending requests.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingRequests.map((request) => (
                <div key={request.id} className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <UserIcon className="w-5 h-5 text-slate-grey" />
                        <h4 className="text-lg font-semibold text-deep-black">
                          {request.first_name} {request.surname}
                        </h4>
                        <span className={`ml-2 px-2 py-1 text-xs font-medium rounded border ${getStatusBadge(request.status)}`}>
                          {formatUserType(request.user_type)}
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-4 text-sm text-slate-grey mt-2">
                        <div className="flex items-center gap-1.5"><EnvelopeIcon className="w-4 h-4" /> {request.email}</div>
                        <div className="flex items-center gap-1.5"><PhoneIcon className="w-4 h-4" /> {request.phone}</div>
                        <div className="flex items-center gap-1.5"><ClockIcon className="w-4 h-4" /> {formatDate(request.created_at)}</div>
                      </div>

                      {request.trips && (
                        <div className="mt-3 text-sm bg-gray-50 p-3 rounded border border-gray-100">
                          <span className="font-semibold text-gray-700 block mb-1">Previous experience/trips:</span>
                          <span className="text-gray-600">{request.trips}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2 lg:flex-col lg:w-32 xl:flex-row xl:w-auto">
                      <button
                        onClick={() => handleAction(request.id, 'approve')}
                        disabled={processingIds.has(request.id)}
                        className="flex-1 lg:flex-none flex items-center justify-center gap-1.5 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white px-4 py-2 rounded-md transition-colors font-medium text-sm shadow-sm"
                      >
                        <CheckIcon className="w-4 h-4" />
                        Approve
                      </button>
                      <button
                        onClick={() => handleAction(request.id, 'reject')}
                        disabled={processingIds.has(request.id)}
                        className="flex-1 lg:flex-none flex items-center justify-center gap-1.5 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white px-4 py-2 rounded-md transition-colors font-medium text-sm shadow-sm"
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

        {/* Processed requests */}
        {processedRequests.length > 0 && (
          <div>
            <h3 className="text-lg font-medium text-deep-black mb-4 flex items-center gap-2 pl-1 mt-10">
              <CheckIcon className="w-5 h-5 text-green-600" />
              Recently Processed
            </h3>

            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm font-sans">
                  <thead className="bg-gray-50/80 border-b border-gray-200">
                    <tr>
                      <th className="px-5 py-3 text-left font-medium text-gray-500 uppercase tracking-wider text-xs">Name & Details</th>
                      <th className="px-5 py-3 text-left font-medium text-gray-500 uppercase tracking-wider text-xs">Type</th>
                      <th className="px-5 py-3 text-left font-medium text-gray-500 uppercase tracking-wider text-xs">Status</th>
                      <th className="px-5 py-3 text-left font-medium text-gray-500 uppercase tracking-wider text-xs">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {processedRequests.map((req) => (
                      <tr key={req.id} className="hover:bg-gray-50/50">
                        <td className="px-5 py-3">
                          <div className="font-medium text-deep-black">{req.first_name} {req.surname}</div>
                          <div className="text-xs text-slate-grey mt-1">{req.email}</div>
                          {req.phone && <div className="text-xs text-slate-grey">{req.phone}</div>}
                        </td>
                        <td className="px-5 py-3 text-slate-grey max-w-[200px]">
                          <div>{formatUserType(req.user_type)}</div>
                          {req.trips && (
                            <div className="text-xs text-gray-500 mt-1 truncate" title={req.trips}>{req.trips}</div>
                          )}
                        </td>
                        <td className="px-5 py-3">
                          <span className={`px-2 py-1 inline-flex text-xs leading-4 font-semibold rounded border ${getStatusBadge(req.status)}`}>
                            {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
                          </span>
                          {req.reviewed_by && (
                            <div className="text-xs text-gray-500 mt-1.5" title={`Reviewed by: ${req.reviewed_by}`}>
                              By: {req.reviewed_by}
                            </div>
                          )}
                        </td>
                        <td className="px-5 py-3 text-xs text-slate-grey">{formatDate(req.created_at)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-8">
        {/* Link Configuration */}
        <div className="bg-cream-white rounded-lg p-6 border border-gray-200 shadow-sm flex flex-col">
          <h2 className="text-xl font-semibold text-deep-black font-sans mb-4 flex items-center gap-2">
            <LinkIcon className="w-5 h-5 text-umhc-green" />
            Active Womxn Group Link
            {recentUpdate && Date.now() - recentUpdate.timestamp < 60000 && (
              <span className="ml-2 px-2 py-1 bg-green-100 text-green-700 text-[10px] uppercase font-bold rounded-full">
                Saved
              </span>
            )}
          </h2>

          <div className="flex-1 flex flex-col justify-between">
            <div className="mb-4 space-y-2">
              <label className="block text-sm font-medium text-deep-black font-sans mb-2">
                Womxn WhatsApp Group Invitation URL
              </label>
              <input
                type="url"
                value={newWhatsAppLink}
                onChange={(e) => setNewWhatsAppLink(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:border-umhc-green focus:outline-none focus:ring-1 focus:ring-umhc-green font-mono text-sm"
                placeholder="https://chat.whatsapp.com/..."
              />
              <p className="text-xs text-slate-grey mt-2">
                Used to redirect Womxn members after they verify their identity.
              </p>
            </div>

            <button
              onClick={handleUpdateConfig}
              disabled={updating || !newWhatsAppLink}
              className="flex items-center justify-center gap-2 whitespace-nowrap bg-umhc-green hover:bg-stealth-green text-cream-white font-semibold text-sm px-4 py-2 mt-2 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-umhc-green w-full sm:w-auto self-start"
            >
              {updating ? <ArrowPathIcon className="w-4 h-4 animate-spin" /> : <CheckCircleIcon className="w-4 h-4" />}
              Save Link
            </button>
          </div>
        </div>

        {/* Access Logs */}
        <div className="bg-cream-white rounded-lg p-6 border border-gray-200 shadow-sm flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-deep-black font-sans flex items-center gap-2">
              <ClockIcon className="w-5 h-5 text-umhc-green" />
              Womxn Verifications Log
            </h2>
            <Button onClick={exportAccessLogs} className="flex items-center gap-1.5 text-xs px-2.5 py-1.5">
              <DocumentArrowDownIcon className="w-3.5 h-3.5" />
              Export
            </Button>
          </div>

          <div className="border border-gray-200 rounded-lg overflow-hidden flex flex-col">
            {data?.cleanupResult && (
              <div className="p-2 bg-green-50 border-b border-green-100 flex-shrink-0">
                <p className="text-xs text-green-700 font-sans">
                  Cleaned up {data.cleanupResult.expiredTokensCleaned} expired tokens
                </p>
              </div>
            )}

            <div className="overflow-x-auto bg-white pb-10">
              <table className="w-full text-sm font-sans relative">
                <thead className="sticky top-0 bg-gray-50 border-b border-gray-200 z-10 shadow-sm">
                  <tr>
                    <th className="px-3 py-2 text-left font-medium text-gray-500 uppercase tracking-wider text-[10px]">Phone & Email</th>
                    <th className="px-3 py-2 text-left font-medium text-gray-500 uppercase tracking-wider text-[10px]">Verif Info</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {data?.accessLogs?.length ? (
                    data.accessLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-gray-50">
                        <td className="px-3 py-2.5">
                          {log.phone ? (
                            <div className="font-mono text-sm font-semibold text-deep-black" title={log.phone}>{maskPhone(log.phone)}</div>
                          ) : (
                            <div className="font-mono text-sm font-semibold text-gray-400 italic">No Phone</div>
                          )}
                          <div className="font-mono text-[11px] text-slate-grey mt-0.5" title={log.email}>{maskEmail(log.email)}</div>
                          <div className="text-[10px] text-gray-400 mt-1 flex flex-wrap gap-1">
                            <span>{formatDate(log.created_at)}</span>
                          </div>
                        </td>
                        <td className="px-3 py-2.5">
                          <div className="flex flex-col items-start gap-1">
                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium leading-none ${
                              log.verification_method === 'ac_uk_email' ? 'bg-blue-50 text-blue-700 border border-blue-100' : 'bg-orange-50 text-orange-700 border border-orange-100'
                            }`}>
                              {log.verification_method === 'ac_uk_email' ? 'Auto' : 'Manual'}
                            </span>
                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium leading-none ${
                              log.status === 'successful_join' ? 'bg-green-50 text-green-700 border border-green-100' :
                              log.status === 'pending' ? 'bg-yellow-50 text-yellow-700 border border-yellow-100' :
                              log.status === 'approved' ? 'bg-blue-50 text-blue-700 border border-blue-100' :
                              log.status === 'rejected' ? 'bg-red-50 text-red-700 border border-red-100' :
                              'bg-gray-50 text-gray-700 border border-gray-200'
                            }`}>
                              {formatStatus(log.status)}
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={2} className="px-3 py-6 text-center text-gray-500 text-xs">No access logs found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
