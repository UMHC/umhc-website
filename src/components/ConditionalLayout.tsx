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
  const isCommitteePage = pathname.startsWith('/committee');
  
  if (isCommitteePage) {
    // For committee pages, don't show navbar and footer
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
