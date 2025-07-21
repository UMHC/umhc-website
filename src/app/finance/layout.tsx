import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'UMHC | Finance',
  description: 'University of Manchester Hiking Club finance information including membership fees, trip costs, and budget transparency.',
  openGraph: {
    title: 'UMHC Finance',
    description: 'Information about our society finances, membership costs, and budget transparency.',
  },
};

export default function FinanceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
