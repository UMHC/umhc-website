'use client';

import { useState, useEffect } from 'react';
import GuideCard from '@/components/GuideCard';

interface Guide {
  id: string;
  title: string;
  description: string;
  image: string;
  slug: string;
}

export default function Guides() {
  const [guides, setGuides] = useState<Guide[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchGuides() {
      try {
        const response = await fetch('/guides.json');
        const data = await response.json();
        setGuides(data.guides);
      } catch (error) {
        console.error('Error fetching guides:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchGuides();
  }, []);

  return (
    <div className="bg-cream-white min-h-screen">
      {/* Guides Introduction section */}
      <section className="pt-16 pb-4" aria-labelledby="guides-heading">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <header className="text-center space-y-2 mb-4 sm:mb-6">
            <h1 id="guides-heading" className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-deep-black leading-tight font-sans px-2">
              Guides
            </h1>
            <div className="max-w-5xl mx-auto px-2">
              <p className="text-xs sm:text-sm md:text-base text-deep-black font-medium font-sans leading-relaxed">
                Knowing what to expect and what to bring on one of our hikes can make all the difference to your experience. The conditions in the hills can vary dramatically depending on the season, location, and type of trip, so being properly prepared helps keep everyone safe and ensures you can fully enjoy your time outdoors. This page contains guides to help you understand what different trips involve and how to pack appropriately for them. Whether it&apos;s your first day trip with the club or you&apos;re packing for our incredible 5-day winter trip to Scotland, these resources will help you feel ready for whatever the hills throw at you. If you have any questions about a specific trip, feel free to reach out to us.
              </p>
            </div>
          </header>
        </div>
      </section>

      {/* Guides List section */}
      <section className="pb-12 sm:pb-16" aria-label="Available guides">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="text-center py-8">
              <p className="text-deep-black">Loading guides...</p>
            </div>
          ) : guides.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-deep-black">No guides available at the moment.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:gap-8">
              {guides.map((guide) => (
                <GuideCard
                  key={guide.id}
                  title={guide.title}
                  description={guide.description}
                  image={guide.image}
                  slug={guide.slug}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
