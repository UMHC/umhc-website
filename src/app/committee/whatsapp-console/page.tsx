import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeftIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';
import { LogoutLink } from '@kinde-oss/kinde-auth-nextjs/components';
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server';
import WhatsAppConsole from '@/components/WhatsAppConsole';

export const metadata: Metadata = {
  title: 'UMHC Committee | WhatsApp Console',
  description: 'Manage WhatsApp group access and monitor usage',
  robots: 'noindex, nofollow, noarchive, nosnippet, noimageindex',
};

// Add no-cache headers for security
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function WhatsAppConsolePage() {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

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

              {/* Title */}
              <div>
                <h1 className="text-xl font-semibold text-gray-900">WhatsApp Console</h1>
                <p className="text-sm text-gray-500">Manage WhatsApp group access and monitor usage</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Link
                href="/committee"
                className="flex items-center text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                <ArrowLeftIcon className="w-4 h-4 mr-1" />
                Back to Console
              </Link>

              <div className="h-4 w-px bg-gray-300"></div>

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
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <WhatsAppConsole />
      </div>
    </div>
  );
}