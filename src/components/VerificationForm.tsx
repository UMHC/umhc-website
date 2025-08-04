'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Button from './Button';
import Image from 'next/image';

interface Question {
  question: string;
  options: string[];
  correct: number;
}

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

export default function VerificationForm({ onSuccess }: VerificationFormProps) {
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(-1);
  const [phone, setPhone] = useState('');
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [turnstileToken, setTurnstileToken] = useState<string>('');
  const [turnstileWidgetId, setTurnstileWidgetId] = useState<string>('');
  const [timerSeconds, setTimerSeconds] = useState(15);
  const [isTimerActive, setIsTimerActive] = useState(true);
  const [error, setError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [turnstileLoaded, setTurnstileLoaded] = useState(false);


  // Load questions from JSON file
  const loadQuestions = useCallback(async () => {
    try {
      const response = await fetch('/questions.json');
      if (!response.ok) throw new Error('Failed to load questions');
      const questionsData: Question[] = await response.json();
      
      // Load a random question directly without dependency loop
      if (questionsData.length > 0) {
        const randomIndex = Math.floor(Math.random() * questionsData.length);
        setCurrentQuestion(questionsData[randomIndex]);
        setCurrentQuestionIndex(randomIndex);
        setSelectedAnswer('');
        setError('');
        // Reset timer when loading a new question
        setTimerSeconds(15);
        setIsTimerActive(true);
      }
    } catch {
      setError('Failed to load verification questions. Please refresh the page.');
    }
  }, []);

  // Phone number validation
  const validatePhoneNumber = (phoneNumber: string) => {
    const cleaned = phoneNumber.replace(/[^\d+]/g, '');
    
    if (!cleaned.startsWith('+44')) {
      return { valid: false, message: 'Phone number must start with +44 (UK)' };
    }
    
    const withoutCountryCode = cleaned.substring(3);
    
    if (!withoutCountryCode.match(/^7\d{9}$/)) {
      return { valid: false, message: 'Please enter a valid UK mobile number (+44 7*** *** ***)' };
    }
    
    return { valid: true };
  };

  // Format phone number for display
  const formatPhoneNumber = (value: string) => {
    let cleaned = value.replace(/[^\d+]/g, '');
    
    // Auto-add +44 if user starts typing without it
    if (cleaned.length > 0 && !cleaned.startsWith('+')) {
      if (cleaned.startsWith('44')) {
        cleaned = '+' + cleaned;
      } else if (cleaned.startsWith('7')) {
        cleaned = '+44' + cleaned;
      } else {
        cleaned = '+44' + cleaned;
      }
    }
    
    // Format: Country code + space + remaining digits
    // Find where country code ends (after +XX or +XXX)
    if (cleaned.startsWith('+')) {
      // Extract country code and remaining digits
      let countryCode = '';
      let remainingDigits = '';
      
      // Common country codes (1-4 digits after +)
      if (cleaned.length > 1) {
        for (let i = 2; i <= 5 && i <= cleaned.length; i++) {
          const potentialCode = cleaned.substring(0, i);
          const remaining = cleaned.substring(i);
          
          // For UK (+44), we know it's valid
          if (potentialCode === '+44' || 
              // Other common country codes
              potentialCode === '+1' || potentialCode === '+33' || 
              potentialCode === '+49' || potentialCode === '+39' ||
              // Or if we have a reasonable length code
              (i >= 3 && remaining.length >= 6)) {
            countryCode = potentialCode;
            remainingDigits = remaining;
            break;
          }
        }
        
        // Default to assuming everything after +XX is the number
        if (!countryCode && cleaned.length > 3) {
          countryCode = cleaned.substring(0, 3);
          remainingDigits = cleaned.substring(3);
        } else if (!countryCode) {
          return cleaned; // Still typing country code
        }
        
        return remainingDigits ? `${countryCode} ${remainingDigits}` : countryCode;
      }
    }
    
    return cleaned;
  };

  // Timer functionality
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isTimerActive && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds(prev => prev - 1);
      }, 1000);
    } else if (timerSeconds <= 0) {
      setIsTimerActive(false);
    }
    
    return () => clearInterval(interval);
  }, [isTimerActive, timerSeconds]);

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
      setTimerSeconds(15);
      setIsTimerActive(true);
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
            setTimerSeconds(15);
            setIsTimerActive(true);
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

  // Initialize component
  useEffect(() => {
    loadQuestions();
  }, [loadQuestions]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    
    // Validate phone number
    const phoneValidation = validatePhoneNumber(phone);
    if (!phoneValidation.valid) {
      setError(phoneValidation.message || 'Invalid phone number');
      return;
    }
    
    // Check if question is answered
    if (!selectedAnswer) {
      setError('Please answer the verification question.');
      return;
    }
    
    // Check if answer is correct - redirect immediately on wrong answer
    if (currentQuestion && parseInt(selectedAnswer) !== currentQuestion.correct) {
      // Immediate redirect to bot detection page on wrong answer
      window.location.href = '/verification-failed';
      return;
    }
    
    // Check if Turnstile is completed
    if (!turnstileToken) {
      setError('Please complete the security verification.');
      return;
    }
    
    setIsSubmitting(true);
    setError('');
    
    try {
      // Get honeypot field value
      const websiteField = document.querySelector('input[name="website"]') as HTMLInputElement;
      const websiteValue = websiteField?.value || '';
      
      const response = await fetch('/api/whatsapp-verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone,
          answer: selectedAnswer,
          questionId: currentQuestionIndex,
          turnstileToken,
          website: websiteValue,
        }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        // Immediate redirect to WhatsApp on success
        if (onSuccess) {
          onSuccess(data.whatsappLink);
        } else {
          window.location.href = data.whatsappLink;
        }
      } else {
        throw new Error(data.error || 'Verification failed');
      }
      
    } catch {
      // On server/network errors, redirect to verification failed page
      window.location.href = '/verification-failed';
    } finally {
      setIsSubmitting(false);
    }
  };

  const canSubmit = !isTimerActive && turnstileToken && !isSubmitting;
  
  
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
            className="mx-auto w-full max-w-[280px] sm:max-w-[350px] md:max-w-[410px] h-auto"
            priority
            sizes="(max-width: 640px) 280px, (max-width: 768px) 350px, 410px"
          />
        </div>
        
        {/* Title and Subtitle */}
        <div className="text-center w-full">
          <h1 className="font-sans font-semibold text-3xl sm:text-4xl md:text-5xl text-deep-black mb-3 sm:mb-4 leading-tight">
            Hold on a sec...
          </h1>
          <p className="font-sans font-medium text-lg sm:text-xl text-deep-black px-2">
            We need to complete a couple of checks to verify you&apos;re not a bot. We&apos;ll be quick and won&apos;t store your responses outside of this session.
          </p>
        </div>
      </div>

      {/* Form Section */}
      <form 
        onSubmit={handleSubmit} 
        className="flex flex-col gap-8 sm:gap-10 md:gap-12 w-full max-w-xs sm:max-w-sm md:max-w-lg"
        role="form"
        aria-label="WhatsApp human verification form"
      >
        {/* Phone Number Input */}
        <div className="flex flex-col gap-1 w-full">
          <label htmlFor="phone" className="font-sans font-medium text-sm text-deep-black">
            Phone Number
          </label>
          <input
            type="tel"
            id="phone"
            value={phone}
            onChange={(e) => setPhone(formatPhoneNumber(e.target.value))}
            placeholder="+44 7*** *** ***"
            required
            className="w-full h-12 sm:h-14 md:h-15 px-3 sm:px-4 py-3 sm:py-4 bg-cream-white border-2 border-gray-200 rounded-lg focus:border-umhc-green focus:outline-none transition-colors font-sans text-sm sm:text-base"
            aria-describedby="phone-help"
          />
          <p id="phone-help" className="text-xs sm:text-sm text-slate-grey mt-1 font-sans">
            Enter your UK mobile number starting with +44
          </p>
        </div>

        {/* Question Section */}
        {currentQuestion && (
          <fieldset className="flex flex-col gap-4 sm:gap-6 items-center w-full">
            <legend className="font-sans font-medium text-base sm:text-lg text-deep-black text-center px-2 leading-relaxed">
              {currentQuestion.question}
            </legend>
            
            {/* Answer Options */}
            <div 
              className="flex flex-col gap-1 sm:gap-2 w-full" 
              role="radiogroup" 
              aria-labelledby="question-legend"
            >
              {currentQuestion.options.map((option, index) => (
                <label
                  key={index}
                  className="flex items-start gap-2 sm:gap-3 cursor-pointer hover:bg-whellow p-1.5 sm:p-2 rounded-md transition-colors focus-within:ring-2 focus-within:ring-umhc-green focus-within:ring-offset-2"
                >
                  <div className="w-4 h-4 flex-shrink-0">
                    <input
                      type="radio"
                      name="answer"
                      value={index.toString()}
                      checked={selectedAnswer === index.toString()}
                      onChange={(e) => setSelectedAnswer(e.target.value)}
                      className="w-4 h-4 text-umhc-green focus:ring-umhc-green border-gray-300"
                      aria-describedby={`option-${index}-desc`}
                    />
                  </div>
                  <span 
                    className="font-sans font-medium text-sm sm:text-base text-deep-black leading-relaxed"
                    id={`option-${index}-desc`}
                  >
                    {option}
                  </span>
                </label>
              ))}
            </div>
          </fieldset>
        )}

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

        {/* Timer */}
        {isTimerActive && (
          <div 
            className="text-center text-earth-orange font-semibold text-xs sm:text-sm font-sans px-2"
            role="status"
            aria-live="polite"
            aria-atomic="true"
          >
            Continue button will be available in {timerSeconds} seconds...
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div 
            className="bg-red-50 border border-red-200 text-red-700 px-3 sm:px-4 py-2 sm:py-3 rounded-md text-xs sm:text-sm font-sans leading-relaxed"
            role="alert"
            aria-live="assertive"
          >
            {error}
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
            {!canSubmit && isTimerActive ? 'Button will be enabled after timer completes' : 
             !canSubmit && !turnstileToken ? 'Complete security verification to enable button' :
             'Submit the form to join WhatsApp group'}
          </div>
        </div>

      </form>
    </div>
  );
}