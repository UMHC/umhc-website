import Image from 'next/image';

export default function UnderDevelopment() {
  return (
    <div className="bg-whellow h-screen flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 fixed inset-0 z-50">
      <div className="text-center w-full max-w-sm sm:max-w-2xl lg:max-w-4xl mx-auto">
        {/* Under Development Illustration */}
        <div className="mb-2 sm:mb-3 lg:mb-4">
          <Image 
            src="/images/under-development.webp" 
            alt="Illustration of a person holding a hammer and a piece of wood, on one knee, working on a gate infront of a path and in a mountainous setting"
            width={700}
            height={700}
            className="mx-auto w-full h-auto max-w-[280px] sm:max-w-[400px] md:max-w-[500px] lg:max-w-[600px] xl:max-w-[700px]"
          />
        </div>

        {/* Error Message */}
        <div className="space-y-3 sm:space-y-4">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold text-black leading-tight font-sans px-2">
            Trail under Construction
          </h1>
          <p className="text-sm sm:text-base md:text-lg lg:text-xl font-medium text-black font-sans px-2">
            We&apos;re not quite ready to guide you down this path yet. Please check back later! 
          </p>
        </div>
      </div>
    </div>
  )
}