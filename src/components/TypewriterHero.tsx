'use client';

import { useState, useEffect } from 'react';

export default function TypewriterHero() {
  const originalText = 'University of Manchester Hiking Club';
  const christmasText = 'Merry Christmas from UMHC!';
  
  const [displayText, setDisplayText] = useState(originalText);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    // Start animation after a short delay
    const startDelay = setTimeout(() => {
      setIsAnimating(true);
      animateText();
    }, 2000);

    return () => clearTimeout(startDelay);
  }, []);

  const animateText = async () => {
    // Wait a bit before starting
    await sleep(1000);
    
    // Backspace original text
    for (let i = originalText.length; i >= 0; i--) {
      setDisplayText(originalText.substring(0, i));
      await sleep(50);
    }
    
    await sleep(300);
    
    // Type Christmas message
    for (let i = 0; i <= christmasText.length; i++) {
      setDisplayText(christmasText.substring(0, i));
      await sleep(80);
    }
    
    // Stay for a while
    await sleep(3000);
    
    // Backspace Christmas message
    for (let i = christmasText.length; i >= 0; i--) {
      setDisplayText(christmasText.substring(0, i));
      await sleep(50);
    }
    
    await sleep(300);
    
    // Type original text back
    for (let i = 0; i <= originalText.length; i++) {
      setDisplayText(originalText.substring(0, i));
      await sleep(80);
    }
    
    setIsAnimating(false);
  };

  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  return (
    <p 
      className="font-bold text-center mb-1 text-base sm:text-xl md:text-2xl lg:text-[24px] xl:text-[26px] 2xl:text-[28px] min-h-[1.5em]" 
      style={{ color: 'rgba(255,255,255,0.69)', lineHeight: '1.1' }}
    >
      {displayText}
      {isAnimating && (
        <span 
          className="inline-block w-[0.1em] h-[0.9em] ml-[0.1em] animate-[blink_1s_step-end_infinite]"
          style={{ 
            backgroundColor: 'rgba(255,255,255,0.69)',
            verticalAlign: 'baseline'
          }}
        />
      )}
      <style jsx>{`
        @keyframes blink {
          0%, 49% { opacity: 1; }
          50%, 100% { opacity: 0; }
        }
      `}</style>
    </p>
  );
}
