# UMHC Social Wall - Production Setup

## Overview
The social wall displays content from UMHC's Instagram (@_umhc_), TikTok (@_umhc_), and Strava accounts in an auto-scrolling multi-column layout.

## Files
- `src/components/SocialWall.tsx` - Main social wall component
- `src/app/api/social-feed/route.ts` - Production API route

## Current Status
🟢 **Production Ready**: Using live data from Instagram, TikTok, and Strava APIs

## Features
- Auto-scrolling columns at different speeds
- Responsive design (2 columns on mobile, 5 on desktop)
- Instagram, TikTok, and Strava post support
- Click posts to open on original platform
- Smooth animations and hover effects
- **Smart Caching**: 2-day cache to preserve API rate limits

## API Configuration
- **Instagram**: Using Instagram Scraper Stable API (20 requests/month limit)
- **TikTok**: Using TikTok Scraper API
- **Strava**: Using official Strava API
- **Caching**: All APIs cached for 2 days to minimize requests

## Social Media Accounts
- Instagram: @_umhc_
- TikTok: @_umhc_
- Strava: Club ID from environment variables

## Environment Variables Required
```bash
RAPID_API_KEY=your_rapidapi_key
STRAVA_CLIENT_ID=your_strava_client_id
STRAVA_CLIENT_SECRET=your_strava_client_secret
STRAVA_REFRESH_TOKEN=your_strava_refresh_token
STRAVA_CLUB_ID=your_club_id
```

## Troubleshooting
- If no posts appear, check browser console for API errors
- Verify all environment variables are set correctly
- Instagram/TikTok issues: Check RapidAPI subscription status
- Strava issues: Verify club ID and refresh token validity
