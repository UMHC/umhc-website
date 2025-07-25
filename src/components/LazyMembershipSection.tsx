import dynamic from 'next/dynamic'

const MembershipSection = dynamic(() => import('./MembershipSection'), {
  loading: () => <div className="h-64 bg-whellow animate-pulse" />
})

export default MembershipSection