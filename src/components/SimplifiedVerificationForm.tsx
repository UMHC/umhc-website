'use client';

import React, { useState, useEffect } from 'react';
import Button from './Button';
import Image from 'next/image';
import { isValidPhoneNumber } from 'libphonenumber-js';

interface TurnstileOptions {
  sitekey: string;
  theme?: 'light' | 'dark' | 'auto';
  callback: (token: string) => void;
  'error-callback': () => void;
  'expired-callback'?: () => void;
  'timeout-callback'?: () => void;
}

declare global {
  interface Window {
    turnstile?: {
      render: (container: string | HTMLElement, options: TurnstileOptions) => string;
      reset: (widgetId?: string) => void;
    };
  }
}

export default function SimplifiedVerificationForm() {
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [turnstileToken, setTurnstileToken] = useState<string>('');
  const [turnstileWidgetId, setTurnstileWidgetId] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [turnstileLoaded, setTurnstileLoaded] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  // Email validation for .ac.uk domains
  const validateEmail = (emailAddress: string) => {
    if (!emailAddress.trim()) {
      return { valid: false, message: 'University email address is required' };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailAddress)) {
      return { valid: false, message: 'Please enter a valid email address' };
    }

    // Parse email to check domain
    const emailParts = emailAddress.toLowerCase().split('@');
    if (emailParts.length !== 2) {
      return { valid: false, message: 'Please enter a valid email address' };
    }

    const domain = emailParts[1];
    // Check if domain is exactly 'ac.uk' or ends with '.ac.uk'
    if (domain !== 'ac.uk' && !domain.endsWith('.ac.uk')) {
      return {
        valid: false,
        message: `Due to security concerns, automatic access is restricted to users with '.ac.uk' email addresses. You can request manual access via the manual request form and a committee member will approve it.`,
        showLink: true
      };
    }

    return { valid: true };
  };

  // Phone number validation
  const validatePhoneNumber = (phoneNumber: string) => {
    try {
      if (!phoneNumber.trim()) {
        return { valid: false, message: 'Phone number is required' };
      }

      const isValid = isValidPhoneNumber(phoneNumber);
      if (!isValid) {
        return { valid: false, message: 'Please enter a valid phone number with country code (e.g., +44 7123 456 789)' };
      }

      return { valid: true };
    } catch {
      return { valid: false, message: 'Please enter a valid phone number with country code' };
    }
  };

  // Load Turnstile script and initialize
  useEffect(() => {
    if (document.querySelector('script[src*="turnstile"]')) {
      if (window.turnstile) {
        setTurnstileLoaded(true);
        return;
      }
    }

    const script = document.createElement('script');
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
    script.async = true;
    script.defer = true;

    script.onload = () => {
      setTimeout(() => {
        if (window.turnstile) {
          setTurnstileLoaded(true);
        }
      }, 100);
    };

    script.onerror = () => {
      setError('Failed to load security verification. Please refresh the page.');
    };

    document.head.appendChild(script);

    return () => {
      try {
        if (document.head.contains(script)) {
          document.head.removeChild(script);
        }
      } catch {
        // Ignore cleanup errors
      }
    };
  }, []);

  // Render Turnstile when loaded
  useEffect(() => {
    if (turnstileLoaded && window.turnstile && !turnstileWidgetId) {
      const container = document.getElementById('turnstile-container');
      if (!container) return;

      try {
        const widgetId = window.turnstile.render(container, {
          sitekey: '0x4AAAAAABjQtmXdSHD15CPT',
          theme: 'light',
          callback: (token: string) => {
            setTurnstileToken(token);
            setError('');
          },
          'error-callback': () => {
            setTurnstileToken('');
            setError('Security verification failed. Please try again.');
          },
          'expired-callback': () => {
            setTurnstileToken('');
            setError('Security verification expired. Please try again.');
          },
          'timeout-callback': () => {
            setError('Security verification timed out. Please try again.');
          },
        });

        setTurnstileWidgetId(widgetId);
      } catch {
        setError('Failed to initialize security verification. Please refresh the page.');
      }
    }
  }, [turnstileLoaded, turnstileWidgetId]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate email address
    const emailValidation = validateEmail(email);
    if (!emailValidation.valid) {
      setError(emailValidation.message || 'Invalid email address');
      return;
    }

    // Validate phone number
    const phoneValidation = validatePhoneNumber(phone);
    if (!phoneValidation.valid) {
      setError(phoneValidation.message || 'Invalid phone number');
      return;
    }

    // Check if terms are accepted
    if (!termsAccepted) {
      setError('You must agree to the Terms of Service and Privacy Policy to continue.');
      return;
    }

    // Check if Turnstile is completed
    if (!turnstileToken) {
      setError('Please complete the security verification.');
      return;
    }

    setIsSubmitting(true);
    setError('');
    setSuccess('');

    try {
      // Get honeypot field value
      const websiteField = document.querySelector('input[name="website"]') as HTMLInputElement;
      const websiteValue = websiteField?.value || '';

      const response = await fetch('/api/whatsapp-simplified', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          phone,
          turnstileToken,
          website: websiteValue,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setError('');
        setSuccess('Success! A verification link has been sent to your university email address. Check your inbox and click the link to join the WhatsApp group.');

        // Clear form after successful submission
        setEmail('');
        setPhone('');
        setTurnstileToken('');
        setTermsAccepted(false);

        // Reset Turnstile widget
        if (window.turnstile && turnstileWidgetId) {
          window.turnstile.reset(turnstileWidgetId);
        }
      } else {
        setError(data.error || 'Verification failed');

        // Only reset Turnstile if it's not a rate limiting error (status 429 or 503)
        // Rate limiting errors should keep the error message visible
        if (response.status !== 429 && response.status !== 503) {
          setTurnstileToken('');
          if (window.turnstile && turnstileWidgetId) {
            window.turnstile.reset(turnstileWidgetId);
          }
        }
      }

    } catch {
      setError('Verification failed. Please check your details and try again.');
      setSuccess('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const canSubmit = turnstileToken && termsAccepted && !isSubmitting;

  return (
    <div className="flex flex-col gap-6 sm:gap-8 items-center justify-start w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-2xl mx-auto">
      {/* Honeypot field */}
      <input
        type="text"
        name="website"
        className="absolute -left-[9999px] opacity-0"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
      />

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
            Join Our Community
          </h1>
          <p className="font-sans font-medium text-base sm:text-lg text-deep-black px-2">
            Enter your university email address to get instant access to our WhatsApp community.
            If you don&apos;t have a <code className="font-mono bg-gray-100 px-1 rounded">.ac.uk</code> email,
            you can <a href="/whatsapp-request" className="font-medium text-umhc-green hover:underline">request access manually</a>.
          </p>
        </div>
      </div>

      {/* Form Section */}
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-4 sm:gap-5 md:gap-6 w-full max-w-xs sm:max-w-sm md:max-w-lg"
        role="form"
        aria-label="WhatsApp verification form"
      >
        {/* University Email Input */}
        <div className="flex flex-col gap-1 w-full">
          <label htmlFor="email" className="font-sans font-medium text-sm text-deep-black">
            University Email Address
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your.name@student.manchester.ac.uk"
            required
            className="w-full h-12 sm:h-14 md:h-15 px-3 sm:px-4 py-3 sm:py-4 bg-cream-white border-2 border-gray-200 rounded-lg focus:border-umhc-green focus:outline-none transition-colors font-sans text-sm sm:text-base"
            aria-describedby="email-help"
          />
          <p id="email-help" className="text-xs sm:text-sm text-slate-grey mt-1 font-sans">
            Enter your university email address ending in .ac.uk
          </p>
        </div>

        {/* Phone Number Input */}
        <div className="flex flex-col gap-1 w-full">
          <label htmlFor="phone" className="font-sans font-medium text-sm text-deep-black">
            Phone Number
          </label>
          <input
            type="tel"
            id="phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+44 7123 456 789"
            required
            className="w-full h-12 sm:h-14 md:h-15 px-3 sm:px-4 py-3 sm:py-4 bg-cream-white border-2 border-gray-200 rounded-lg focus:border-umhc-green focus:outline-none transition-colors font-sans text-sm sm:text-base"
            aria-describedby="phone-help"
          />
          <p id="phone-help" className="text-xs sm:text-sm text-slate-grey mt-1 font-sans">
            Enter the phone number with the country code (e.g., +44 for UK, +1 for US) that you will be using to join the WhatsApp Community with. This helps us verify WhatsApp group members.
          </p>
        </div>

        {/* Terms and Conditions Checkbox */}
        <div className="flex flex-col gap-2 w-full">
          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              id="terms"
              checked={termsAccepted}
              onChange={(e) => setTermsAccepted(e.target.checked)}
              required
              className="mt-1 w-4 h-4 text-umhc-green bg-cream-white border-2 border-gray-200 rounded focus:ring-umhc-green focus:ring-2 focus:border-umhc-green transition-colors"
            />
            <label htmlFor="terms" className="font-sans text-sm text-deep-black leading-relaxed">
              I agree to the{' '}
              <a
                href="/terms"
                target="_blank"
                rel="noopener noreferrer"
                className="text-umhc-green hover:text-stealth-green underline font-medium transition-colors"
              >
                Terms of Service and Privacy Policy
              </a>
              {' '}and understand that my personal data will be processed according to these terms.
            </label>
          </div>
        </div>

        {/* Turnstile */}
        <div className="flex flex-col items-center gap-2">
          <label htmlFor="turnstile-container" className="sr-only">
            Security verification challenge
          </label>
          <div
            id="turnstile-container"
            className="min-h-[78px] flex items-center justify-center"
            role="region"
            aria-label="Security verification widget"
            aria-live="polite"
          >
            {!turnstileLoaded && (
              <div className="text-slate-grey text-xs sm:text-sm font-sans" aria-live="polite">
                Loading security verification...
              </div>
            )}
            {turnstileLoaded && !turnstileWidgetId && (
              <div className="text-slate-grey text-xs sm:text-sm font-sans" aria-live="polite">
                Initializing verification widget...
              </div>
            )}
          </div>
        </div>

        {/* Success Message */}
        {success && (
          <div
            className="bg-green-50 border border-green-200 text-green-700 px-3 sm:px-4 py-2 sm:py-3 rounded-md text-xs sm:text-sm font-sans leading-relaxed"
            role="status"
            aria-live="polite"
          >
            {success}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div
            className="bg-red-50 border border-red-200 text-red-700 px-3 sm:px-4 py-2 sm:py-3 rounded-md text-xs sm:text-sm font-sans leading-relaxed"
            role="alert"
            aria-live="assertive"
          >
            {error.includes('manual request') ? (
              <>
                Due to security concerns, automatic access is restricted to users with &apos;.ac.uk&apos; email addresses. You can{' '}
                <a href="/whatsapp-request" className="text-umhc-green underline hover:text-stealth-green">
                  request access manually
                </a>
                {' '}and a committee member will approve it.
              </>
            ) : error.includes('whatsapp@umhc.org.uk') ? (
              // Handle duplicate detection errors with contact information
              <div>
                {error.split('whatsapp@umhc.org.uk').map((part, index, array) => (
                  <span key={index}>
                    {part}
                    {index < array.length - 1 && (
                      <a
                        href="mailto:whatsapp@umhc.org.uk"
                        className="text-umhc-green underline hover:text-stealth-green font-medium"
                      >
                        whatsapp@umhc.org.uk
                      </a>
                    )}
                  </span>
                ))}
              </div>
            ) : (
              error
            )}
          </div>
        )}

        {/* Continue Button */}
        <div className="flex justify-center">
          <Button
            type="submit"
            disabled={!canSubmit}
            className="px-6 sm:px-8 py-2 sm:py-3 text-base sm:text-lg"
            aria-describedby="submit-help"
          >
            {isSubmitting ? 'Sending...' : 'Get Access Link'}
          </Button>
          <div id="submit-help" className="sr-only">
            {!canSubmit && !turnstileToken ? 'Complete security verification to enable button' :
             'Submit the form to receive WhatsApp access link via email'}
          </div>
        </div>
      </form>
    </div>
  );
}