import Image from 'next/image';
import LazySchedulePreview from '@/components/LazySchedulePreview';
import LazySocialWall from '@/components/LazySocialWall';
import LazyMembershipSection from '@/components/LazyMembershipSection';

export default function Home() {
  return (
    <div className="bg-whellow min-h-screen">
    <div className="relative h-screen overflow-hidden">
      {/* Background image layer */}
      <Image
        src="/images/hero-image/upper-part.webp"
        alt="Hero background image"
        fill
        className="object-cover object-left md:object-center"
        priority
        quality={95}
        sizes="100vw"
        placeholder="blur"
        blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGBkbHB0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
      />
      
      {/* Text layer */}
      <div className="absolute inset-0 flex items-center justify-center z-10 -translate-y-32">
        <div className="text-center">
          <p className="font-bold text-center mb-1 text-xl sm:text-2xl md:text-[26px] lg:text-[28px] xl:text-[30px] 2xl:text-[32px]" style={{ color: 'rgba(255,255,255,0.69)', lineHeight: '1' }}>
            University of Manchester Hiking Club
          </p>
          <h1 className="font-bold whitespace-nowrap text-9xl sm:text-9xl md:text-[160px] lg:text-[150px] xl:text-[180px] 2xl:text-[200px]" style={{ color: 'rgba(255,255,255,0.91)', lineHeight: '0.85' }}>
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
        quality={95}
        sizes="100vw"
        placeholder="blur"
        blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGBkbHB0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJegyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
      />
    </div>
    
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
