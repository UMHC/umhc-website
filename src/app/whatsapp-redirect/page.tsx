'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

function WhatsAppRedirectContent() {
  const [status, setStatus] = useState<'loading' | 'redirecting' | 'error'>('loading');
  const [countdown, setCountdown] = useState(3);
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const token = searchParams.get('t');
    
    if (!token) {
      setStatus('error');
      return;
    }

    // Verify token and get redirect URL via secure API
    const verifyAndRedirect = async () => {
      try {
        const response = await fetch(`/api/whatsapp-redirect/${token}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ timestamp: Date.now() }),
        });

        if (!response.ok) {
          throw new Error('Invalid token');
        }

        const data = await response.json();
        
        if (data.encodedUrl) {
          // Decode the base64 encoded URL client-side
          const decodedUrl = atob(data.encodedUrl);
          setStatus('redirecting');
          
          // Start countdown
          let count = 3;
          const countdownInterval = setInterval(() => {
            count--;
            setCountdown(count);
            
            if (count === 0) {
              clearInterval(countdownInterval);
              // Use window.location to avoid Next.js router interference
              window.location.href = decodedUrl;
            }
          }, 1000);
        } else {
          setStatus('error');
        }
      } catch (error) {
        console.error('Redirect verification failed:', error);
        setStatus('error');
        router.push('/verification-failed');
      }
    };

    verifyAndRedirect();
  }, [searchParams, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-whellow flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-umhc-green mx-auto mb-4"></div>
          <h1 className="text-2xl font-semibold text-umhc-green mb-2">Verifying Access</h1>
          <p className="text-slate-grey">Please wait while we verify your access token...</p>
        </div>
      </div>
    );
  }

  if (status === 'redirecting') {
    return (
      <div className="min-h-screen bg-whellow flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-6">
          <div className="mb-6">
            <div className="w-16 h-16 bg-umhc-green rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24" role="img" aria-label="WhatsApp verified">
                <title>WhatsApp verified</title>
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.479 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
              </svg>
            </div>
          </div>
          <h1 className="text-2xl font-semibold text-umhc-green mb-4">Access Verified!</h1>
          <p className="text-slate-grey mb-4">
            You&apos;re being redirected to the UMHC WhatsApp group in <span className="font-bold text-umhc-green">{countdown}</span> seconds...
          </p>
          <p className="text-sm text-slate-grey">
            Welcome to the UMHC community! 🏔️
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-whellow flex items-center justify-center">
      <div className="text-center max-w-md mx-auto px-6">
        <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" role="img" aria-label="Access denied">
            <title>Access denied</title>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <h1 className="text-2xl font-semibold text-red-600 mb-2">Access Denied</h1>
        <p className="text-slate-grey">Your access token is invalid or has expired.</p>
      </div>
    </div>
  );
}

export default function WhatsAppRedirectPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-whellow flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-umhc-green mx-auto mb-4"></div>
          <h1 className="text-2xl font-semibold text-umhc-green mb-2">Loading...</h1>
          <p className="text-slate-grey">Please wait...</p>
        </div>
      </div>
    }>
      <WhatsAppRedirectContent />
    </Suspense>
  );
}