'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  ChartBarIcon, 
  CalendarDaysIcon, 
  CogIcon,
  ArrowTrendingUpIcon,
  UsersIcon,
  BanknotesIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';
import { LogoutLink } from "@kinde-oss/kinde-auth-nextjs/components";
import { FinanceService } from '@/lib/financeService';
import { FinancialSummary } from '@/types/finance';
import { getScheduleEvents } from '@/lib/scheduleService';
import { ScheduleEvent } from '@/types/schedule';

interface CommitteeConsoleClientProps {
  user: {
    id: string;
    email: string | null;
    given_name: string | null;
    family_name: string | null;
    picture: string | null;
  };
}

interface QuickStat {
  label: string;
  value: string;
  icon: React.ElementType;
  color: string;
  href?: string;
  linkText?: string;
}

interface QuickAction {
  label: string;
  description: string;
  icon: React.ElementType;
  href: string;
  color: string;
}

export default function CommitteeConsoleClient({ user }: CommitteeConsoleClientProps) {
  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [financialSummary, setFinancialSummary] = useState<FinancialSummary | null>(null);
  const [financeLoading, setFinanceLoading] = useState(true);
  const [scheduleEvents, setScheduleEvents] = useState<ScheduleEvent[]>([]);
  const [scheduleLoading, setScheduleLoading] = useState(true);

  useEffect(() => {
    // Update time every minute
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    // Fetch financial data
    const fetchFinancialData = async () => {
      try {
        setFinanceLoading(true);
        const summary = await FinanceService.getFinancialSummary();
        setFinancialSummary(summary);
      } catch (error) {
        console.error('Error fetching financial data:', error);
      } finally {
        setFinanceLoading(false);
      }
    };

    // Fetch schedule data
    const fetchScheduleData = async () => {
      try {
        setScheduleLoading(true);
        const events = await getScheduleEvents();
        setScheduleEvents(events);
      } catch (error) {
        console.error('Error fetching schedule data:', error);
      } finally {
        setScheduleLoading(false);
      }
    };

    fetchFinancialData();
    fetchScheduleData();
    setDashboardLoading(false);

    return () => clearInterval(interval);
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const getUpcomingEventsCount = () => {
    const now = new Date();
    // Set time to start of today to include events happening today
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    const upcomingEvents = scheduleEvents.filter(event => {
      const eventDate = new Date(event.event_date);
      // Reset time to start of day for proper comparison
      const eventDateOnly = new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate());
      
      // Include events from today onwards
      return eventDateOnly >= today;
    });
    
    console.log('Total events:', scheduleEvents.length);
    console.log('Today:', today.toISOString());
    console.log('Upcoming events:', upcomingEvents.map(e => ({ 
      title: e.title, 
      date: e.event_date,
      parsedDate: new Date(e.event_date).toISOString()
    })));
    
    return upcomingEvents.length;
  };

  const quickStats: QuickStat[] = [
    {
      label: 'Current Balance',
      value: financeLoading ? 'Loading...' : (financialSummary ? formatCurrency(financialSummary.current_balance) : 'Unavailable'),
      icon: BanknotesIcon,
      color: 'text-green-600',
      href: '/committee/finance',
      linkText: 'View details'
    },
    {
      label: 'Upcoming Events',
      value: scheduleLoading ? 'Loading...' : getUpcomingEventsCount().toString(),
      icon: CalendarDaysIcon,
      color: 'text-purple-600',
      href: '/committee/schedule',
      linkText: 'View details'
    },
    {
      label: 'Recent Transactions',
      value: financeLoading ? 'Loading...' : (financialSummary ? financialSummary.transaction_count.toString() : 'Unavailable'),
      icon: ArrowTrendingUpIcon,
      color: 'text-orange-600',
      href: '/finance',
      linkText: 'View finance page'
    }
  ];

  const quickActions: QuickAction[] = [
    {
      label: 'Finances',
      description: "Log new expenses, view the club's financial overview and budgets",
      icon: ChartBarIcon,
      href: '/committee/finance',
      color: 'bg-green-500 hover:bg-green-600'
    },
    {
      label: 'Event Management',
      description: 'Schedule hikes, socials, and manage event details',
      icon: CalendarDaysIcon,
      href: '/committee/events',
      color: 'bg-blue-500 hover:bg-blue-600'
    },
    {
      label: 'Settings',
      description: 'Manage committee access and system settings',
      icon: CogIcon,
      href: '/committee/settings',
      color: 'bg-gray-500 hover:bg-gray-600'
    }
  ];

  const recentActivities = [
    {
      type: 'transaction',
      title: 'Payment received: Lake District Trip',
      amount: '+£240.00',
      time: '2 hours ago',
      icon: BanknotesIcon,
      color: 'text-green-600'
    },
    {
      type: 'member',
      title: 'New member registration: Sarah Johnson',
      amount: '',
      time: '4 hours ago',
      icon: UsersIcon,
      color: 'text-blue-600'
    },
    {
      type: 'event',
      title: 'Event updated: Peak District Hike',
      amount: '',
      time: '6 hours ago',
      icon: CalendarDaysIcon,
      color: 'text-purple-600'
    },
    {
      type: 'transaction',
      title: 'Expense: Bus hire for weekend trip',
      amount: '-£180.00',
      time: '1 day ago',
      icon: BanknotesIcon,
      color: 'text-red-600'
    }
  ];

  const upcomingTasks = [
    {
      title: 'Update risk assessments',
      priority: 'high',
      dueDate: '2025-07-18',
      assignee: 'Health & Safety Secretary'
    },
    {
      title: 'Prepare AGM agenda',
      priority: 'medium',
      dueDate: '2025-07-22',
      assignee: 'Chair'
    },
    {
      title: 'Order new equipment',
      priority: 'low',
      dueDate: '2025-07-25',
      assignee: 'Equipment Secretary'
    }
  ];

  if (dashboardLoading) {
    return (
      <div className="min-h-screen bg-whellow flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-umhc-green mx-auto mb-4"></div>
          <p className="text-slate-grey">Loading committee console...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-whellow">
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
                <h1 className="text-xl font-semibold text-gray-900">Committee Console</h1>
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
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {quickStats.map((stat, index) => (
            <div key={index} className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                  <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                </div>
                <div className={`p-3 rounded-full bg-gray-50`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
              {stat.href && (
                <Link 
                  href={stat.href}
                  className="mt-4 text-sm text-umhc-green hover:text-stealth-green inline-flex items-center"
                >
                  {stat.linkText || 'View details'} →
                </Link>
              )}
            </div>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quick Actions */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {quickActions.map((action, index) => (
                    <Link
                      key={index}
                      href={action.href}
                      className="group relative rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center">
                        <div className={`flex-shrink-0 p-3 rounded-lg ${action.color}`}>
                          <action.icon className="w-6 h-6 text-white" />
                        </div>
                        <div className="ml-4">
                          <h3 className="text-sm font-medium text-gray-900 group-hover:text-umhc-green">
                            {action.label}
                          </h3>
                          <p className="text-sm text-gray-500">{action.description}</p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activities & Tasks */}
          <div className="space-y-6">
            {/* Recent Activities */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Recent Activities</h2>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {recentActivities.map((activity, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        <activity.icon className={`w-5 h-5 ${activity.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900">{activity.title}</p>
                        <div className="flex items-center justify-between mt-1">
                          <p className="text-xs text-gray-500">{activity.time}</p>
                          {activity.amount && (
                            <span className={`text-xs font-medium ${activity.color}`}>
                              {activity.amount}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Upcoming Tasks */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Upcoming Tasks</h2>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {upcomingTasks.map((task, index) => (
                    <div key={index} className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{task.title}</p>
                        <p className="text-xs text-gray-500">{task.assignee}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          task.priority === 'high' ? 'bg-red-100 text-red-800' :
                          task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {task.priority}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(task.dueDate).toLocaleDateString('en-UK', { 
                            month: 'short', 
                            day: 'numeric' 
                          })}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* System Status */}
        <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">System Status</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mx-auto mb-2"></div>
                <p className="text-sm font-medium text-gray-900">Website</p>
                <p className="text-xs text-gray-500">All systems operational</p>
              </div>
              <div className="text-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mx-auto mb-2"></div>
                <p className="text-sm font-medium text-gray-900">Database</p>
                <p className="text-xs text-gray-500">Connected and healthy</p>
              </div>
              <div className="text-center">
                <div className="w-3 h-3 bg-yellow-500 rounded-full mx-auto mb-2"></div>
                <p className="text-sm font-medium text-gray-900">Payments</p>
                <p className="text-xs text-gray-500">Minor delays expected</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
