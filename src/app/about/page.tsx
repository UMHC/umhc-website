'use client';

import { useEffect } from 'react';
import FAQ from '@/components/FAQ';

export default function About() {
  useEffect(() => {
    // Handle anchor navigation after component mounts
    const scrollToAnchor = () => {
      const hash = window.location.hash;
      if (hash) {
        const element = document.querySelector(hash);
        if (element) {
          // Scroll with offset for fixed navbar
          const elementPosition = element.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - 80; // 80px offset for navbar
          
          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });
        }
      }
    };

    // Try immediately
    scrollToAnchor();
    
    // Also try after a longer delay to ensure FAQ component is rendered
    const timeout = setTimeout(scrollToAnchor, 500);
    
    return () => clearTimeout(timeout);
  }, []);
  return (
    <div className="bg-whellow min-h-screen">
      {/* Skip Navigation Link */}
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only focus:absolute focus:z-[100000] focus:top-4 focus:left-4 focus:bg-umhc-green focus:text-white focus:px-4 focus:py-2 focus:rounded-md focus:outline-none focus:ring-2 focus:ring-white"
      >
        Skip to main content
      </a>
      {/* Who Are We section */}
      <section className="pt-16 pb-1 bg-cream-white" aria-labelledby="about-heading">
        <main id="main-content">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <header className="text-center space-y-2 mb-8 sm:mb-12">
            <h1 id="about-heading" className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-deep-black leading-tight font-sans px-2">
              Who Are We?
            </h1>
            <div className="max-w-5xl mx-auto px-2">
              <p className="text-xs sm:text-sm md:text-base text-deep-black font-medium font-sans leading-relaxed">
                We are the University of Manchester Hiking Club, bringing together students who love getting outdoors and meeting new people. As a society under The University of Manchester Student Union, we welcome students from all backgrounds and experience levels to join our adventures and connect with like-minded individuals no matter which university you attend in Manchester. Every weekend during term time, we organise hikes to stunning locations including the Lake District and North Wales, plus we run weekly socials to keep our community connected throughout the week. Whether you&apos;re a complete beginner taking your first steps on the trails or an experienced hiker looking for new challenges, our inclusive approach means everyone has a place in our community. We believe that hiking is for everyone, and we&apos;re here to help you discover the joy of exploring the outdoors with new friends while building lasting connections both on and off the trails.
              </p>
            </div>
          </header>
        </div>
        </main>
      </section>

      {/* FAQ section */}
      <FAQ />
    </div>
  );
}