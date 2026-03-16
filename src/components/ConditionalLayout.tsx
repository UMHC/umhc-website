'use client';

import { usePathname } from 'next/navigation';
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function ConditionalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // Check if we're on a committee page
  const shouldHideNavAndFooter = pathname.startsWith('/committee');

  if (shouldHideNavAndFooter) {
    // For committee and dashboard pages, don't show global navbar and footer
    // (Dashboard has its own layout)
    return <>{children}</>;
  }

  // For all other pages, show navbar and footer
  return (
    <>
      <Navbar />
      {children}
      <Footer />
    </>
  );
}
