import { ShieldCheckIcon } from '@heroicons/react/24/outline';
import { LoginLink } from "@kinde-oss/kinde-auth-nextjs/components";

export default function CommitteeLogin() {
  return (
    <div className="min-h-screen bg-whellow flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center">
            <div className="bg-umhc-green rounded-full p-3">
              <ShieldCheckIcon className="w-8 h-8 text-white" />
            </div>
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Committee Access
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Sign in to access the committee console
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="text-center space-y-6">
            <div className="space-y-2">
              <p className="text-sm text-gray-600">
                This area is restricted to committee members only.
              </p>
              <p className="text-sm text-gray-600">
                Please sign in with your UMHC committee account.
              </p>
            </div>

            <LoginLink
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-umhc-green hover:bg-stealth-green focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-umhc-green transition-colors"
              postLoginRedirectURL="/committee"
            >
              Sign in with Kinde
            </LoginLink>
          </div>
        </div>

        <div className="text-center">
          <p className="text-xs text-gray-500">
            For committee members only. If you're having trouble accessing your account, 
            please contact the Website Secretary.
          </p>
        </div>
      </div>
    </div>
  );
}
