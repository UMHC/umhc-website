import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'UMHC | Committee Console',
  description: 'Management console for UMHC committee members',
  robots: 'noindex, nofollow, noarchive, nosnippet, noimageindex',
};

export default function CommitteeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-whellow">
      {children}
    </div>
  );
}
