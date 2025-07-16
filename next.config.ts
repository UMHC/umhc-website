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
    ],
  },
};

export default nextConfig;
