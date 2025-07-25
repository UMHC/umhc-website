import dynamic from 'next/dynamic'

const SocialWall = dynamic(() => import('./SocialWall'), {
  loading: () => <div className="h-96 bg-whellow animate-pulse" />
})

export default SocialWall