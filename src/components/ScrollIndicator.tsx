'use client';

import { useState, useEffect } from 'react';
import { ChevronDownIcon } from '@heroicons/react/24/outline';

export default function ScrollIndicator() {
  const [isVisible, setIsVisible] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      
      // Hide indicator after user scrolls 100px or more
      if (scrollY > 100 && !hasScrolled) {
        setHasScrolled(true);
        setIsVisible(false);
      }
    };

    // Add scroll event listener
    window.addEventListener('scroll', handleScroll);

    // Show indicator after 3 seconds if user hasn't scrolled
    const showTimer = setTimeout(() => {
      if (!hasScrolled) {
        setIsVisible(true);
      }
    }, 3000);

    // Auto-hide after 8 seconds total (3s delay + 5s visible) if user hasn't scrolled
    const autoHideTimer = setTimeout(() => {
      if (!hasScrolled) {
        setIsVisible(false);
      }
    }, 8000);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(showTimer);
      clearTimeout(autoHideTimer);
    };
  }, [hasScrolled]);

  const handleClick = () => {
    // Scroll down slowly (about 70% of viewport height)
    const scrollAmount = window.innerHeight * 0.7;
    
    // Custom smooth scroll with constant speed
    const startPosition = window.pageYOffset;
    const targetPosition = startPosition + scrollAmount;
    const duration = 800; // 0.8 seconds - middle ground between fast and slow
    let start: number;

    const smoothScroll = (timestamp: number) => {
      if (!start) start = timestamp;
      const elapsed = timestamp - start;
      const progress = Math.min(elapsed / duration, 1);
      
      // Linear progression for constant speed
      const currentPosition = startPosition + (targetPosition - startPosition) * progress;
      window.scrollTo(0, currentPosition);
      
      if (progress < 1) {
        requestAnimationFrame(smoothScroll);
      }
    };

    requestAnimationFrame(smoothScroll);
    
    // Hide indicator after click
    setHasScrolled(true);
    setIsVisible(false);
  };

  return (
    <button
      onClick={handleClick}
      className={`scroll-indicator fixed bottom-6 sm:bottom-8 md:bottom-10 left-1/2 transform -translate-x-1/2 z-30 
        ${isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}
        transition-opacity duration-500 ease-out
        focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 rounded-full
        hover:scale-110 transition-transform duration-200 motion-reduce:hover:scale-100 motion-reduce:transition-none`}
      aria-label="Scroll down to content"
      style={{ display: hasScrolled ? 'none' : 'block' }}
    >
      <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-full p-2 sm:p-3 md:p-4 shadow-lg">
        <ChevronDownIcon 
          className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-white animate-bounce-vertical motion-reduce:animate-none" 
          strokeWidth={2.5}
        />
      </div>
    </button>
  );
}