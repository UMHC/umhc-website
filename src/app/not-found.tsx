
export default function NotFound() {
  return (
    <div className="bg-whellow h-screen flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 fixed inset-0 z-50">
      <div className="text-center w-full max-w-sm sm:max-w-2xl lg:max-w-4xl mx-auto">
        {/* 404 Illustration */}
        <div className="mb-2 sm:mb-3 lg:mb-4">
          <img 
            src="/images/404-hiker-illustration.webp" 
            alt="Illustration of a hiker with backpack and orange hat looking at a map, surrounded by mountains and trees"
            className="mx-auto w-full h-auto max-w-[280px] sm:max-w-[400px] md:max-w-[500px] lg:max-w-[600px] xl:max-w-[700px]"
          />
        </div>

        {/* Error Message */}
        <div className="space-y-3 sm:space-y-4">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold text-black leading-tight font-sans px-2">
            Looks like you've wandered off path
          </h1>
          <p className="text-sm sm:text-base md:text-lg lg:text-xl font-medium text-black font-sans px-2">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>
      </div>
    </div>
  )
}