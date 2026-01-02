import Image from 'next/image';
import LazySchedulePreview from '@/components/LazySchedulePreview';
import LazySocialWall from '@/components/LazySocialWall';
import LazyMembershipSection from '@/components/LazyMembershipSection';
import ScrollIndicator from '@/components/ScrollIndicator';
import TypewriterHero from '@/components/TypewriterHero';
import ScrollingBanner from '@/components/ScrollingBanner';
import SnowEffect from '@/components/SnowEffect';
// import EGMSection from '@/components/EGMSection';
import { getBannerMessages } from '@/lib/bannerService';

export const revalidate = 600; // Revalidate every 10 minutes

export default async function Home() {
  const bannerMessages = await getBannerMessages();
  return (
    <div className="bg-whellow min-h-screen">
      <SnowEffect />
    <div className="relative min-h-screen overflow-hidden">
      {/* Background image layer */}
      <Image
        src="/images/hero-image/upper-part.webp"
        alt="Hero background image"
        fill
        className="object-cover object-left md:object-center"
        priority
        quality={100}
        unoptimized={true}
        sizes="100vw"
      />
      
      {/* Text layer */}
      <div className="hero-text absolute inset-0 flex items-center justify-center z-10 pt-16 sm:pt-20 landscape:pt-24">
        <div className="text-center px-4">
          <TypewriterHero />
          <h1 className="font-bold whitespace-nowrap text-8xl xs:text-9xl sm:text-[120px] md:text-[140px] lg:text-[150px] xl:text-[160px] 2xl:text-[180px]" style={{ color: 'rgba(255,255,255,0.91)', lineHeight: '0.85' }}>
            UMHC
          </h1>
        </div>
      </div>
      
      {/* Foreground image layer */}
      <Image
        src="/images/hero-image/lower-part.webp"
        alt="Hero foreground image"
        fill
        className="object-cover object-left md:object-center z-20 -translate-y-0.5"
        priority
        quality={100}
        unoptimized={true}
        sizes="100vw"
      />
      
      {/* Scrolling Banner - positioned at bottom of hero */}
      <div className="absolute bottom-0 left-0 right-0 z-30">
        <ScrollingBanner messages={bannerMessages} />
      </div>
      
      {/* Scroll indicator */}
      <ScrollIndicator />
    </div>
    
    {/* EGM Section - Uncomment when ready to announce */}
    {/* <EGMSection /> */}

    {/* Who Are We Section */}
    <section className="bg-whellow">
      <div className="flex flex-col items-center w-full">
        <div className="flex flex-col gap-4 items-center justify-start px-6 md:px-12 lg:px-20 py-12 w-full text-center">
          <h2 className="font-bold text-deep-black text-3xl md:text-4xl lg:text-[40px] whitespace-nowrap">
            Who are we?
          </h2>
          <p className="font-medium text-deep-black text-base leading-normal w-full min-w-full">
            We are the University of Manchester Hiking Club, bringing together students who love getting outdoors and meeting new people. As a society under The University of Manchester Student Union, we welcome students from all backgrounds and experience levels to join our adventures and connect with like-minded individuals no matter which university you attend in Manchester. Every weekend during term time, we organise hikes to stunning locations including the Lake District and North Wales, plus we run weekly socials to keep our community connected throughout the week. Whether you&apos;re a complete beginner taking your first steps on the trails or an experienced hiker looking for new challenges, our inclusive approach means everyone has a place in our community. We believe that hiking is for everyone, and we&apos;re here to help you discover the joy of exploring the outdoors with new friends while building lasting connections both on and off the trails.
          </p>
        </div>
      </div>
    </section>
    
    {/* Schedule Preview Section */}
    <LazySchedulePreview />
    
    {/* Social Wall Section */}
    <LazySocialWall />
    
    {/* Membership Section */}
    <LazyMembershipSection />
    </div>
  );
}
