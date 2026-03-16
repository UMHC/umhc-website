import type { Metadata } from 'next';
import WhatsAppVerifyForm from '@/components/WhatsAppVerifyForm';

export const metadata: Metadata = {
  title: 'UMHC | WhatsApp Verification',
  description: 'Enter your verification code to join the UMHC WhatsApp group.',
  robots: 'noindex, nofollow, noarchive, nosnippet, noimageindex',
};

export default function WhatsAppVerifyPage() {
  return (
    <div className="min-h-screen bg-whellow">
      <main
        className="flex items-center justify-center px-4 sm:px-6 lg:px-8 py-6 sm:py-8 min-h-screen"
        role="main"
        aria-label="WhatsApp group code verification page"
      >
        <WhatsAppVerifyForm />
      </main>
    </div>
  );
}