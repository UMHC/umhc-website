'use client';

import { useEffect } from 'react';
import { useKindeBrowserClient } from '@kinde-oss/kinde-auth-nextjs';
import { ArrowRight, Server } from 'lucide-react';

export default function DashboardRedirectPage() {
  const { isAuthenticated, isLoading } = useKindeBrowserClient();

  useEffect(() => {
    if (isLoading) return;

    if (isAuthenticated) {
      window.location.replace('/dashboard');
      return;
    }

    window.location.replace('/api/auth/login?post_login_redirect_url=%2Fdashboard');
  }, [isAuthenticated, isLoading]);

  return (
    <main
      className="flex min-h-screen items-center justify-center bg-[#f6f6f4] px-4"
      aria-busy="true"
      aria-live="polite"
    >
      <div className="flex flex-col items-center gap-5 text-center">
        <div className="flex items-center gap-3 text-black" aria-hidden="true">
          <Server className="h-10 w-10" strokeWidth={1.8} />
          <ArrowRight className="h-6 w-6 animate-pulse motion-reduce:animate-none" strokeWidth={2} />
          <Server className="h-10 w-10" strokeWidth={1.8} />
        </div>
        <p className="text-lg font-semibold text-black">
          Redirecting you to authentication...
        </p>
      </div>
    </main>
  );
}