import type { Metadata } from 'next';
import JoinClient from './JoinClient';

export const metadata: Metadata = {
  title: 'UMHC | Join WhatsApp Group',
  description: 'Join the UMHC WhatsApp community.',
  robots: 'noindex, nofollow, noarchive, nosnippet, noimageindex',
};

// Add no-cache headers for security
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function JoinPage() {
  return (
    <div className="min-h-screen bg-whellow">
      <main
        className="flex items-center justify-center px-4 sm:px-6 lg:px-8 py-6 sm:py-8 min-h-screen"
        role="main"
        aria-label="WhatsApp group join page"
      >
        <JoinClient />
      </main>
    </div>
  );
}