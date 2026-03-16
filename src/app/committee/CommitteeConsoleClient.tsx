'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  CalendarDaysIcon,
  ArrowRightOnRectangleIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline';
import { LogoutLink } from "@kinde-oss/kinde-auth-nextjs/components";

interface CommitteeConsoleClientProps {
  user: {
    id: string;
    email: string | null;
    given_name: string | null;
    family_name: string | null;
    picture: string | null;
  };
  canManageSchedule: boolean;
  canManageGeneralWhatsapp: boolean;
  canManageWomxnWhatsapp: boolean;
}


interface ToolAction {
  label: string;
  description: string;
  icon: React.ElementType;
  href: string;
  color: string;
}

export default function CommitteeConsoleClient({
  user,
  canManageSchedule,
  canManageGeneralWhatsapp,
  canManageWomxnWhatsapp,
}: CommitteeConsoleClientProps) {
  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    // Update time every minute
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);



    setDashboardLoading(false);

    return () => clearInterval(interval);
  }, []);




  const toolActions: ToolAction[] = [
    ...(canManageSchedule
      ? [
          {
            label: 'Manage Schedule',
            description: 'Schedule hikes, socials, and manage event details',
            icon: CalendarDaysIcon,
            href: '/committee/events',
            color: 'bg-blue-500 hover:bg-blue-600'
          },
        ]
      : []),
    ...(canManageGeneralWhatsapp
      ? [
          {
            label: 'Manage General WhatsApp',
            description: 'Manage WhatsApp links, monitor access, and generate QR codes',
            icon: Cog6ToothIcon,
            href: '/committee/whatsapp-console',
            color: 'bg-green-500 hover:bg-green-600'
          },
        ]
      : []),
    ...(canManageWomxnWhatsapp
      ? [
          {
            label: 'Manage Womxn WhatsApp',
            description: 'Manage Womxn WhatsApp group links and monitor access',
            icon: Cog6ToothIcon,
            href: '/committee/womxn-whatsapp-console',
            color: 'bg-purple-500 hover:bg-purple-600'
          },
        ]
      : []),
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
                className="h-8 w-14 relative shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-umhc-green focus-visible:ring-offset-2 rounded"
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
        {/* Your Tools */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Your Tools</h2>
          </div>
          <div className="p-6">
            {toolActions.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {toolActions.map((toolAction) => (
                  <Link
                    key={toolAction.href}
                    href={toolAction.href}
                    className="group relative rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center">
                      <div className={`shrink-0 p-3 rounded-lg ${toolAction.color}`}>
                        <toolAction.icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="ml-4">
                        <h3 className="text-sm font-medium text-gray-900 group-hover:text-umhc-green">
                          {toolAction.label}
                        </h3>
                        <p className="text-sm text-gray-500">{toolAction.description}</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-600">
                You do not currently have any tools assigned. Contact an admin if you need access.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
