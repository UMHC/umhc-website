'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Button from './Button';
import {
  LinkIcon,
  QrCodeIcon,
  ClockIcon,
  UserGroupIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  DocumentArrowDownIcon,
  PlusIcon,
  TrashIcon,
  EyeSlashIcon,
  EyeIcon
} from '@heroicons/react/24/outline';

interface AccessLog {
  id: string;
  email: string;
  phone?: string;
  verification_method: 'ac_uk_email' | 'manual_approval';
  status: string;
  created_at: string;
}

interface QRToken {
  id: string;
  token: string;
  name: string;
  enabled: boolean;
  created_at: string;
  created_by: string | null;
  last_used_at: string | null;
  use_count: number;
}

interface WhatsAppConfig {
  whatsapp_link: string;
  qr_redirect_enabled: boolean;
}

interface ConsoleData {
  config: WhatsAppConfig;
  accessLogs: AccessLog[];
  qrTokens?: QRToken[];
  cleanupResult?: {
    expiredTokensCleaned: number;
  };
}

export default function WhatsAppConsole() {
  const [data, setData] = useState<ConsoleData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [updating, setUpdating] = useState(false);
  const [newWhatsAppLink, setNewWhatsAppLink] = useState('');
  const [qrEnabled, setQrEnabled] = useState(true);
  const [showCreateQR, setShowCreateQR] = useState(false);
  const [newQRName, setNewQRName] = useState('');

  // Client-side cache for recent updates (bypasses Edge Config propagation delay)
  const [recentUpdate, setRecentUpdate] = useState<{
    config: WhatsAppConfig;
    timestamp: number;
  } | null>(null);

  // Format status text for display
  const formatStatus = (status: string) => {
    switch (status) {
      case 'successful_join':
        return 'Successful Join';
      case 'pending':
        return 'Pending';
      case 'approved':
        return 'Approved';
      case 'rejected':
        return 'Rejected';
      default:
        return status.charAt(0).toUpperCase() + status.slice(1).replace(/_/g, ' ');
    }
  };

  // Load console data
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/committee/whatsapp-config');
      const result = await response.json();

      if (response.ok) {
        // Check if we have a recent update that should override Edge Config
        const now = Date.now();
        const cacheValidFor = 60000; // 60 seconds

        if (recentUpdate && (now - recentUpdate.timestamp) < cacheValidFor) {
          // Use cached recent update instead of Edge Config data
          const dataWithCachedConfig = {
            ...result,
            config: recentUpdate.config
          };
          setData(dataWithCachedConfig);
          setNewWhatsAppLink(recentUpdate.config.whatsapp_link);
          setQrEnabled(recentUpdate.config.qr_redirect_enabled);
        } else {
          // Use Edge Config data (cache expired or no recent update)
          setData(result);
          setNewWhatsAppLink(result.config.whatsapp_link);
          setQrEnabled(result.config.qr_redirect_enabled);

          // Clear expired cache
          if (recentUpdate && (now - recentUpdate.timestamp) >= cacheValidFor) {
            setRecentUpdate(null);
          }
        }

        setError('');
      } else {
        setError(result.error || 'Failed to load configuration');
      }
    } catch {
      setError('Network error loading configuration');
    } finally {
      setLoading(false);
    }
  }, [recentUpdate]);

  // Update configuration
  const handleUpdateConfig = async () => {
    if (!newWhatsAppLink.startsWith('https://chat.whatsapp.com/')) {
      setError('WhatsApp link must start with https://chat.whatsapp.com/');
      return;
    }

    try {
      setUpdating(true);
      setError('');

      const response = await fetch('/api/committee/whatsapp-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          whatsapp_link: newWhatsAppLink,
          qr_redirect_enabled: qrEnabled
        })
      });

      const result = await response.json();

      if (response.ok) {
        if (result.success && result.message) {
          // Configuration was updated successfully
          setError(''); // Clear any errors

          // Cache the new config for 60 seconds to override Edge Config delays
          const updatedConfig = {
            whatsapp_link: newWhatsAppLink,
            qr_redirect_enabled: qrEnabled
          };

          setRecentUpdate({
            config: updatedConfig,
            timestamp: Date.now()
          });

          // Update form fields to show cached values
          setNewWhatsAppLink(updatedConfig.whatsapp_link);
          setQrEnabled(updatedConfig.qr_redirect_enabled);

          alert(`✅ ${result.message}`);

          // Refresh other data (logs, etc.) but don't let it override our cached config
          try {
            const response = await fetch('/api/committee/whatsapp-config');
            const freshResult = await response.json();

            if (response.ok) {
              // Update data but keep our cached config
              setData({
                ...freshResult,
                config: updatedConfig // Keep using our cached version
              });
            }
          } catch (err) {
            console.error('Failed to refresh data:', err);
          }
        } else if (result.instructions) {
          // Manual update instructions provided
          alert(`Configuration update instructions:\n\n${result.instructions}`);
        } else if (result.manualInstructions) {
          // Missing environment variables - show setup instructions
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

  // Generate QR code URL for token with UMHC logo
  const generateQRCode = (token: string, size: number = 300) => {
    const qrURL = `${window.location.origin}/qr/${token}`;
    return `/api/qr-code?data=${encodeURIComponent(qrURL)}&size=${size}`;
  };

  // Create new QR token
  const handleCreateQRToken = async () => {
    if (!newQRName.trim()) {
      setError('QR token name is required');
      return;
    }

    try {
      setUpdating(true);
      const response = await fetch('/api/committee/qr-tokens', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newQRName.trim() })
      });

      const result = await response.json();

      if (response.ok) {
        setNewQRName('');
        setShowCreateQR(false);
        setError('');
        await loadData(); // Refresh to show new token
      } else {
        setError(result.error || 'Failed to create QR token');
      }
    } catch {
      setError('Network error creating QR token');
    } finally {
      setUpdating(false);
    }
  };

  // Toggle QR token enabled/disabled
  const handleToggleQRToken = async (tokenId: string, enabled: boolean) => {
    try {
      const response = await fetch('/api/committee/qr-tokens', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tokenId, enabled })
      });

      const result = await response.json();

      if (response.ok) {
        await loadData(); // Refresh to show updated status
      } else {
        setError(result.error || 'Failed to update QR token');
      }
    } catch {
      setError('Network error updating QR token');
    }
  };

  // Delete QR token
  const handleDeleteQRToken = async (tokenId: string, tokenName: string) => {
    if (!confirm(`Are you sure you want to delete the QR token "${tokenName}"? This action cannot be undone and will invalidate all generated QR codes using this token.`)) {
      return;
    }

    try {
      const response = await fetch('/api/committee/qr-tokens', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tokenId })
      });

      const result = await response.json();

      if (response.ok) {
        await loadData(); // Refresh to remove deleted token
      } else {
        setError(result.error || 'Failed to delete QR token');
      }
    } catch {
      setError('Network error deleting QR token');
    }
  };

  // Export access logs as CSV
  const exportAccessLogs = () => {
    if (!data?.accessLogs) return;

    const csvContent = [
      ['Email', 'Phone', 'Verification Method', 'Status', 'Date'].join(','),
      ...data.accessLogs.map(log => [
        log.email,
        log.phone || 'N/A',
        log.verification_method,
        log.status,
        new Date(log.created_at).toISOString()
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `whatsapp-access-logs-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  // Mask email for privacy
  const maskEmail = (email: string) => {
    const [username, domain] = email.split('@');
    if (username.length <= 2) return email;
    return `${username.substring(0, 2)}***@${domain}`;
  };

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <ArrowPathIcon className="w-8 h-8 text-umhc-green animate-spin" />
        <span className="ml-2 text-slate-grey font-sans">Loading console...</span>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md">
        <ExclamationTriangleIcon className="w-5 h-5 inline mr-2" />
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Refresh Button */}
      <div className="flex justify-end items-center">
        <button
          onClick={loadData}
          className="flex items-center justify-center gap-2 whitespace-nowrap bg-earth-orange hover:bg-[#a14a32] text-cream-white font-semibold text-sm px-4 py-2 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-umhc-green"
        >
          <ArrowPathIcon className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md">
          <ExclamationTriangleIcon className="w-5 h-5 inline mr-2" />
          {error}
        </div>
      )}

      {/* Current Configuration */}
      <div className="bg-cream-white rounded-lg p-6 border border-gray-200">
        <h2 className="text-xl font-semibold text-deep-black font-sans mb-4 flex items-center gap-2">
          <LinkIcon className="w-5 h-5" />
          Current Configuration
          {recentUpdate && (Date.now() - recentUpdate.timestamp) < 60000 && (
            <span className="ml-2 px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
              Recent changes cached
            </span>
          )}
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-deep-black font-sans mb-1">
              WhatsApp Group Link
            </label>
            <input
              type="url"
              value={newWhatsAppLink}
              onChange={(e) => setNewWhatsAppLink(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:border-umhc-green focus:outline-none font-mono text-sm"
              placeholder="https://chat.whatsapp.com/..."
            />
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="qr-enabled"
              checked={qrEnabled}
              onChange={(e) => setQrEnabled(e.target.checked)}
              className="w-4 h-4 text-umhc-green bg-white border border-gray-300 rounded focus:ring-umhc-green"
            />
            <label htmlFor="qr-enabled" className="text-sm font-medium text-deep-black font-sans">
              Allow joining via QR Code
            </label>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleUpdateConfig}
              disabled={updating || !newWhatsAppLink}
              className="flex items-center justify-center gap-2 whitespace-nowrap bg-earth-orange hover:bg-[#a14a32] text-cream-white font-semibold text-sm px-4 py-2 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-umhc-green"
            >
              {updating ? (
                <ArrowPathIcon className="w-4 h-4 animate-spin" />
              ) : (
                <CheckCircleIcon className="w-4 h-4" />
              )}
              Update Configuration
            </button>

          </div>
        </div>
      </div>

      {/* QR Token Management */}
      <div className="bg-cream-white rounded-lg p-6 border border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-deep-black font-sans flex items-center gap-2">
            <QrCodeIcon className="w-5 h-5" />
            QR Code Management
          </h2>
          <button
            onClick={() => setShowCreateQR(true)}
            className="flex items-center justify-center gap-2 whitespace-nowrap bg-umhc-green hover:bg-stealth-green text-cream-white font-semibold text-sm px-4 py-2 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-umhc-green"
          >
            <PlusIcon className="w-4 h-4" />
            Create QR Code
          </button>
        </div>

        {/* Create QR Token Form */}
        {showCreateQR && (
          <div className="mb-6 p-4 bg-whellow rounded-lg border border-gray-200">
            <h3 className="text-lg font-medium text-deep-black mb-3">Create New QR Code</h3>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={newQRName}
                onChange={(e) => setNewQRName(e.target.value)}
                placeholder="QR Code name (e.g., 'Freshers Fair 2024')"
                className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded-md focus:border-umhc-green focus:outline-none font-sans text-sm"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleCreateQRToken}
                  disabled={updating || !newQRName.trim()}
                  className="flex items-center justify-center gap-2 whitespace-nowrap bg-earth-orange hover:bg-[#a14a32] text-cream-white font-semibold text-sm px-4 py-2 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-umhc-green"
                >
                  {updating ? (
                    <ArrowPathIcon className="w-4 h-4 animate-spin" />
                  ) : (
                    <CheckCircleIcon className="w-4 h-4" />
                  )}
                  Create
                </button>
                <button
                  onClick={() => {
                    setShowCreateQR(false);
                    setNewQRName('');
                  }}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold text-sm rounded-lg transition-colors duration-200"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* QR Tokens List */}
        <div className="space-y-3">
          {data?.qrTokens?.length ? (
            data.qrTokens.map((token) => (
              <div key={token.id} className="flex items-center justify-between p-4 bg-whellow rounded-lg border border-gray-200">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="font-medium text-deep-black">{token.name}</h3>
                    <span className={`px-2 py-1 rounded text-xs ${
                      token.enabled
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {token.enabled ? 'Active' : 'Disabled'}
                    </span>
                  </div>
                  <div className="text-sm text-slate-grey mt-1">
                    Created {new Date(token.created_at).toLocaleDateString()} •
                    Used {token.use_count} times
                    {token.last_used_at && ` • Last used ${new Date(token.last_used_at).toLocaleDateString()}`}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {token.enabled && (
                    <a
                      href={generateQRCode(token.token)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 text-umhc-green hover:text-stealth-green rounded-full hover:bg-gray-100 transition-colors"
                      title="Download QR Code"
                    >
                      <QrCodeIcon className="w-4 h-4" />
                    </a>
                  )}
                  <button
                    onClick={() => handleToggleQRToken(token.id, !token.enabled)}
                    className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
                    title={token.enabled ? 'Disable QR Code' : 'Enable QR Code'}
                  >
                    {token.enabled ? (
                      <EyeSlashIcon className="w-4 h-4" />
                    ) : (
                      <EyeIcon className="w-4 h-4" />
                    )}
                  </button>
                  <button
                    onClick={() => handleDeleteQRToken(token.id, token.name)}
                    className="p-2 text-red-400 hover:text-red-600 rounded-full hover:bg-gray-100 transition-colors"
                    title="Delete QR Code"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-slate-grey">
              No QR codes created yet. Create your first QR code to get started.
            </div>
          )}
        </div>
      </div>

      {/* Quick Links */}
      <div className="bg-whellow rounded-lg p-6 border border-gray-200">
        <h2 className="text-xl font-semibold text-deep-black font-sans mb-4">Quick Links</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a
            href="/qr"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 p-3 bg-cream-white rounded-lg hover:bg-gray-100 transition-colors"
          >
            <QrCodeIcon className="w-5 h-5 text-umhc-green" />
            <span className="font-sans text-sm">Test QR Redirect</span>
          </a>
          <a
            href="/whatsapp"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 p-3 bg-cream-white rounded-lg hover:bg-gray-100 transition-colors"
          >
            <UserGroupIcon className="w-5 h-5 text-umhc-green" />
            <span className="font-sans text-sm">View automatic access page</span>
          </a>
          <a
            href="/whatsapp-request"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 p-3 bg-cream-white rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ClockIcon className="w-5 h-5 text-umhc-green" />
            <span className="font-sans text-sm">View manual request page</span>
          </a>
        </div>
      </div>

      {/* Access Logs */}
      <div className="bg-cream-white rounded-lg p-6 border border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-deep-black font-sans flex items-center gap-2">
            <ClockIcon className="w-5 h-5" />
            Recent Access Logs
          </h2>
          <Button
            onClick={exportAccessLogs}
            className="flex items-center gap-2 text-sm"
          >
            <DocumentArrowDownIcon className="w-4 h-4" />
            Export CSV
          </Button>
        </div>

        {data?.cleanupResult && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
            <p className="text-sm text-green-700 font-sans">
              Cleaned up {data.cleanupResult.expiredTokensCleaned} expired tokens
            </p>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-sm font-sans">
            <thead>
              <tr className="border-b border-gray-300">
                <th className="text-left py-2 text-deep-black font-medium">Email</th>
                <th className="text-left py-2 text-deep-black font-medium">Phone</th>
                <th className="text-left py-2 text-deep-black font-medium">Method</th>
                <th className="text-left py-2 text-deep-black font-medium">Status</th>
                <th className="text-left py-2 text-deep-black font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {data?.accessLogs.length ? (
                data.accessLogs.map((log) => (
                  <tr key={log.id} className="border-b border-gray-200">
                    <td className="py-2 text-slate-grey font-mono text-xs">
                      {maskEmail(log.email)}
                    </td>
                    <td className="py-2 text-slate-grey font-mono text-xs">
                      {log.phone ? `${log.phone.substring(0, 3)}***${log.phone.slice(-4)}` : 'N/A'}
                    </td>
                    <td className="py-2 text-slate-grey">
                      <span className={`px-2 py-1 rounded text-xs ${
                        log.verification_method === 'ac_uk_email'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-orange-100 text-orange-700'
                      }`}>
                        {log.verification_method === 'ac_uk_email' ? 'Auto (.ac.uk)' : 'Manual Approval'}
                      </span>
                    </td>
                    <td className="py-2 text-slate-grey">
                      <span className={`px-2 py-1 rounded text-xs ${
                        log.status === 'successful_join' ? 'bg-green-100 text-green-700' :
                        log.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                        log.status === 'approved' ? 'bg-blue-100 text-blue-700' :
                        log.status === 'rejected' ? 'bg-red-100 text-red-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {formatStatus(log.status)}
                      </span>
                    </td>
                    <td className="py-2 text-slate-grey text-xs">
                      {formatDate(log.created_at)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-4 text-center text-slate-grey">
                    No access logs found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}