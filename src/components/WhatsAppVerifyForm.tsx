'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Button from './Button';
import Image from 'next/image';

function WhatsAppVerifyFormContent() {
  const [verificationCode, setVerificationCode] = useState('');
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const searchParams = useSearchParams();

  // Auto-fill code from URL parameter if present
  useEffect(() => {
    const codeFromUrl = searchParams.get('code');
    if (codeFromUrl && /^\d{6}$/.test(codeFromUrl)) {
      setVerificationCode(codeFromUrl);
    }
  }, [searchParams]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate verification code format
    if (!verificationCode.trim() || !/^\d{6}$/.test(verificationCode.trim())) {
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
          verificationCode: verificationCode.trim(),
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
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6); // Only digits, max 6
    setVerificationCode(value);
  };

  return (
    <div className="flex flex-col gap-6 sm:gap-8 items-center justify-start w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-2xl mx-auto">

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
            Enter Verification Code
          </h1>
          <p className="font-sans font-medium text-base sm:text-lg text-deep-black px-2 mb-4">
            Please enter the 6-digit code from your email to join the UMHC WhatsApp group.
          </p>
          <p className="font-sans text-sm text-slate-grey px-2">
            If the email link didn&apos;t work, you can manually enter your verification code here.
          </p>
        </div>
      </div>

      {/* Form Section */}
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-4 sm:gap-5 md:gap-6 w-full max-w-xs sm:max-w-sm md:max-w-lg"
        role="form"
        aria-label="WhatsApp verification code form"
      >
        {/* Verification Code Input */}
        <div className="flex flex-col gap-1 w-full">
          <label htmlFor="verificationCode" className="font-sans font-medium text-sm text-deep-black">
            Verification Code
          </label>
          <input
            type="text"
            id="verificationCode"
            value={verificationCode}
            onChange={handleCodeChange}
            placeholder="123456"
            required
            maxLength={6}
            className="w-full h-12 sm:h-14 md:h-15 px-3 sm:px-4 py-3 sm:py-4 bg-cream-white border-2 border-gray-200 rounded-lg focus:border-umhc-green focus:outline-none transition-colors font-sans text-sm sm:text-base text-center text-2xl font-mono letter-spacing-wider"
            aria-describedby="code-help"
          />
          <p id="code-help" className="text-xs sm:text-sm text-slate-grey mt-1 font-sans">
            Enter the 6-digit code from your email
          </p>
        </div>

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

        {/* Submit Button */}
        <div className="flex justify-center">
          <Button
            type="submit"
            disabled={!verificationCode || verificationCode.length !== 6 || isSubmitting}
            className="px-6 sm:px-8 py-2 sm:py-3 text-base sm:text-lg"
          >
            {isSubmitting ? 'Verifying...' : 'Verify Code'}
          </Button>
        </div>

        {/* Help Text */}
        <div className="text-center">
          <p className="text-xs sm:text-sm text-slate-grey font-sans">
            Didn&apos;t receive a code? <a href="/whatsapp" className="text-umhc-green hover:underline">Request a new one</a>
          </p>
        </div>
      </form>
    </div>
  );
}

export default function WhatsAppVerifyForm() {
  return (
    <Suspense fallback={
      <div className="flex flex-col gap-6 sm:gap-8 items-center justify-start w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-2xl mx-auto">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-umhc-green mx-auto mb-4"></div>
          <h1 className="text-2xl font-semibold text-umhc-green mb-2">Loading...</h1>
          <p className="text-slate-grey">Please wait...</p>
        </div>
      </div>
    }>
      <WhatsAppVerifyFormContent />
    </Suspense>
  );
}