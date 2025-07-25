import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'scontent-ams4-1.cdninstagram.com',
      },
      {
        protocol: 'https',
        hostname: 'v16m.tiktokcdn-eu.com',
      },
      {
        protocol: 'https',
        hostname: 'p16-sign-useast2a.tiktokcdn.com',
      },
      {
        protocol: 'https',
        hostname: 'p16-pu-sign-no.tiktokcdn-eu.com',
      },
      {
        protocol: 'https',
        hostname: 'sf16-ies-music-va.tiktokcdn.com',
      },
      {
        protocol: 'https',
        hostname: 'p77-sign-va.tiktokcdn.com',
      },
      {
        protocol: 'https',
        hostname: 'p16-common-sign-useastred.tiktokcdn-eu.com',
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          // Content Security Policy
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              // Scripts: self, Vercel Analytics, Kinde Auth, Cloudflare Turnstile
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' va.vercel-scripts.com kinde.com *.kinde.com challenges.cloudflare.com *.cloudflare.com",
              // Styles: self, inline styles, Google Fonts
              "style-src 'self' 'unsafe-inline' fonts.googleapis.com",
              // Images: self, data URIs, social media CDNs, Vercel, Supabase
              "img-src 'self' data: blob: scontent-*.cdninstagram.com *.tiktokcdn.com *.tiktokcdn-*.com vercel.com *.supabase.co",
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
              // Upgrade insecure requests
              "upgrade-insecure-requests"
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
              'geolocation=(self)',
              'interest-cohort=()'
            ].join(', ')
          },
          // Enforce HTTPS (only in production)
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload'
          }
        ]
      }
    ];
  }
};

export default nextConfig;
