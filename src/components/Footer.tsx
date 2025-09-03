import TextButton from './TextButton';
import Button from './Button';
import Image from 'next/image';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-stealth-green text-cream-white py-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row lg:justify-center lg:items-start gap-10 lg:gap-20">
          {/* Navigation Sections */}
          <div className="flex justify-center sm:block">
            <div className="grid grid-cols-2 gap-x-12 gap-y-8 justify-items-start sm:flex sm:flex-wrap sm:justify-center sm:gap-12 md:gap-16 lg:gap-[60px]">
          <div className="flex flex-col gap-2 items-start">
            <TextButton 
              href="/equipment" 
              priority
              className="text-cream-white text-2xl sm:text-base md:text-[16px] font-semibold"
            >
              Equipment
            </TextButton>

            <TextButton 
              href="/constitution" 
              priority
              className="text-cream-white text-2xl sm:text-base md:text-[16px] font-semibold"
            >
              Constitution
            </TextButton>

            <TextButton 
              href="/membership" 
              priority
              className="text-cream-white text-2xl sm:text-base md:text-[16px] font-semibold"
            >
              Membership
            </TextButton>

            <TextButton 
              href="/terms" 
              priority
              className="text-cream-white text-2xl sm:text-base md:text-[16px] font-semibold"
            >
              Terms
            </TextButton>
            
          </div>
          
          <div className="flex flex-col gap-2 items-start">
            <TextButton 
              href="/schedule" 
              priority
              className="text-cream-white text-2xl sm:text-base md:text-[16px] font-semibold"
            >
              Schedule
            </TextButton>
            <nav className="flex flex-col gap-[5px]">
              <TextButton href="/schedule?filter=hike" className="text-cream-white text-xl sm:text-sm md:text-[14px] font-normal">
                Hikes
              </TextButton>
              <TextButton href="/schedule?filter=social" className="text-cream-white text-xl sm:text-sm md:text-[14px] font-normal">
                Socials
              </TextButton>
              <TextButton href="/schedule?filter=residential" className="text-cream-white text-xl sm:text-sm md:text-[14px] font-normal">
                Residential
              </TextButton>
              <TextButton href="/schedule?filter=other" className="text-cream-white text-xl sm:text-sm md:text-[14px] font-normal">
                Other
              </TextButton>
            </nav>
          </div>
          
          
          <div className="flex flex-col gap-2 items-start">
            <TextButton 
              href="/about" 
              priority
              className="text-cream-white text-2xl sm:text-base md:text-[16px] font-semibold"
            >
              About Us
            </TextButton>
            <nav className="flex flex-col gap-[5px]">
              <TextButton href="/about#faqs" className="text-cream-white text-xl sm:text-sm md:text-[14px] font-normal">
                FAQ&apos;s
              </TextButton>
              <TextButton href="mailto:contact@umhc.org.uk" className="text-cream-white text-xl sm:text-sm md:text-[14px] font-normal">
                Contact Us
              </TextButton>
            </nav>
          </div>
            </div>
          </div>

          {/* Interaction Zone */}
          <div className="flex flex-col items-center gap-7 max-w-full lg:max-w-[280px]">
            {/* Become a Member Button and Social Icons */}
            <div className="flex flex-col md:flex-row lg:flex-col items-center gap-5 md:gap-4 lg:gap-5 w-full justify-center">
              {/* Become a Member Button */}
              <div className="shrink-0">
                <Link href="/membership">
                  <Button className="text-sm md:text-sm lg:text-base" aria-label="Become a member of UMHC">
                    Become a Member
                  </Button>
                </Link>
              </div>
              
              {/* Social Icons */}
              <div className="flex gap-4 md:gap-3 lg:gap-4 items-center shrink-0">
                <a 
                  href="https://www.instagram.com/_umhc_" 
                  className="w-6 h-6 md:w-6 md:h-6 lg:w-7 lg:h-7 p-0.5 hover:scale-110 transition-transform duration-200 focus:outline-none focus:scale-110 rounded"
                  aria-label="Follow UMHC on Instagram"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Image
                    src="/images/social-icons/instagram.svg"
                    alt=""
                    width={24}
                    height={24}
                    className="w-full h-full"
                    style={{ filter: 'brightness(0) invert(1)' }}
                  />
                </a>
                
                <a 
                  href="https://www.tiktok.com/@_umhc_" 
                  className="w-6 h-6 md:w-6 md:h-6 lg:w-7 lg:h-7 p-0.5 hover:scale-110 transition-transform duration-200 focus:outline-none focus:scale-110 rounded"
                  aria-label="Follow UMHC on TikTok"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <svg className="w-full h-full" viewBox="0 0 24 24" fill="none">
                    <path 
                      d="M13.5 0H16.47C16.686 1.0725 17.28 2.4255 18.3225 3.768C19.3425 5.0835 20.6955 6 22.5 6V9C19.8705 9 17.895 7.779 16.5 6.2565V16.5C16.5 17.9834 16.0601 19.4334 15.236 20.6668C14.4119 21.9001 13.2406 22.8614 11.8701 23.4291C10.4997 23.9968 8.99167 24.1453 7.53679 23.8559C6.08192 23.5665 4.74559 22.8522 3.69671 21.8033C2.64783 20.7544 1.9335 19.418 1.64411 17.9632C1.35471 16.5083 1.50319 15.0003 2.07087 13.6299C2.63855 12.2594 3.59986 11.0881 4.83318 10.264C6.0665 9.43987 7.51664 9 9 9V12C8.11 12 7.24 12.2639 6.49993 12.7584C5.75991 13.2529 5.18314 13.9557 4.84254 14.7779C4.50195 15.6002 4.41283 16.505 4.58647 17.3779C4.7601 18.2508 5.18868 19.0526 5.81802 19.682C6.44736 20.3113 7.24918 20.7399 8.12211 20.9135C8.99503 21.0872 9.89981 20.9981 10.7221 20.6575C11.5443 20.3169 12.2471 19.7401 12.7416 19.0001C13.2361 18.26 13.5 17.39 13.5 16.5V0Z" 
                      fill="#FFFEFB"
                    />
                  </svg>
                </a>
                
                <a 
                  href="https://strava.app.link/TqWYKYfCGUb" 
                  className="w-6 h-6 md:w-6 md:h-6 lg:w-7 lg:h-7 p-0.5 hover:scale-110 transition-transform duration-200 focus:outline-none focus:scale-110 rounded"
                  aria-label="Follow UMHC on Strava"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <svg className="w-full h-full" viewBox="0 0 24 24" fill="none">
                    <path 
                      d="M7.0965 0L0 13.6875H4.182L7.095 8.2455L9.99 13.6875H14.139L7.0965 0ZM14.139 13.6875L12.0795 17.8215L9.99 13.6875H6.8205L12.0795 24L17.3055 13.6875H14.139Z" 
                      fill="#FFFEFB"
                    />
                  </svg>
                </a>
                
                <a 
                  href="/whatsapp" 
                  className="w-6 h-6 md:w-6 md:h-6 lg:w-7 lg:h-7 p-0.5 hover:scale-110 transition-transform duration-200 focus:outline-none focus:scale-110 rounded"
                  aria-label="Contact UMHC on WhatsApp"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <svg className="w-full h-full" viewBox="0 0 24 24" fill="none">
                    <path 
                      d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.52.148-.174.198-.297.297-.497.1-.199.05-.371-.025-.52-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.87.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.464 3.488" 
                      fill="#FFFEFB"
                    />
                  </svg>
                </a>
              </div>
            </div>
            
            {/* Logo Section */}
            <div className="flex gap-4 sm:gap-5 items-center">
              <Link
                href="https://youtu.be/dQw4w9WgXcQ?si=9K3OeCkzPAnTSf9G"
                aria-label="Rick roll"
                className="relative w-[35px] h-[35px] sm:w-[40px] sm:h-[40px] md:w-[43px] md:h-[43px] hover:scale-105 transition-transform duration-200 focus:outline-none focus:scale-105 rounded"
              >
                <Image
                  src="/images/umhc-badge.webp"
                  alt="UMHC Badge Logo"
                  fill
                  sizes="43px"
                  className="object-contain"
                />
              </Link>
              <Link 
                href="https://manchesterstudentsunion.com/activities/view/hikingclubuom" 
                className="relative w-[45px] h-[35px] sm:w-[52px] sm:h-[40px] md:w-[57px] md:h-[43px] hover:scale-105 transition-transform duration-200 focus:outline-none focus:scale-105 rounded"
                aria-label="Learn more about our partnership with Students' Union Manchester"
              >
                <Image
                  src="/images/su-logo.svg"
                  alt="the University of Manchester Students' Union logo"
                  fill
                  sizes="57px"
                  className="object-contain"
                  style={{ filter: 'brightness(0) invert(1)' }}
                />
              </Link>
            </div>
          </div>
        </div>
        
        <div className="mt-8 text-center text-xs sm:text-sm md:text-[14px] font-normal text-white/70 leading-normal">
          <p>University of Manchester Hiking Club © 2025 | <Link href="/committee" className="text-white/70 hover:text-white">Committee Console</Link></p>
        </div>
      </div>
    </footer>
  );
}