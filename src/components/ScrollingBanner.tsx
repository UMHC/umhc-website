'use client';

import { useEffect, useRef, useState } from 'react';

interface BannerMessage {
  text: string;
  order: number;
}

interface ScrollingBannerProps {
  messages: BannerMessage[];
}

export default function ScrollingBanner({ messages }: ScrollingBannerProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);
  const startTimeRef = useRef<number | null>(null);

  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer) return;

    let animationId: number;
    const scrollSpeed = 25; // pixels per second

    const animate = (currentTime: number) => {
      // Initialize start time on first frame
      if (startTimeRef.current === null) {
        startTimeRef.current = currentTime;
      }

      if (!isPaused && scrollContainer) {
        // Calculate elapsed time since animation started
        const elapsedTime = (currentTime - startTimeRef.current) / 1000; // convert to seconds
        const scrollPosition = (elapsedTime * scrollSpeed);
        
        // Reset scroll position when we've scrolled past one set of messages
        // (since we duplicate the messages 20x for seamless loop)
        const contentWidth = scrollContainer.scrollWidth / 20;
        if (contentWidth > 0) {
          const normalizedPosition = scrollPosition % contentWidth;
          scrollContainer.style.transform = `translate3d(-${normalizedPosition}px, 0, 0)`;
        }
      }
      animationId = requestAnimationFrame(animate);
    };

    if (messages && messages.length > 0) {
      animationId = requestAnimationFrame(animate);
    }

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [isPaused, messages]);

  // Don't render if there are no messages
  if (!messages || messages.length === 0) {
    return null;
  }

  // Duplicate messages many times to ensure they fill the entire banner width
  // This creates a seamless infinite scroll effect even with just one message
  const duplicatedMessages = Array(20).fill(messages).flat();

  return (
    <div 
      className="relative w-full overflow-hidden bg-[#B15539] h-[35px] flex items-center"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div
        ref={scrollRef}
        className="flex items-center gap-[30px] whitespace-nowrap text-white font-semibold text-[14px]"
        style={{ willChange: 'transform' }}
      >
        {duplicatedMessages.map((message, index) => (
          <div key={`${message.order}-${index}`} className="flex items-center gap-[30px]">
            <span>{message.text}</span>
            {index < duplicatedMessages.length - 1 && <span className="text-xl font-bold">·</span>}
          </div>
        ))}
      </div>
    </div>
  );
}
