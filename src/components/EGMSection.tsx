import Link from 'next/link';
import Image from 'next/image';

export default function EGMSection() {
  return (
    <section className="bg-[#fffcf7] py-8 sm:py-12 lg:py-16 pb-12 sm:pb-16 lg:pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center gap-6 lg:gap-8">
          {/* Left side - Image */}
          <div className="w-full lg:w-auto flex justify-center lg:justify-start flex-shrink-0">
            <div className="relative w-60 h-60 sm:w-72 sm:h-72 md:w-80 md:h-80 lg:w-[348px] lg:h-[348px]">
              <Image
                src="/images/activity-images/vote-box.webp"
                alt="Voting box illustration"
                fill
                className="object-cover"
                sizes="(max-width: 640px) 240px, (max-width: 768px) 288px, (max-width: 1024px) 320px, 348px"
              />
            </div>
          </div>

          {/* Right side - Content */}
          <div className="flex flex-col gap-4 lg:gap-6 flex-1 max-w-3xl">
            <h2 className="font-bold text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-black leading-tight text-center lg:text-left">
              We&apos;re Having an EGM
            </h2>
            
            <p className="font-bold text-base sm:text-lg md:text-xl text-[#494949] text-center lg:text-left">
              3rd February | 7:00 PM | Room 5.206, Uni Place
            </p>
            
            <div className="font-medium text-base text-black space-y-4 text-center lg:text-left">
              <p>
                Due to recent internal events within our committee, we will now be hosting an Extraordinary General Meeting (EGM) to appoint new committee members and potentially introduce new laws to our constitution. Almost anyone can apply for an open role within the committee and we encourage all of our members to join us to vote on the upcoming changes.
              </p>
              <p>
                Click on the button below to explore more about what&apos;s happening within your committee and how you can get involved.
              </p>
            </div>

            <div className="flex justify-center lg:justify-end mt-2">
              <Link 
                href="/egm"
                className="bg-[#b15539] text-[#fffefb] font-semibold text-[15px] px-3.5 py-1.5 rounded-full shadow-md hover:bg-[#9a4730] transition-colors flex items-center gap-2 whitespace-nowrap"
              >
                Explore more
                <svg 
                  width="14" 
                  height="12" 
                  viewBox="0 0 14 12" 
                  fill="none" 
                  xmlns="http://www.w3.org/2000/svg"
                  className="flex-shrink-0"
                  role="img"
                  aria-hidden="true"
                >
                  <title>Arrow</title>
                  <path 
                    d="M8.5 1L13.5 6M13.5 6L8.5 11M13.5 6H0.5" 
                    stroke="currentColor" 
                    strokeWidth="1.5" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
