import type { NextConfig } from "next";

const isProduction = process.env.NODE_ENV === 'production';

const nextConfig: NextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    qualities: [75, 85, 90, 95, 100], // Add quality 85 and other common values
    minimumCacheTTL: 31536000, // 1 year for static images
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.cdninstagram.com',
      },
      {
        protocol: 'https',
        hostname: '*.tiktokcdn.com',
      },
      {
        protocol: 'https',
        hostname: '*.tiktokcdn-eu.com',
      },
    ],
  },
  async headers() {
    return [
      // Static image cache headers for image optimization cost reduction
      {
        source: '/images/activity-images/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable', // 1 year, immutable
          },
        ],
      },
      {
        source: '/images/equipment/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable', // 1 year, immutable
          },
        ],
      },
      {
        source: '/images/umhc-(.*).webp',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable', // 1 year, immutable
          },
        ],
      },
      {
        source: '/images/hero-image/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable', // 1 year, immutable
          },
        ],
      },
      {
        source: '/logos/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable', // 1 year, immutable
          },
        ],
      },
      {
        source: '/(.*)',
        headers: [
          // Content Security Policy - More permissive for Next.js functionality
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              // Scripts: more permissive for Next.js functionality
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' va.vercel-scripts.com kinde.com *.kinde.com challenges.cloudflare.com *.cloudflare.com",
              // Styles: self, inline styles (required for Next.js), Google Fonts
              "style-src 'self' 'unsafe-inline' fonts.googleapis.com",
              // Images: self, data URIs, social media CDNs, Vercel, Supabase
              "img-src 'self' data: blob: *.cdninstagram.com *.tiktokcdn.com *.tiktokcdn-eu.com vercel.com *.supabase.co",
              // Fonts: self, Google Fonts
              "font-src 'self' fonts.gstatic.com",
              // Connect: self, Vercel Analytics, Kinde Auth, Supabase, social APIs, Cloudflare Turnstile
              "connect-src 'self' vitals.vercel-insights.com kinde.com *.kinde.com *.supabase.co graph.instagram.com api.tiktok.com challenges.cloudflare.com *.cloudflare.com",
              // Frames: social media embeds, Kinde auth, Cloudflare Turnstile
              "frame-src 'self' kinde.com *.kinde.com www.instagram.com www.tiktok.com challenges.cloudflare.com *.cloudflare.com",
              // Objects: none for security
              "object-src 'none'",
              // Base URI: self only
              "base-uri 'self'",
              // Form actions: self and auth providers
              "form-action 'self' kinde.com *.kinde.com",
              // Upgrade insecure requests (only in production)
              ...(isProduction ? ["upgrade-insecure-requests"] : [])
            ].join('; ')
          },
          // Prevent clickjacking
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          // Prevent MIME type sniffing
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          // Control referrer information
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          // Control browser features
          {
            key: 'Permissions-Policy',
            value: [
              'camera=()',
              'microphone=()',
              'geolocation=(self)'
            ].join(', ')
          },
          // Enforce HTTPS (only in production to avoid TLS errors on localhost)
          ...(isProduction ? [{
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload'
          }] : [])
        ]
      }
    ];
  },
  experimental: {
    optimizePackageImports: ['@heroicons/react', 'lucide-react'],
  },
};

export default nextConfig;
