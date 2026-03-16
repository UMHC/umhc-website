'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

export default function VerificationRedirect() {
  const params = useParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verifyAndRedirect = async () => {
      try {
        const code = params.code as string;

        if (!code || !/^[a-f0-9]{12}$/.test(code)) {
          setStatus('error');
          setMessage('Invalid verification link');
          return;
        }

        // Call the verification API
        const response = await fetch('/api/whatsapp-redirect', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ shortCode: code }),
        });

        const data = await response.json();

        if (data.success && data.whatsappUrl) {
          setStatus('success');
          setMessage('Redirecting to WhatsApp...');

          // Redirect to WhatsApp
          window.location.href = data.whatsappUrl;
        } else {
          setStatus('error');
          setMessage(data.error || 'Verification failed');
        }
      } catch {
        setStatus('error');
        setMessage('Something went wrong. Please try the manual verification code instead.');
      }
    };

    verifyAndRedirect();
  }, [params.code]);

  return (
    <div className="min-h-screen bg-whellow flex items-center justify-center p-4">
      <div className="bg-cream-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
        <div className="mb-6">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/umhc-badge.webp"
            alt="UMHC Logo"
            className="w-16 h-16 mx-auto mb-4"
          />
          <h1 className="text-2xl font-bold text-umhc-green">UMHC WhatsApp</h1>
        </div>

        {status === 'loading' && (
          <div>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-umhc-green mx-auto mb-4"></div>
            <p className="text-slate-grey">Verifying your access...</p>
          </div>
        )}

        {status === 'success' && (
          <div>
            <div className="text-green-500 text-4xl mb-4">✓</div>
            <p className="text-slate-grey font-semibold">{message}</p>
            <p className="text-sm text-slate-grey mt-2">
              If WhatsApp doesn&apos;t open automatically, check your downloads or app store.
            </p>
          </div>
        )}

        {status === 'error' && (
          <div>
            <div className="text-red-500 text-4xl mb-4">✗</div>
            <p className="text-slate-grey font-semibold mb-4">{message}</p>
            <div className="text-left bg-yellow-50 p-4 rounded-lg">
              <h3 className="font-semibold text-amber-800 mb-2">Alternative: Use Verification Code</h3>
              <p className="text-sm text-amber-700 mb-2">
                Go to: <a href="/whatsapp-verify" className="underline text-umhc-green">umhc.org.uk/whatsapp-verify</a>
              </p>
              <p className="text-sm text-amber-700">
                Enter the 6-digit code from your email.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}