import type { Metadata } from 'next';

export const metadata: Metadata = {
  robots: 'noindex, nofollow, noarchive, nosnippet, noimageindex',
};

export default function StudioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
