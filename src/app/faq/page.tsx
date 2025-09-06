'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function FAQ() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the FAQ section on the about page
    router.replace('/about#faqs');
  }, [router]);

  // Show loading state while redirecting
  return (
    <div className="bg-whellow min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-pulse">
          <h1 className="text-2xl font-bold text-umhc-green mb-4">Redirecting to FAQ...</h1>
          <p className="text-slate-grey">Taking you to our frequently asked questions section.</p>
        </div>
      </div>
    </div>
  );
}