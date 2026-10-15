import type { Metadata } from 'next';
import WomxnManualRequestForm from '@/components/WomxnManualRequestForm';

export const metadata: Metadata = {
  title: 'UMHC | Womxn WhatsApp Access Request',
  description: 'Request manual access to the UMHC Womxn WhatsApp group.',
  robots: 'noindex, nofollow, noarchive, nosnippet, noimageindex',
};

export default function WomxnWhatsAppRequestPage() {
  return (
    <div className="min-h-screen bg-whellow">
      <main
        className="flex items-center justify-center px-4 sm:px-6 lg:px-8 py-6 sm:py-8 min-h-screen"
        role="main"
        aria-label="Womxn WhatsApp group manual access request page"
      >
        <WomxnManualRequestForm />
      </main>
    </div>
  );
}
