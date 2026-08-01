import type { Metadata } from 'next';
import WomxnVerificationForm from '@/components/WomxnVerificationForm';

export const metadata: Metadata = {
  title: 'UMHC | Womxn WhatsApp Access',
  description: 'Get access to join the UMHC Womxn WhatsApp group.',
  robots: 'noindex, nofollow, noarchive, nosnippet, noimageindex',
};

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function WomxnWhatsAppPage() {
  return (
    <div className="min-h-screen bg-whellow">
      <main
        className="flex items-center justify-center px-4 sm:px-6 lg:px-8 py-6 sm:py-8 min-h-screen"
        role="main"
        aria-label="Womxn WhatsApp group access page"
      >
        <WomxnVerificationForm />
      </main>
    </div>
  );
}
