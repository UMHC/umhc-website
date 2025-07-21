'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  ArrowLeftIcon,
  ShieldCheckIcon,
  BellIcon,
  CogIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

interface SettingsClientProps {
  user: {
    id: string;
    email: string | null;
    given_name: string | null;
    family_name: string | null;
    picture: string | null;
  };
}

interface CommitteeRole {
  id: string;
  name: string;
  email: string;
  role: string;
  permissions: string[];
  lastActive: string;
  status: 'active' | 'inactive';
}

interface SystemSetting {
  id: string;
  category: string;
  name: string;
  description: string;
  value: string | boolean;
  type: 'toggle' | 'text' | 'select';
  options?: string[];
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function SettingsClient({ user: _user }: SettingsClientProps) {
  const [activeTab, setActiveTab] = useState<'access' | 'system' | 'notifications'>('access');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  const committeeMembers: CommitteeRole[] = [
    {
      id: '1',
      name: 'Alice Johnson',
      email: 'chair@umhc.org.uk',
      role: 'Chair',
      permissions: ['full_access', 'finance', 'member_management', 'event_management'],
      lastActive: '2025-07-16T10:30:00',
      status: 'active'
    },
    {
      id: '2',
      name: 'Bob Smith',
      email: 'treasurer@umhc.org.uk',
      role: 'Treasurer',
      permissions: ['finance', 'member_management'],
      lastActive: '2025-07-16T09:15:00',
      status: 'active'
    },
    {
      id: '3',
      name: 'Carol Williams',
      email: 'secretary@umhc.org.uk',
      role: 'Secretary',
      permissions: ['member_management', 'event_management'],
      lastActive: '2025-07-15T16:45:00',
      status: 'active'
    },
    {
      id: '4',
      name: 'David Brown',
      email: 'hike.sec@umhc.org.uk',
      role: 'Hike Secretary',
      permissions: ['event_management'],
      lastActive: '2025-07-14T14:20:00',
      status: 'inactive'
    }
  ];

  const systemSettings: SystemSetting[] = [
    {
      id: '1',
      category: 'Website',
      name: 'Maintenance Mode',
      description: 'Enable maintenance mode to prevent public access',
      value: false,
      type: 'toggle'
    },
    {
      id: '2',
      category: 'Website',
      name: 'Registration Open',
      description: 'Allow new member registrations',
      value: true,
      type: 'toggle'
    },
    {
      id: '3',
      category: 'Events',
      name: 'Auto-publish Events',
      description: 'Automatically publish events after creation',
      value: false,
      type: 'toggle'
    },
    {
      id: '4',
      category: 'Finance',
      name: 'Payment Gateway',
      description: 'Select payment processing provider',
      value: 'stripe',
      type: 'select',
      options: ['stripe', 'paypal', 'square']
    },
    {
      id: '5',
      category: 'Security',
      name: 'Session Timeout',
      description: 'Committee session timeout (minutes)',
      value: '120',
      type: 'text'
    }
  ];

  const handleSave = async () => {
    setSaveStatus('saving');
    
    // Simulate API call
    setTimeout(() => {
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 3000);
    }, 1000);
  };

  const handleToggleSetting = (settingId: string) => {
    // Implementation for toggling settings
    console.log(`Toggle setting ${settingId}`);
  };

  // TODO: Implement permission updates
  // const handleUpdatePermissions = (memberId: string, permissions: string[]) => {
  //   // Implementation for updating member permissions
  //   console.log(`Update permissions for ${memberId}:`, permissions);
  // };

  const tabs: Array<{ id: 'access' | 'system' | 'notifications', name: string, icon: React.ComponentType<{ className?: string }> }> = [
    { id: 'access', name: 'Access Control', icon: ShieldCheckIcon },
    { id: 'system', name: 'System Settings', icon: CogIcon },
    { id: 'notifications', name: 'Notifications', icon: BellIcon }
  ];

