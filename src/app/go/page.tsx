'use client';

import React, { useState, useEffect, Suspense, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';

function InstantVerifyContent() {
  const [verificationCode, setVerificationCode] = useState('');
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasProcessedUrl, setHasProcessedUrl] = useState(false);
  const searchParams = useSearchParams();

  // Handle form submission
  const handleSubmit = useCallback(async (code?: string) => {
    const codeToUse = code || verificationCode.trim();

    // Validate verification code format
    if (!codeToUse || !/^\d{6}$/.test(codeToUse)) {
      setError('Please enter a valid 6-digit verification code');
      return;
    }

    setIsSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/whatsapp-verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          verificationCode: codeToUse,
        }),
      });

      const data = await response.json();

      if (response.ok && data.whatsappUrl) {
        setSuccess('Code verified! Redirecting to WhatsApp...');
        // Redirect directly to WhatsApp
        setTimeout(() => {
          window.location.href = data.whatsappUrl;
        }, 1500);
      } else {
        setError(data.error || 'Verification failed. Please check your code and try again.');
      }

    } catch {
      setError('Verification failed. Please check your code and try again.');
    } finally {
      setIsSubmitting(false);
    }
  }, [verificationCode]);

  // Auto-fill code from URL parameter and auto-submit
  useEffect(() => {
    if (hasProcessedUrl) return; // Prevent multiple runs

    const codeFromUrl = searchParams.get('code');
    if (codeFromUrl && /^\d{6}$/.test(codeFromUrl)) {
      setVerificationCode(codeFromUrl);
      setHasProcessedUrl(true);

      // Auto-submit the form immediately
      handleSubmit(codeFromUrl);
    } else {
      setError('Invalid verification code in link');
      setHasProcessedUrl(true);
    }
  }, [searchParams, handleSubmit, hasProcessedUrl]);

  return (
    <div className="flex flex-col gap-6 sm:gap-8 items-center justify-start w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-2xl mx-auto min-h-screen bg-whellow p-4">

      {/* Header Section */}
      <div className="flex flex-col items-center justify-start w-full">
        {/* Gate Illustration */}
        <div className="mb-6 sm:mb-8">
          <Image
            src="/images/bot-gate-illustration.webp"
            alt="Illustration of a wooden gate surrounded by evergreen trees in a forest setting"
            width={410}
            height={273}
            className="mx-auto w-full max-w-[280px] sm:max-w-[350px] md:max-w-[410px]"
            style={{ width: "auto", height: "auto" }}
            priority
            sizes="(max-width: 640px) 280px, (max-width: 768px) 350px, 410px"
          />
        </div>

        {/* Title and Subtitle */}
        <div className="text-center w-full">
          <h1 className="font-sans font-semibold text-3xl sm:text-4xl md:text-5xl text-deep-black mb-3 sm:mb-4 leading-tight">
            Verifying Access
          </h1>
          <p className="font-sans font-medium text-base sm:text-lg text-deep-black px-2 mb-4">
            Please wait while we verify your access to the UMHC WhatsApp group.
          </p>
        </div>
      </div>

      {/* Hidden Form - Same as manual verification but auto-filled and auto-submitted */}
      <form style={{ display: 'none' }}>
        <input
          type="text"
          value={verificationCode}
          readOnly
        />
      </form>

      {/* Status Display */}
      <div className="w-full max-w-xs sm:max-w-sm md:max-w-lg">
        {/* Success Message */}
        {success && (
          <div
            className="bg-green-50 border border-green-200 text-green-700 px-3 sm:px-4 py-2 sm:py-3 rounded-md text-xs sm:text-sm font-sans leading-relaxed text-center"
            role="status"
            aria-live="polite"
          >
            {success}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div
            className="bg-red-50 border border-red-200 text-red-700 px-3 sm:px-4 py-2 sm:py-3 rounded-md text-xs sm:text-sm font-sans leading-relaxed text-center"
            role="alert"
            aria-live="assertive"
          >
            {error}
          </div>
        )}

        {/* Loading State */}
        {isSubmitting && !success && !error && (
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-umhc-green mx-auto mb-4"></div>
            <p className="text-slate-grey">Verifying your code...</p>
          </div>
        )}

        {/* Help Text */}
        {error && (
          <div className="text-center mt-4">
            <p className="text-xs sm:text-sm text-slate-grey font-sans">
              Having trouble? <a href="/whatsapp-verify" className="text-umhc-green hover:underline">Try manual verification</a>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function InstantVerifyPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-whellow flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-umhc-green mx-auto mb-4"></div>
          <h1 className="text-2xl font-semibold text-umhc-green mb-2">Loading...</h1>
          <p className="text-slate-grey">Please wait...</p>
        </div>
      </div>
    }>
      <InstantVerifyContent />
    </Suspense>
  );
}