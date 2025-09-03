import type { Metadata } from 'next';
import VerificationForm from '@/components/VerificationForm';

export const metadata: Metadata = {
  title: 'UMHC | Whatsapp Verification',
  description: 'Verify your not a bot to join the UMHC WhatsApp group.',
  robots: 'noindex, nofollow, noarchive, nosnippet, noimageindex',
};

export default function WhatsAppVerifyPage() {
  return (
    <div className="min-h-screen bg-whellow">
      {/* Main Content - Centered Layout */}
      <main 
        className="flex items-center justify-center px-4 sm:px-6 lg:px-8 py-6 sm:py-8 min-h-screen"
        role="main"
        aria-label="WhatsApp group verification page"
      >
        <VerificationForm />
      </main>
    </div>
  );
}