'use client';

import React, { useState, useEffect } from 'react';
import Button from './Button';
import Image from 'next/image';
import { isValidPhoneNumber } from 'libphonenumber-js';

interface WomxnManualRequestFormProps {
  onSuccess?: () => void;
}

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
    onTurnstileLoad?: () => void;
    onTurnstileSuccess?: (token: string) => void;
    onTurnstileError?: () => void;
  }
}

export default function WomxnManualRequestForm({ onSuccess }: WomxnManualRequestFormProps) {
  const [firstName, setFirstName] = useState('');
  const [surname, setSurname] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [userType, setUserType] = useState('');
  const [trips, setTrips] = useState('');
  const [turnstileToken, setTurnstileToken] = useState<string>('');
  const [turnstileWidgetId, setTurnstileWidgetId] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [turnstileLoaded, setTurnstileLoaded] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  const validatePhoneNumber = (phoneNumber: string) => {
    try {
      if (!phoneNumber.trim()) return { valid: false, message: 'Phone number is required' };
      const isValid = isValidPhoneNumber(phoneNumber);
      if (!isValid) return { valid: false, message: 'Please enter a valid phone number with country code (e.g., +44 7123 456 789)' };
      return { valid: true };
    } catch {
      return { valid: false, message: 'Please enter a valid phone number with country code' };
    }
  };

  const validateEmail = (emailAddress: string) => {
    if (!emailAddress.trim()) return { valid: false, message: 'Email address is required' };
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailAddress)) return { valid: false, message: 'Please enter a valid email address' };
    return { valid: true };
  };

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
        if (window.turnstile) setTurnstileLoaded(true);
      }, 100);
    };

    script.onerror = () => {
      setError('Failed to load security verification. Please refresh the page.');
    };

    window.onTurnstileSuccess = (token: string) => {
      setTurnstileToken(token);
      setError('');
    };

    window.onTurnstileError = () => {
      const currentToken = document.querySelector('input[name="cf-turnstile-response"]') as HTMLInputElement;
      if (currentToken && currentToken.value) return;
      setTurnstileToken('');
      setError('Security verification failed. Please try again.');
    };

    document.head.appendChild(script);

    return () => {
      try {
        if (document.head.contains(script)) document.head.removeChild(script);
      } catch {
        // Ignore cleanup errors
      }
    };
  }, []);

  useEffect(() => {
    if (turnstileLoaded && window.turnstile && !turnstileWidgetId) {
      const container = document.getElementById('turnstile-container-womxn-req');
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
            const currentToken = document.querySelector('input[name="cf-turnstile-response"]') as HTMLInputElement;
            if (currentToken && currentToken.value) return;
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

  // Fallback polling to detect completed Turnstile
  useEffect(() => {
    if (!turnstileToken && turnstileWidgetId) {
      const pollInterval = setInterval(() => {
        const widget =
          document.querySelector(`[data-widget-id="${turnstileWidgetId}"]`) ||
          document.querySelector('.cf-turnstile');

        if (widget) {
          const successElement =
            widget.querySelector('.mark') ||
            widget.querySelector('[data-state="success"]') ||
            widget.querySelector('.success');

          if (successElement) {
            const hiddenInput = widget.querySelector('input[type="hidden"]') as HTMLInputElement;
            if (hiddenInput && hiddenInput.value) {
              setTurnstileToken(hiddenInput.value);
              clearInterval(pollInterval);
            }
          }
        }
      }, 1000);

      setTimeout(() => clearInterval(pollInterval), 30000);
      return () => clearInterval(pollInterval);
    }
  }, [turnstileToken, turnstileWidgetId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!firstName.trim()) { setError('First name is required'); return; }
    if (!surname.trim()) { setError('Surname is required'); return; }

    const phoneValidation = validatePhoneNumber(phone);
    if (!phoneValidation.valid) { setError(phoneValidation.message || 'Invalid phone number'); return; }

    const emailValidation = validateEmail(email);
    if (!emailValidation.valid) { setError(emailValidation.message || 'Invalid email address'); return; }

    if (!userType) { setError('Please select what you would consider yourself'); return; }

    if (!termsAccepted) {
      setError('You must agree to the Terms of Service and Privacy Policy to continue.');
      return;
    }

    if (!turnstileToken) { setError('Please complete the security verification.'); return; }

    setIsSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const websiteField = document.querySelector('input[name="website-womxn-req"]') as HTMLInputElement;
      const websiteValue = websiteField?.value || '';

      const response = await fetch('/api/womxn-whatsapp-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstName, surname, phone, email, userType, trips, turnstileToken, website: websiteValue }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Your request has been submitted successfully! A committee member will review your request and get back to you via email as soon as possible.');
        setError('');
        setFirstName('');
        setSurname('');
        setPhone('');
        setEmail('');
        setUserType('');
        setTrips('');
        setTurnstileToken('');
        setTermsAccepted(false);
        if (window.turnstile && turnstileWidgetId) {
          window.turnstile.reset(turnstileWidgetId);
        }
        if (onSuccess) onSuccess();
      } else {
        setError(data.error || 'Request submission failed');

        // Reset Turnstile token for non-rate-limit errors so user can retry cleanly.
        if (response.status !== 429) {
          setTurnstileToken('');
          if (window.turnstile && turnstileWidgetId) {
            window.turnstile.reset(turnstileWidgetId);
          }
        }
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Request submission failed. Please check your details and try again.';
      setError(message);
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
        name="website-womxn-req"
        className="absolute -left-[9999px] opacity-0"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
      />

      {/* Header Section */}
      <div className="flex flex-col items-center justify-start w-full">
        <div className="mb-6 sm:mb-8">
          <Image
            src="/images/bot-gate-illustration.webp"
            alt="Illustration of a wooden gate surrounded by evergreen trees in a forest setting"
            width={410}
            height={273}
            className="mx-auto w-full max-w-[280px] sm:max-w-[350px] md:max-w-[410px] h-auto"
            priority
            sizes="(max-width: 640px) 280px, (max-width: 768px) 350px, 410px"
          />
        </div>

        <div className="text-center w-full">
          <h1 className="font-sans font-semibold text-3xl sm:text-4xl md:text-5xl text-deep-black mb-3 sm:mb-4 leading-tight">
            Request Womxn WhatsApp Access
          </h1>
          <p className="font-sans font-medium text-lg sm:text-xl text-deep-black px-2">
            Please fill in your details below and a committee member will review your request to join the UMHC Womxn WhatsApp group.
          </p>
        </div>
      </div>

      {/* Form Section */}
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-4 sm:gap-5 md:gap-6 w-full max-w-xs sm:max-w-sm md:max-w-lg"
        role="form"
        aria-label="Womxn WhatsApp manual access request form"
      >
        {/* First Name */}
        <div className="flex flex-col gap-1 w-full">
          <label htmlFor="womxn-req-firstName" className="font-sans font-medium text-sm text-deep-black">
            First Name
          </label>
          <input
            type="text"
            id="womxn-req-firstName"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="John"
            required
            className="w-full h-12 sm:h-14 md:h-15 px-3 sm:px-4 py-3 sm:py-4 bg-cream-white border-2 border-gray-200 rounded-lg focus:border-umhc-green focus:outline-none transition-colors font-sans text-sm sm:text-base"
          />
        </div>

        {/* Surname */}
        <div className="flex flex-col gap-1 w-full">
          <label htmlFor="womxn-req-surname" className="font-sans font-medium text-sm text-deep-black">
            Surname
          </label>
          <input
            type="text"
            id="womxn-req-surname"
            value={surname}
            onChange={(e) => setSurname(e.target.value)}
            placeholder="Smith"
            required
            className="w-full h-12 sm:h-14 md:h-15 px-3 sm:px-4 py-3 sm:py-4 bg-cream-white border-2 border-gray-200 rounded-lg focus:border-umhc-green focus:outline-none transition-colors font-sans text-sm sm:text-base"
          />
        </div>

        {/* Email */}
        <div className="flex flex-col gap-1 w-full">
          <label htmlFor="womxn-req-email" className="font-sans font-medium text-sm text-deep-black">
            Email Address
          </label>
          <input
            type="email"
            id="womxn-req-email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your.email@example.com"
            required
            className="w-full h-12 sm:h-14 md:h-15 px-3 sm:px-4 py-3 sm:py-4 bg-cream-white border-2 border-gray-200 rounded-lg focus:border-umhc-green focus:outline-none transition-colors font-sans text-sm sm:text-base"
            aria-describedby="womxn-req-email-help"
          />
          <p id="womxn-req-email-help" className="text-xs sm:text-sm text-slate-grey mt-1 font-sans">
            We&apos;ll send the approval notification to this email address
          </p>
        </div>

        {/* Phone Number */}
        <div className="flex flex-col gap-1 w-full">
          <label htmlFor="womxn-req-phone" className="font-sans font-medium text-sm text-deep-black">
            Phone Number
          </label>
          <input
            type="tel"
            id="womxn-req-phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+44 7123 456 789"
            required
            className="w-full h-12 sm:h-14 md:h-15 px-3 sm:px-4 py-3 sm:py-4 bg-cream-white border-2 border-gray-200 rounded-lg focus:border-umhc-green focus:outline-none transition-colors font-sans text-sm sm:text-base"
            aria-describedby="womxn-req-phone-help"
          />
          <p id="womxn-req-phone-help" className="text-xs sm:text-sm text-slate-grey mt-1 font-sans">
            Enter the phone number with the country code (e.g., +44 for UK, +1 for US) that you will be using to join the WhatsApp group with.
          </p>
        </div>

        {/* User Type */}
        <div className="flex flex-col gap-1 w-full">
          <label htmlFor="womxn-req-userType" className="font-sans font-medium text-sm text-deep-black">
            What would you consider yourself?
          </label>
          <select
            id="womxn-req-userType"
            value={userType}
            onChange={(e) => setUserType(e.target.value)}
            required
            className="w-full h-12 sm:h-14 md:h-15 px-3 sm:px-4 py-3 sm:py-4 bg-cream-white border-2 border-gray-200 rounded-lg focus:border-umhc-green focus:outline-none transition-colors font-sans text-sm sm:text-base"
          >
            <option value="">Please select...</option>
            <option value="alumni">An alumni</option>
            <option value="public">A member of the public</option>
            <option value="incoming">An incoming student</option>
            <option value="other">Other</option>
          </select>
        </div>

        {/* Previous Trips */}
        <div className="flex flex-col gap-1 w-full">
          <label htmlFor="womxn-req-trips" className="font-sans font-medium text-sm text-deep-black">
            Please list any UMHC trips you have been on (optional)
          </label>
          <textarea
            id="womxn-req-trips"
            value={trips}
            onChange={(e) => setTrips(e.target.value)}
            placeholder="e.g., Peak District day hike in October 2024, Lake District weekend in September 2024..."
            rows={3}
            className="w-full px-3 sm:px-4 py-3 sm:py-4 bg-cream-white border-2 border-gray-200 rounded-lg focus:border-umhc-green focus:outline-none transition-colors font-sans text-sm sm:text-base resize-vertical min-h-[80px]"
            aria-describedby="womxn-req-trips-help"
          />
          <p id="womxn-req-trips-help" className="text-xs sm:text-sm text-slate-grey mt-1 font-sans">
            This helps us understand your experience with UMHC (leave blank if this is your first time)
          </p>
        </div>

        {/* Terms checkbox */}
        <div className="flex flex-col gap-2 w-full">
          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              id="womxn-req-terms"
              checked={termsAccepted}
              onChange={(e) => setTermsAccepted(e.target.checked)}
              required
              className="mt-1 w-4 h-4 text-umhc-green bg-cream-white border-2 border-gray-200 rounded focus:ring-umhc-green focus:ring-2 focus:border-umhc-green transition-colors"
            />
            <label htmlFor="womxn-req-terms" className="font-sans text-sm text-deep-black leading-relaxed">
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
          <label htmlFor="turnstile-container-womxn-req" className="sr-only">
            Security verification challenge
          </label>
          <div
            id="turnstile-container-womxn-req"
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
            {error.includes('whatsapp@umhc.org.uk') ? (
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

        {/* Submit Button */}
        <div className="flex justify-center">
          <Button
            type="submit"
            disabled={!canSubmit}
            className="px-6 sm:px-8 py-2 sm:py-3 text-base sm:text-lg"
            aria-describedby="womxn-req-submit-help"
          >
            {isSubmitting ? 'Submitting Request...' : 'Submit Request'}
          </Button>
          <div id="womxn-req-submit-help" className="sr-only">
            {!canSubmit && !turnstileToken
              ? 'Complete security verification to enable button'
              : 'Submit your Womxn WhatsApp manual access request'}
          </div>
        </div>
      </form>
    </div>
  );
}
