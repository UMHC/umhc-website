import type { Metadata } from "next";
import { Open_Sans } from "next/font/google";
import "./globals.css";
import AuthProvider from "@/components/AuthProvider";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import ConditionalLayout from "../components/ConditionalLayout";

const openSans = Open_Sans({
  variable: "--font-open-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "UMHC | Hiking Club",
  description: "The University of Manchester's best society! Lake District & Snowdonia trips from £16. Social's every week. 20+ years experience, all skill levels welcome. Trips sell out fast - book now!",
  icons: {
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' }
    ],
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "University of Manchester Hiking Club",
    "alternateName": "UMHC",
    "url": "https://umhc.org.uk",
    "description": "The University of Manchester's best society! Lake District & Snowdonia trips from £16. Social's every week. 20+ years experience, all skill levels welcome.",
    "foundingDate": "2004",
    "keywords": "hiking, Manchester, students, Lake District, Snowdonia, outdoor activities, meet new people",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Manchester",
      "addressRegion": "Greater Manchester",
      "postalCode": "M13 9PL",
      "addressCountry": "GB"
    },
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "general",
      "email": "contact@umhc.org.uk",
      "availableLanguage": "English"
    },
    "memberOf": {
      "@type": "EducationalOrganization",
      "name": "University of Manchester Students' Union",
      "url": "https://manchesterstudentsunion.com"
    },
    "parentOrganization": {
      "@type": "EducationalOrganization", 
      "name": "University of Manchester",
      "url": "https://www.manchester.ac.uk"
    },
    "sameAs": [
      "https://www.instagram.com/_umhc_/",
      "https://manchesterstudentsunion.com/activities/view/hikingclubuom"
    ]
  };

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationSchema),
          }}
        />
      </head>
      <body
        className={`${openSans.variable} antialiased font-sans bg-whellow`}
      >
        <AuthProvider>
          <ConditionalLayout>
            {children}
          </ConditionalLayout>
        </AuthProvider>
        <Analytics/>
        <SpeedInsights/>
      </body>
    </html>
  );
}
