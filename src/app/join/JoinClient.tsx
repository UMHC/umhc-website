'use client';

import React, { useState, useEffect } from 'react';
import Button from '@/components/Button';
import Image from 'next/image';
import { CheckCircleIcon, ExclamationTriangleIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

export default function JoinClient() {
  const [token, setToken] = useState<string>('');
  const [status, setStatus] = useState<'loading' | 'ready' | 'joining' | 'success' | 'error' | 'invalid'>('loading');
  const [error, setError] = useState<string>('');
  const [whatsappLink, setWhatsappLink] = useState<string>('');

  // Extract token from URL fragment (SafeLinks compatible)
  useEffect(() => {
    const fragment = window.location.hash.substring(1); // Remove #
    if (fragment && fragment.length > 0) {
      setToken(fragment);
      setStatus('ready');
    } else {
      setStatus('invalid');
      setError('No verification token found in URL. Please check your email for the correct link.');
    }
  }, []);

  // Verify token and get WhatsApp link
  const handleJoinGroup = async () => {
    if (!token) {
      setError('Invalid token');
      return;
    }

    setStatus('joining');
    setError('');

    try {
      const response = await fetch('/api/join', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setWhatsappLink(data.whatsappLink);
        setStatus('success');

        // Automatically redirect to WhatsApp after a short delay
        setTimeout(() => {
          window.location.href = data.whatsappLink;
        }, 2000);
      } else {
        setStatus('error');
        setError(data.error || 'Failed to verify token');
      }
    } catch {
      setStatus('error');
      setError('Network error. Please check your connection and try again.');
    }
  };

  // Retry with the same token
  const handleRetry = () => {
    setStatus('ready');
    setError('');
  };

  const renderContent = () => {
    switch (status) {
      case 'loading':
        return (
          <div className="flex flex-col items-center gap-4">
            <ArrowPathIcon className="w-8 h-8 text-umhc-green animate-spin" />
            <p className="text-slate-grey font-sans">Loading verification...</p>
          </div>
        );

      case 'invalid':
        return (
          <div className="flex flex-col items-center gap-6">
            <ExclamationTriangleIcon className="w-16 h-16 text-earth-orange" />
            <div className="text-center">
              <h1 className="font-sans font-semibold text-3xl sm:text-4xl text-deep-black mb-4">
                Invalid Link
              </h1>
              <p className="font-sans text-base sm:text-lg text-slate-grey mb-4">
                {error}
              </p>
              <p className="font-sans text-sm text-slate-grey">
                Need access? Visit{' '}
                <a href="/whatsapp" className="text-umhc-green hover:underline font-medium">
                  umhc.org.uk/whatsapp
                </a>{' '}
                to request a new verification link.
              </p>
            </div>
          </div>
        );

      case 'ready':
        return (
          <div className="flex flex-col items-center gap-6">
            <div className="mb-4">
              <Image
                src="/images/bot-gate-illustration.webp"
                alt="Illustration of a wooden gate surrounded by evergreen trees"
                width={300}
                height={200}
                className="mx-auto w-full max-w-[250px] sm:max-w-[300px]"
                style={{ width: "auto", height: "auto" }}
                priority
                sizes="(max-width: 640px) 250px, 300px"
              />
            </div>

            <div className="text-center">
              <h1 className="font-sans font-semibold text-3xl sm:text-4xl text-deep-black mb-4">
                Ready to Join!
              </h1>
              <p className="font-sans text-base sm:text-lg text-slate-grey mb-6 px-2">
                Your verification token has been confirmed. Click the button below to join the UMHC WhatsApp group.
              </p>
            </div>

            <Button
              onClick={handleJoinGroup}
              className="px-8 py-3 text-lg"
              aria-describedby="join-help"
            >
              Join WhatsApp Group
            </Button>

            <div id="join-help" className="sr-only">
              Clicking this button will redirect you to the WhatsApp group chat
            </div>

            {error && (
              <div
                className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm font-sans leading-relaxed text-center max-w-md"
                role="alert"
                aria-live="assertive"
              >
                {error}
              </div>
            )}
          </div>
        );

      case 'joining':
        return (
          <div className="flex flex-col items-center gap-4">
            <ArrowPathIcon className="w-8 h-8 text-umhc-green animate-spin" />
            <div className="text-center">
              <h1 className="font-sans font-semibold text-2xl sm:text-3xl text-deep-black mb-2">
                Joining Group...
              </h1>
              <p className="text-slate-grey font-sans">Verifying your access and getting the group link...</p>
            </div>
          </div>
        );

      case 'success':
        return (
          <div className="flex flex-col items-center gap-6">
            <CheckCircleIcon className="w-16 h-16 text-green-600" />
            <div className="text-center">
              <h1 className="font-sans font-semibold text-3xl sm:text-4xl text-deep-black mb-4">
                Success!
              </h1>
              <p className="font-sans text-base sm:text-lg text-slate-grey mb-6">
                You&apos;re being redirected to the WhatsApp group...
              </p>

              {whatsappLink && (
                <div className="space-y-3">
                  <p className="font-sans text-sm text-slate-grey">
                    If you&apos;re not redirected automatically:
                  </p>
                  <a
                    href={whatsappLink}
                    className="inline-block bg-umhc-green text-white px-6 py-2 rounded-lg font-medium hover:bg-stealth-green transition-colors"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Open WhatsApp Group
                  </a>
                </div>
              )}
            </div>
          </div>
        );

      case 'error':
        return (
          <div className="flex flex-col items-center gap-6">
            <ExclamationTriangleIcon className="w-16 h-16 text-earth-orange" />
            <div className="text-center">
              <h1 className="font-sans font-semibold text-3xl sm:text-4xl text-deep-black mb-4">
                Verification Failed
              </h1>
              <p className="font-sans text-base sm:text-lg text-slate-grey mb-6">
                {error}
              </p>

              <div className="space-y-3">
                <Button
                  onClick={handleRetry}
                  className="px-6 py-2 text-base"
                >
                  Try Again
                </Button>

                <p className="font-sans text-sm text-slate-grey">
                  Still having trouble? Contact us or request a new verification link at{' '}
                  <a href="/whatsapp" className="text-umhc-green hover:underline font-medium">
                    umhc.org.uk/whatsapp
                  </a>
                </p>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col gap-6 sm:gap-8 items-center justify-center w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-2xl mx-auto text-center">
      {renderContent()}
    </div>
  );
}