'use client';

import React, { useState, useEffect } from 'react';
import Button from './Button';
import Image from 'next/image';
import { isValidPhoneNumber } from 'libphonenumber-js';

interface VerificationFormProps {
  onSuccess?: (whatsappLink: string) => void;
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

export default function VerificationForm({}: VerificationFormProps) {
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
    
    if (!emailAddress.toLowerCase().endsWith('.ac.uk')) {
      return { 
        valid: false, 
        message: `Due to lots of trouble with bots last year, automatic access to our WhatsApp community is restricted to users with access to a '.ac.uk' email address. You can manually request access to our WhatsApp community via the manual request form and a member of the Committee will approve it as soon as possible.`,
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
    // Check if script already exists
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
      // Wait a bit for the API to be available
      setTimeout(() => {
        if (window.turnstile) {
          setTurnstileLoaded(true);
        } else if (process.env.NODE_ENV === 'development') {
          console.error('Turnstile API not available after script load');
        }
      }, 100);
    };
    
    script.onerror = (error) => {
      if (process.env.NODE_ENV === 'development') {
        console.error('Failed to load Turnstile script:', error);
      }
      setError('Failed to load security verification. Please refresh the page.');
    };
    
    // Set up global callbacks
    window.onTurnstileSuccess = (token: string) => {
      setTurnstileToken(token);
      setError(''); // Clear any previous errors
    };
    
    window.onTurnstileError = () => {
      // Check current token state (get fresh value)
      const currentToken = document.querySelector('input[name="cf-turnstile-response"]') as HTMLInputElement;
      if (currentToken && currentToken.value) {
        return;
      }
      
      setTurnstileToken('');
      setError('Security verification failed. Please try again.');
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
      // Check if container exists
      const container = document.getElementById('turnstile-container');
      if (!container) {
        if (process.env.NODE_ENV === 'development') {
          console.error('Turnstile container not found');
        }
        return;
      }
      
      try {
        const widgetId = window.turnstile.render(container, {
          sitekey: '0x4AAAAAABjQtmXdSHD15CPT',
          theme: 'light',
          callback: (token: string) => {
            setTurnstileToken(token);
            setError(''); // Clear any previous errors
          },
          'error-callback': () => {
            // Check if we have a valid token in DOM (fresh check)
            const currentToken = document.querySelector('input[name="cf-turnstile-response"]') as HTMLInputElement;
            if (currentToken && currentToken.value) {
              return;
            }
            
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
      } catch (renderError) {
        if (process.env.NODE_ENV === 'development') {
          console.error('Error rendering Turnstile widget:', renderError);
        }
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
      
      const response = await fetch('/api/whatsapp', {
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
        setSuccess('Success! A verification link has been sent to your university email address. Please check your inbox and click the link to join the WhatsApp group.');
      } else {
        if (data.error?.includes('.ac.uk')) {
          setError(data.error);
        } else {
          throw new Error(data.error || 'Verification failed');
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
  
  // Fallback polling mechanism to detect completed Turnstile
  useEffect(() => {
    if (!turnstileToken && turnstileWidgetId) {
      const pollInterval = setInterval(() => {
        // Check if widget shows as completed
        const widget = document.querySelector(`[data-widget-id="${turnstileWidgetId}"]`) || 
                      document.querySelector('.cf-turnstile');
        
        if (widget) {
          // Look for success indicators in the widget
          const successElement = widget.querySelector('.mark') || 
                                 widget.querySelector('[data-state="success"]') ||
                                 widget.querySelector('.success');
          
          if (successElement) {
            // Try to extract token from widget or use a placeholder
            const hiddenInput = widget.querySelector('input[type="hidden"]') as HTMLInputElement;
            if (hiddenInput && hiddenInput.value) {
              setTurnstileToken(hiddenInput.value);
              clearInterval(pollInterval);
            }
          }
        }
      }, 1000);
      
      // Clean up after 30 seconds
      setTimeout(() => {
        clearInterval(pollInterval);
      }, 30000);
      
      return () => clearInterval(pollInterval);
    }
  }, [turnstileToken, turnstileWidgetId]);

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
            Hold on a sec...
          </h1>
            <p className="font-sans font-medium text-base sm:text-lg text-deep-black px-2">
            We had a lot of trouble with bots last year, therefore, this year we&apos;re only automatically sharing access to our Whatsapp community with users who have a university email address ending in <code className="font-mono bg-gray-100 px-1 rounded">.ac.uk</code>. If you don&apos;t have access to a university email address, you can request access via the <a href="/whatsapp-request" className="font-medium text-umhc-green hover:underline">manual request form</a> and a member of the Committee will approve it as soon as possible.
            </p>
        </div>
      </div>

      {/* Form Section */}
      <form 
        onSubmit={handleSubmit} 
        className="flex flex-col gap-4 sm:gap-5 md:gap-6 w-full max-w-xs sm:max-w-sm md:max-w-lg"
        role="form"
        aria-label="WhatsApp human verification form"
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
            Enter your phone number with country code (e.g., +44 for UK, +1 for US)
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
            {/* Turnstile widget will render here */}
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
            {isAcUkDomain(userEmail) && error.includes('request access') ? (
              <>
                Due to lots of trouble with bots last year, automatic access to our WhatsApp community is restricted to users with access to a &apos;.ac.uk&apos; email address. You can manually request access to our WhatsApp community at{' '}
                <a href="/whatsapp-request" className="text-umhc-green underline hover:text-stealth-green">
                  this link
                </a>
                {' '}and a member of the Committee will approve it as soon as possible.
              </>
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
            {isSubmitting ? 'Verifying...' : 'Continue'}
          </Button>
          <div id="submit-help" className="sr-only">
            {!canSubmit && !turnstileToken ? 'Complete security verification to enable button' :
             'Submit the form to receive WhatsApp access link via email'}
          </div>
        </div>

      </form>
    </div>
  );
// Add helper function inside component, before return
function isAcUkDomain(email: string): boolean {
  if (!email || typeof email !== 'string') return false;
  const parts = email.split('@');
  if (parts.length !== 2) return false;
  const domain = parts[1].toLowerCase();
  return domain === 'ac.uk' || domain.endsWith('.ac.uk');
}

}