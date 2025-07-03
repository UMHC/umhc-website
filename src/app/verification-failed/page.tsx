import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'uMHC | Verification Failed',
  description: 'Bot verification failed for UMHC WhatsApp group access.',
  robots: 'noindex, nofollow, noarchive, nosnippet, noimageindex',
};

export default function VerificationFailedPage() {
  return (
    <div className="min-h-screen bg-whellow">
      {/* Main Content - Centered Layout */}
      <main className="flex items-center justify-center px-4 sm:px-6 lg:px-8 py-8 min-h-screen">
        <div className="flex flex-col gap-6 sm:gap-8 items-center justify-start w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-2xl mx-auto">
          
          {/* Header Section */}
          <div className="flex flex-col items-center justify-start w-full">
            {/* Gate Illustration */}
            <div className="mb-6 sm:mb-8">
              <Image 
                src="/images/bot-gate-illustration.webp" 
                alt="Illustration of a wooden gate surrounded by evergreen trees in a forest setting"
                width={410}
                height={273}
                className="mx-auto w-full max-w-[280px] sm:max-w-[350px] md:max-w-[410px] h-auto"
                priority
                sizes="(max-width: 640px) 280px, (max-width: 768px) 350px, 410px"
              />
            </div>
            
            {/* Title and Message */}
            <div className="text-center w-full">
              <h1 className="font-sans font-semibold text-3xl sm:text-4xl md:text-5xl text-deep-black mb-3 sm:mb-4 leading-tight">
                Verification Failed
              </h1>
              <p className="font-sans font-medium text-lg sm:text-xl text-deep-black mb-6 sm:mb-8 px-2">
                Sorry, we couldn't verify that you weren't a bot.
              </p>
              
              {/* Additional Info */}
              <div className="bg-cream-white rounded-lg p-4 sm:p-6 border border-gray-200 max-w-xs sm:max-w-md mx-auto">
                <p className="font-sans text-sm sm:text-base text-slate-grey mb-3 sm:mb-4 leading-relaxed">
                  For security reasons, we couldn't complete your verification for the UMHC WhatsApp group.
                </p>
                <p className="font-sans text-xs sm:text-sm text-slate-grey leading-relaxed">
                  If you believe this is an error, please contact us through Instagram, TikTok or in-person.
                </p>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}