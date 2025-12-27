'use client';

import { useState, useEffect } from 'react';
import {
  PlusIcon,
  TrashIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';

interface BannerMessage {
  text: string;
  order: number;
}

export default function BannerManagement() {
  const [messages, setMessages] = useState<BannerMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Fetch current messages
  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/banner');
      const data = await response.json();

      if (data.success) {
        setMessages(data.messages);
      } else {
        setError('Failed to load banner messages');
      }
    } catch (err) {
      setError('Error fetching banner messages');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMessage = () => {
    const newOrder = messages.length > 0 ? Math.max(...messages.map(m => m.order)) + 1 : 1;
    setMessages([...messages, { text: '', order: newOrder }]);
  };

  const handleRemoveMessage = (index: number) => {
    const newMessages = messages.filter((_, i) => i !== index);
    // Reorder
    newMessages.forEach((msg, i) => {
      msg.order = i + 1;
    });
    setMessages(newMessages);
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const newMessages = [...messages];
    [newMessages[index - 1], newMessages[index]] = [newMessages[index], newMessages[index - 1]];
    // Reorder
    newMessages.forEach((msg, i) => {
      msg.order = i + 1;
    });
    setMessages(newMessages);
  };

  const handleMoveDown = (index: number) => {
    if (index === messages.length - 1) return;
    const newMessages = [...messages];
    [newMessages[index], newMessages[index + 1]] = [newMessages[index + 1], newMessages[index]];
    // Reorder
    newMessages.forEach((msg, i) => {
      msg.order = i + 1;
    });
    setMessages(newMessages);
  };

  const handleTextChange = (index: number, text: string) => {
    const newMessages = [...messages];
    newMessages[index].text = text;
    setMessages(newMessages);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(false);

      // Allow saving empty messages array to hide banner
      if (messages.length > 0 && messages.some(msg => !msg.text.trim())) {
        setError('All messages must have text');
        return;
      }

      const response = await fetch('/api/banner', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      } else {
        setError(data.error || 'Failed to save messages');
      }
    } catch (err) {
      setError('Error saving messages');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-umhc-green"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Banner Messages</h2>
        <p className="text-sm text-gray-500 mt-1">
          Manage the scrolling banner messages that appear at the top of the homepage
        </p>
      </div>

      <div className="p-6">
        {/* Messages List */}
        <div className="space-y-3 mb-6">
          {messages.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No messages yet. Click &quot;Add Message&quot; to get started.
            </div>
          ) : (
            messages.map((message, index) => (
              <div
                key={index}
                className="flex items-start gap-3 p-4 border border-gray-200 rounded-lg bg-gray-50"
              >
                {/* Order controls */}
                <div className="flex flex-col gap-1">
                  <button
                    onClick={() => handleMoveUp(index)}
                    disabled={index === 0}
                    className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Move up"
                  >
                    <ArrowUpIcon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleMoveDown(index)}
                    disabled={index === messages.length - 1}
                    className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Move down"
                  >
                    <ArrowDownIcon className="w-4 h-4" />
                  </button>
                </div>

                {/* Message input */}
                <div className="flex-1">
                  <input
                    type="text"
                    value={message.text}
                    onChange={(e) => handleTextChange(index, e.target.value)}
                    placeholder="Enter message text..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-umhc-green focus:border-transparent"
                  />
                </div>

                {/* Remove button */}
                <button
                  onClick={() => handleRemoveMessage(index)}
                  className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
                  title="Remove message"
                >
                  <TrashIcon className="w-5 h-5" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Add Message Button */}
        <button
          onClick={handleAddMessage}
          className="w-full py-2 px-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-umhc-green hover:text-umhc-green transition-colors flex items-center justify-center gap-2"
        >
          <PlusIcon className="w-5 h-5" />
          Add Message
        </button>

        {/* Status Messages */}
        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
            <XCircleIcon className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {success && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-start gap-2">
            <CheckCircleIcon className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
            <p className="text-sm text-green-700">
              {messages.length === 0 
                ? 'Banner hidden successfully! The banner will not appear on the homepage.'
                : 'Banner messages updated successfully! Changes will be visible on the homepage shortly.'}
            </p>
          </div>
        )}

        {/* Save Button */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 bg-umhc-green text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Saving...
              </>
            ) : (
              messages.length === 0 ? 'Hide Banner' : 'Save Changes'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
