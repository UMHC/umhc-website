import type { Metadata } from 'next';
import { client, hasSanityConfig } from '@/sanity/lib/client';
import { GUIDES_LIST_QUERY } from '@/sanity/lib/queries';
import type { GuideListItem } from '@/sanity/lib/types';
import GuideCard from '@/components/GuideCard';

export const metadata: Metadata = {
  title: 'UMHC | Guides - Preparing For Hikes And Trips',
  description:
    'Guides to help you prepare for UMHC hikes and trips - from packing for a day hike to what to expect on our winter trip to Scotland.',
  keywords: ['hiking guides', 'day hike packing', 'winter hiking', 'manchester', 'hiking preparation', 'what to bring hiking'],
  openGraph: {
    title: 'UMHC Guides - Preparing For Hikes And Trips',
    description:
      'Everything you need to know before heading out with us, from packing lists to what to expect on our trips.',
    type: 'website',
  },
};

export const revalidate = 60;

export default async function Guides() {
  if (!hasSanityConfig || !client) {
    return (
      <div className="bg-cream-white min-h-screen">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 sm:pt-20 pb-12 sm:pb-16">
          <header className="text-center mb-8 sm:mb-12">
            <div className="max-w-5xl mx-auto space-y-3 sm:space-y-4">
              <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-deep-black leading-tight font-sans px-2">
                Guides
              </h1>
              <div className="max-w-5xl mx-auto px-2">
                <p className="text-sm sm:text-base text-deep-black font-medium font-sans leading-relaxed">
                  Guides will appear here once the club content is connected to Sanity.
                </p>
              </div>
            </div>
          </header>
        </div>
      </div>
    );
  }

  const guides = await client.fetch<GuideListItem[]>(GUIDES_LIST_QUERY);

  return (
    <div className="bg-cream-white min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 sm:pt-20 pb-12 sm:pb-16">
        {/* Header/Intro Section */}
        <header className="text-center mb-8 sm:mb-12">
          <div className="max-w-5xl mx-auto space-y-3 sm:space-y-4">
            <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-deep-black leading-tight font-sans px-2">
              Guides
            </h1>
            <div className="max-w-5xl mx-auto px-2">
              <p className="text-sm sm:text-base text-deep-black font-medium font-sans leading-relaxed">
                Knowing what to expect and what to bring on one of our hikes can make all the difference to your experience. The conditions in the hills can vary dramatically depending on the season, location, and type of trip, so being properly prepared helps keep everyone safe and ensures you can fully enjoy your time outdoors. These guides will help you understand what different trips involve and how to pack appropriately for them. Whether it&apos;s your first day trip with the club or you&apos;re packing for our incredible 5-day winter trip to Scotland, they&apos;ll help you feel ready for whatever the hills throw at you. If you have any questions about a specific trip, feel free to reach out to us.
              </p>
            </div>
          </div>
        </header>

        {/* Guides List */}
        <main role="main" aria-label="Available guides">
          {guides.length === 0 ? (
            <div className="bg-whellow rounded-2xl px-6 py-12 sm:py-16 text-center max-w-2xl mx-auto">
              <h2 className="text-lg sm:text-xl font-semibold text-umhc-green font-sans mb-2">
                No guides just yet
              </h2>
              <p className="text-sm sm:text-base text-slate-grey font-medium font-sans leading-relaxed">
                We&apos;re busy writing these up. Check back soon, or get in touch if
                there&apos;s something specific you&apos;d like to know before your next trip.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:gap-8">
              {guides.map((guide) => (
                <GuideCard
                  key={guide._id}
                  title={guide.title ?? ''}
                  description={guide.description ?? ''}
                  image={guide.mainImage}
                  slug={guide.slug?.current ?? ''}
                  publishedAt={guide.publishedAt}
                />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
