import dynamic from 'next/dynamic'

const SocialWall = dynamic(() => import('./SocialWall'), {
  ssr: true, // Enable SSR for faster initial render
  loading: () => (
    <div className="h-96 flex items-center justify-center bg-whellow">
      <div className="text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-umhc-green border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" role="status">
          <span className="sr-only">Loading social feed...</span>
        </div>
        <p className="mt-4 text-slate-grey text-sm">Loading social content</p>
      </div>
    </div>
  )
})

export default SocialWall