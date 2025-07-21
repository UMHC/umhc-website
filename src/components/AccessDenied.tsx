import Link from 'next/link';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { LogoutLink } from "@kinde-oss/kinde-auth-nextjs/components";

interface AccessDeniedProps {
  message?: string;
  showLogout?: boolean;
}

export default function AccessDenied({ 
  message = "You don't have permission to access this page.",
  showLogout = true 
}: AccessDeniedProps) {
  return (
    <div className="min-h-screen bg-whellow flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center">
            <div className="bg-red-100 rounded-full p-3">
              <ExclamationTriangleIcon className="w-8 h-8 text-red-600" />
            </div>
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Access Denied
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {message}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="text-center space-y-6">
            <div className="space-y-2">
              <p className="text-sm text-gray-600">
                This area is restricted to committee members with the appropriate permissions.
              </p>
              <p className="text-sm text-gray-600">
                If you believe this is an error, please contact the Website Secretary.
              </p>
            </div>

            <div className="flex flex-col space-y-3">
              <Link
                href="/"
                className="w-full flex justify-center py-3 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-umhc-green transition-colors"
              >
                Return to Homepage
              </Link>

              {showLogout && (
                <LogoutLink
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-umhc-green hover:bg-stealth-green focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-umhc-green transition-colors"
                  postLogoutRedirectURL="/"
                >
                  Sign out
                </LogoutLink>
              )}
            </div>
          </div>
        </div>

        <div className="text-center">
          <p className="text-xs text-gray-500">
            Contact: website@umhc.org.uk
          </p>
        </div>
      </div>
    </div>
  );
}
