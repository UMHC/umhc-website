'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function ConditionalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isStudio = pathname.startsWith('/studio');

  useEffect(() => {
    // The UserWay accessibility widget script lives in the root layout and injects its
    // own floating button directly into <body>, outside React's tree, so it can't be
    // conditionally rendered - hide it via CSS instead when on the Sanity Studio route.
    document.body.classList.toggle('hide-a11y-widget', isStudio);
  }, [isStudio]);

  // Check if we're on a committee page or the embedded Sanity Studio
  const shouldHideNavAndFooter = pathname.startsWith('/committee') || isStudio;

  if (shouldHideNavAndFooter) {
    // For committee, dashboard, and studio pages, don't show global navbar and footer
    // (Dashboard and Studio have their own layout/chrome)
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
