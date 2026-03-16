import type { Metadata } from 'next';
import SimplifiedVerificationForm from '@/components/SimplifiedVerificationForm';

export const metadata: Metadata = {
  title: 'UMHC | WhatsApp Access',
  description: 'Get access to join the UMHC WhatsApp group.',
  robots: 'noindex, nofollow, noarchive, nosnippet, noimageindex',
};

// Add no-cache headers for security
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function WhatsAppPage() {
  return (
    <div className="min-h-screen bg-whellow">
      <main
        className="flex items-center justify-center px-4 sm:px-6 lg:px-8 py-6 sm:py-8 min-h-screen"
        role="main"
        aria-label="WhatsApp group access page"
      >
        <SimplifiedVerificationForm />
      </main>
    </div>
  );
}