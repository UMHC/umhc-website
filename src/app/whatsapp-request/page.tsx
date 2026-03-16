import type { Metadata } from 'next';
import ManualRequestForm from '@/components/ManualRequestForm';

export const metadata: Metadata = {
  title: 'UMHC | WhatsApp Access Request',
  description: 'Request manual access to the UMHC WhatsApp group.',
  robots: 'noindex, nofollow, noarchive, nosnippet, noimageindex',
};

export default function WhatsAppRequestPage() {
  return (
    <div className="min-h-screen bg-whellow">
      {/* Main Content - Centered Layout */}
      <main 
        className="flex items-center justify-center px-4 sm:px-6 lg:px-8 py-6 sm:py-8 min-h-screen"
        role="main"
        aria-label="WhatsApp group manual access request page"
      >
        <ManualRequestForm />
      </main>
    </div>
  );
}