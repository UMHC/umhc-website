'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowRightIcon } from '@heroicons/react/24/outline';
import { useRef, useEffect, useState } from 'react';

interface GuideCardProps {
  title: string;
  description: string;
  image: string;
  slug: string;
}

export default function GuideCard({ title, description, image, slug }: GuideCardProps) {
  const titleRef = useRef<HTMLHeadingElement>(null);
  const descRef = useRef<HTMLParagraphElement>(null);
  const [titleScale, setTitleScale] = useState(1);
  const [descScale, setDescScale] = useState(1);

  // Check if text overflows and scale down if needed
  useEffect(() => {
    const checkOverflow = () => {
      if (titleRef.current) {
        const el = titleRef.current;
        const maxHeight = 140; // Max height for title in px (lg screens)
        if (el.scrollHeight > maxHeight && titleScale > 0.7) {
          setTitleScale(prev => Math.max(0.7, prev - 0.05));
        }
      }
      if (descRef.current) {
        const el = descRef.current;
        const maxHeight = 180; // Max height for description in px (lg screens)
        if (el.scrollHeight > maxHeight && descScale > 0.75) {
          setDescScale(prev => Math.max(0.75, prev - 0.05));
        }
      }
    };

    checkOverflow();
    window.addEventListener('resize', checkOverflow);
    return () => window.removeEventListener('resize', checkOverflow);
  }, [title, description, titleScale, descScale]);

  return (
    <Link 
      href={`/guides/${slug}`}
      className="group block w-full"
      aria-label={`Read guide: ${title}`}
    >
      <article className="relative h-[642px] sm:h-[320px] md:h-[360px] lg:h-[438px] w-full rounded-[40px] sm:rounded-[30px] md:rounded-[40px] overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
        {/* Split layout container - vertical on mobile, horizontal on desktop */}
        <div className="relative h-full w-full flex flex-col-reverse sm:flex-row">
          {/* Green background with text - bottom on mobile, left on desktop */}
          <div className="relative bg-stealth-green w-full sm:w-[46%] h-[285px] sm:h-full flex flex-col justify-start px-7 sm:px-6 md:px-8 lg:px-9 pt-5 sm:pt-4 md:pt-5 lg:pt-6 pb-4 sm:pb-6">
            {/* Text content wrapper - flex-1 to take available space above button */}
            <div className="flex-1 overflow-hidden flex flex-col min-h-0">
              {/* Title with max constraints */}
              <h2 
                ref={titleRef}
                className="text-cream-white font-bold leading-tight capitalize mb-2 sm:mb-3 md:mb-4 text-left max-w-[450px] flex-shrink-0"
                style={{
                  fontSize: `clamp(1.5rem, ${2.5 * titleScale}vw, ${40 * titleScale}px)`,
                  maxHeight: '140px',
                  lineHeight: '1.2',
                }}
              >
                {title}
              </h2>
              
              {/* Description with max constraints - will be clipped with ellipsis if too long */}
              <p 
                ref={descRef}
                className="text-whellow font-medium leading-relaxed text-left max-w-[450px] overflow-hidden line-clamp-4 sm:line-clamp-3 md:line-clamp-4 lg:line-clamp-5"
                style={{
                  fontSize: `clamp(1rem, ${1.25 * descScale}vw, ${20 * descScale}px)`,
                  lineHeight: '1.5',
                }}
              >
                {description}
              </p>
            </div>
            
            {/* Read full guide button - always at bottom right */}
            <div className="flex items-center justify-end gap-2.5 text-white font-semibold text-base group-hover:gap-4 transition-all duration-200 mt-3 sm:mt-3 md:mt-4 flex-shrink-0">
              <span>Read full guide</span>
              <ArrowRightIcon className="w-4 h-4 stroke-[2.5] group-hover:translate-x-1 transition-transform duration-200" aria-hidden="true" />
            </div>
          </div>
          
          {/* Image - top on mobile, right on desktop */}
          <div className="relative w-full sm:w-[54%] h-[357px] sm:h-full">
            <Image
              src={image}
              alt={`Guide image for ${title}`}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, 54vw"
            />
          </div>
        </div>
      </article>
    </Link>
  );
}
