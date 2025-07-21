import Link from 'next/link';

export default function AccessDenied() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <div className="mx-auto h-12 w-12 text-red-500">
            <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h1 className="mt-4 text-2xl font-bold text-gray-900">Access Denied</h1>
          <p className="mt-2 text-gray-600">
            You don&apos;t have permission to access the Committee Console.
          </p>
          <p className="mt-2 text-sm text-gray-500">
            This area is restricted to committee members and treasurers only.
          </p>
        </div>
        
        <div className="space-y-4">
          <Link
            href="/"
            className="w-full bg-earth-orange text-white py-2 px-4 rounded-md hover:bg-earth-orange-dark transition-colors inline-block"
          >
            Return to Homepage
          </Link>
          
          <Link
            href="/api/auth/logout"
            className="w-full bg-gray-200 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-300 transition-colors inline-block"
          >
            Sign Out
          </Link>
        </div>
      </div>
    </div>
  );
}
