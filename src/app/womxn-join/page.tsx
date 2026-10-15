import type { Metadata } from 'next';
import WomxnJoinClient from './WomxnJoinClient';

export const metadata: Metadata = {
  title: 'UMHC | Join Womxn WhatsApp Group',
  description: 'Join the UMHC Womxn WhatsApp community.',
  robots: 'noindex, nofollow, noarchive, nosnippet, noimageindex',
};

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function WomxnJoinPage() {
  return (
    <div className="min-h-screen bg-whellow">
      <main
        className="flex items-center justify-center px-4 sm:px-6 lg:px-8 py-6 sm:py-8 min-h-screen"
        role="main"
        aria-label="Womxn WhatsApp group join page"
      >
        <WomxnJoinClient />
      </main>
    </div>
  );
}
