'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

const PrivacyPopup = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    // Check if user has already dismissed the popup
    const hasSeenPrivacyPopup = localStorage.getItem('umhc-privacy-dismissed');
    
    if (!hasSeenPrivacyPopup) {
      // Show popup after a short delay for smooth initial load
      const timer = setTimeout(() => {
        setIsVisible(true);
        // Add another delay for the animation
        setTimeout(() => {
          setIsAnimating(true);
        }, 50);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, []);

  const handleDismiss = () => {
    // Set expiration for 30 days (30 * 24 * 60 * 60 * 1000 milliseconds)
    const expirationDate = new Date();
    expirationDate.setTime(expirationDate.getTime() + (30 * 24 * 60 * 60 * 1000));
    
    localStorage.setItem('umhc-privacy-dismissed', JSON.stringify({
      dismissed: true,
      expiration: expirationDate.getTime()
    }));

    // Animate out
    setIsAnimating(false);
    setTimeout(() => {
      setIsVisible(false);
    }, 300);
  };

  // Check if dismissal has expired
  useEffect(() => {
    const dismissalData = localStorage.getItem('umhc-privacy-dismissed');
    if (dismissalData) {
      try {
        const parsed = JSON.parse(dismissalData);
        const now = new Date().getTime();
        
        if (parsed.expiration && now > parsed.expiration) {
          // Dismissal has expired, remove it and show popup
          localStorage.removeItem('umhc-privacy-dismissed');
          setIsVisible(true);
          setIsAnimating(true);
        }
      } catch {
        // If parsing fails, remove the item and show popup
        localStorage.removeItem('umhc-privacy-dismissed');
        setIsVisible(true);
        setIsAnimating(true);
      }
    }
  }, []);

  if (!isVisible) return null;

  return (
    <>
      {/* Popup */}
      <div
        className={`fixed bottom-4 left-4 right-4 sm:left-6 sm:right-auto sm:max-w-md 
          bg-whellow rounded-xl shadow-xl z-50 p-4 
          transform transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] origin-bottom-left
          ${isAnimating 
            ? 'translate-x-0 translate-y-0 opacity-100 scale-100' 
            : 'translate-x-4 translate-y-2 opacity-0 scale-75'
          }`}
        role="dialog"
        aria-labelledby="privacy-title"
        aria-describedby="privacy-description"
      >
        <div className="space-y-3">
          {/* Title */}
          <h2 
            id="privacy-title"
            className="text-lg font-bold text-black leading-tight"
          >
            Privacy
          </h2>
          
          {/* Description */}
          <p 
            id="privacy-description"
            className="text-sm leading-relaxed"
            style={{ color: '#696969' }}
          >
            We only use essential cookies to provide proper functionality and security. 
            No tracking and no personal data collection.
          </p>
          
          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-2 pt-1">
            <Link
              href="/terms"
              className="flex-1 px-4 py-2 rounded-lg font-medium text-white text-center text-sm
                transition-all duration-200 hover:shadow-md active:scale-95"
              style={{ backgroundColor: '#578266' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#4a7058';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#578266';
              }}
            >
              Learn more
            </Link>
            
            <button
              onClick={handleDismiss}
              className="flex-1 px-4 py-2 rounded-lg font-medium text-white text-sm
                transition-all duration-200 hover:shadow-md active:scale-95"
              style={{ backgroundColor: '#2E4E39' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#253a2e';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#2E4E39';
              }}
            >
              Sounds good
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default PrivacyPopup;