  return (
    <div className="min-h-screen bg-whellow">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link 
                href="/committee"
                className="flex items-center text-gray-500 hover:text-gray-700"
              >
                <ArrowLeftIcon className="w-5 h-5 mr-2" />
                Back to Console
              </Link>
              <div className="h-6 w-px bg-gray-300"></div>
              <h1 className="text-xl font-semibold text-gray-900">Committee Settings</h1>
            </div>
            <div className="flex items-center space-x-4">
              {saveStatus === 'saved' && (
                <div className="flex items-center text-green-600">
                  <CheckCircleIcon className="w-5 h-5 mr-2" />
                  <span className="text-sm">Settings saved</span>
                </div>
              )}
              <button
                onClick={handleSave}
                disabled={saveStatus === 'saving'}
                className="bg-umhc-green text-white px-4 py-2 rounded-md hover:bg-stealth-green disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saveStatus === 'saving' ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Navigation */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-umhc-green text-umhc-green'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="w-5 h-5 mr-2" />
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'access' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Committee Access Control</h2>
                <p className="text-sm text-gray-500 mt-1">
                  Manage committee member permissions and access levels
                </p>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {committeeMembers.map((member) => (
                    <div key={member.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className={`w-3 h-3 rounded-full ${
                          member.status === 'active' ? 'bg-green-500' : 'bg-gray-400'
                        }`}></div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{member.name}</p>
                          <p className="text-sm text-gray-500">{member.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900">{member.role}</p>
                          <p className="text-xs text-gray-500">
                            Last active: {new Date(member.lastActive).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {member.permissions.map((permission) => (
                            <span
                              key={permission}
                              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                            >
                              {permission.replace('_', ' ')}
                            </span>
                          ))}
                        </div>
                        <button className="text-sm text-umhc-green hover:text-stealth-green">
                          Edit
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Permission Levels</h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border border-gray-200 rounded-lg">
                    <h3 className="font-medium text-gray-900 mb-2">Full Access</h3>
                    <p className="text-sm text-gray-600">Complete system access including user management</p>
                  </div>
                  <div className="p-4 border border-gray-200 rounded-lg">
                    <h3 className="font-medium text-gray-900 mb-2">Finance</h3>
                    <p className="text-sm text-gray-600">View and manage financial transactions</p>
                  </div>
                  <div className="p-4 border border-gray-200 rounded-lg">
                    <h3 className="font-medium text-gray-900 mb-2">Member Management</h3>
                    <p className="text-sm text-gray-600">View member details and registration status</p>
                  </div>
                  <div className="p-4 border border-gray-200 rounded-lg">
                    <h3 className="font-medium text-gray-900 mb-2">Event Management</h3>
                    <p className="text-sm text-gray-600">Create and manage events and schedules</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'system' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">System Configuration</h2>
                <p className="text-sm text-gray-500 mt-1">
                  Configure website behavior and system settings
                </p>
              </div>
              <div className="p-6">
                <div className="space-y-6">
                  {Object.entries(
                    systemSettings.reduce((acc, setting) => {
                      if (!acc[setting.category]) acc[setting.category] = [];
                      acc[setting.category].push(setting);
                      return acc;
                    }, {} as Record<string, SystemSetting[]>)
                  ).map(([category, settings]) => (
                    <div key={category} className="space-y-4">
                      <h3 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">
                        {category}
                      </h3>
                      {settings.map((setting) => (
                        <div key={setting.id} className="flex items-center justify-between py-3">
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">{setting.name}</p>
                            <p className="text-sm text-gray-500">{setting.description}</p>
                          </div>
                          <div className="ml-4">
                            {setting.type === 'toggle' ? (
                              <button
                                onClick={() => handleToggleSetting(setting.id)}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-umhc-green focus:ring-offset-2 ${
                                  setting.value ? 'bg-umhc-green' : 'bg-gray-200'
                                }`}
                              >
                                <span
                                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                    setting.value ? 'translate-x-6' : 'translate-x-1'
                                  }`}
                                />
                              </button>
                            ) : setting.type === 'select' ? (
                              <select
                                value={setting.value as string}
                                className="block w-32 rounded-md border-gray-300 shadow-sm focus:border-umhc-green focus:ring-umhc-green sm:text-sm"
                              >
                                {setting.options?.map((option) => (
                                  <option key={option} value={option}>
                                    {option}
                                  </option>
                                ))}
                              </select>
                            ) : (
                              <input
                                type="text"
                                value={setting.value as string}
                                className="block w-32 rounded-md border-gray-300 shadow-sm focus:border-umhc-green focus:ring-umhc-green sm:text-sm"
                              />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex">
                <ExclamationTriangleIcon className="w-5 h-5 text-yellow-400 mr-3 mt-0.5" />
                <div>
                  <h3 className="text-sm font-medium text-yellow-800">Important Notice</h3>
                  <p className="text-sm text-yellow-700 mt-1">
                    Changes to system settings will affect all users. Please test thoroughly before applying to production.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'notifications' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Notification Settings</h2>
                <p className="text-sm text-gray-500 mt-1">
                  Configure how and when the committee receives notifications
                </p>
              </div>
              <div className="p-6">
                <div className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">
                      Email Notifications
                    </h3>
                    <div className="space-y-3">
                      {[
                        { name: 'New Member Registration', desc: 'When someone joins the club' },
                        { name: 'Event Booking', desc: 'When someone books an event' },
                        { name: 'Financial Transactions', desc: 'Payment confirmations and expenses' },
                        { name: 'System Alerts', desc: 'Critical system notifications' }
                      ].map((notification) => (
                        <div key={notification.name} className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-900">{notification.name}</p>
                            <p className="text-sm text-gray-500">{notification.desc}</p>
                          </div>
                          <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-umhc-green transition-colors focus:outline-none focus:ring-2 focus:ring-umhc-green focus:ring-offset-2">
                            <span className="inline-block h-4 w-4 transform rounded-full bg-white translate-x-6 transition-transform" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">
                      Dashboard Alerts
                    </h3>
                    <div className="space-y-3">
                      {[
                        { name: 'Low Balance Alert', desc: 'When account balance falls below £500' },
                        { name: 'Equipment Due', desc: 'Equipment loan return reminders' },
                        { name: 'Event Capacity', desc: 'When events reach 80% capacity' }
                      ].map((alert) => (
                        <div key={alert.name} className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-900">{alert.name}</p>
                            <p className="text-sm text-gray-500">{alert.desc}</p>
                          </div>
                          <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-umhc-green transition-colors focus:outline-none focus:ring-2 focus:ring-umhc-green focus:ring-offset-2">
                            <span className="inline-block h-4 w-4 transform rounded-full bg-white translate-x-6 transition-transform" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
