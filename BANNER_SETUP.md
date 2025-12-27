# Scrolling Banner Setup Guide

## Overview
The scrolling banner feature displays announcements at the top of the homepage. Messages are stored in Vercel Edge Config and can be managed through the committee console.

## Implementation Complete ✓
- ✅ ScrollingBanner component created
- ✅ Banner service with Edge Config integration
- ✅ API endpoints for fetching and updating messages
- ✅ Banner management UI in committee console
- ✅ Integration into homepage

## Vercel Edge Config Setup Required

### Step 1: Create Edge Config in Vercel Dashboard

1. Go to your Vercel project dashboard
2. Navigate to **Storage** → **Edge Config**
3. Click **Create Edge Config**
4. Name it: `umhc-config` (or your preferred name)
5. Click **Create**

### Step 2: Add the Initial Banner Messages

In your new Edge Config, add a new item:

**Key:** `banner_messages`

**Value:** (Copy and paste this JSON)
```json
[
  {
    "text": "Get ready for ReFreshers with us!",
    "order": 1
  },
  {
    "text": "Our EGM will take place February 4th 2026",
    "order": 2
  },
  {
    "text": "Make sure to checkout our Nethy Packing List",
    "order": 3
  },
  {
    "text": "Visit our stall in Academy 1 on Tuesday from 9-4",
    "order": 4
  }
]
```

### Step 3: Add Environment Variables

You need to add two new environment variables to your Vercel project:

#### 3a. EDGE_CONFIG_ID
1. In your Edge Config settings page, copy the **Edge Config ID**
2. Go to your Vercel project → **Settings** → **Environment Variables**
3. Add: 
   - **Name:** `EDGE_CONFIG_ID`
   - **Value:** `ecfg_xxxxxxxxxxxxx` (your Edge Config ID)
   - Add to: **Production**, **Preview**, **Development**

#### 3b. VERCEL_API_TOKEN
1. Go to Vercel **Account Settings** → **Tokens**
2. Click **Create Token**
3. Name it: `Edge Config Management`
4. Set scope: **Full Account**
5. Set expiration: **No expiration** (or your preferred duration)
6. Copy the generated token
7. Go to your project → **Settings** → **Environment Variables**
8. Add:
   - **Name:** `VERCEL_API_TOKEN`
   - **Value:** `[paste your token]`
   - Add to: **Production**, **Preview**, **Development**

### Step 4: Connect Edge Config to Your Project

1. In Vercel Dashboard, go to **Storage** → **Edge Config**
2. Click on your Edge Config
3. Go to **Projects** tab
4. Click **Connect Project**
5. Select your `umhc-website` project
6. Click **Connect**

This will automatically add the `EDGE_CONFIG` environment variable to your project.

### Step 5: Redeploy Your Application

After setting up the environment variables:
1. Go to **Deployments** in Vercel
2. Click on the latest deployment
3. Click the three dots menu → **Redeploy**
4. Check **Use existing Build Cache** (optional for faster deployment)
5. Click **Redeploy**

## Usage

### For Committee Members

1. Log in to the committee console at `/committee`
2. Scroll down to the **Banner Messages** section
3. You can:
   - Add new messages with the "+ Add Message" button
   - Edit existing message text
   - Reorder messages using the up/down arrows
   - Delete messages with the trash icon
   - Pause banner scrolling by hovering over it
4. Click **Save Changes** when done
5. Changes will be live immediately (Edge Config updates propagate within seconds)

### Technical Details

**Files Created:**
- `/src/components/ScrollingBanner.tsx` - The banner component
- `/src/components/BannerManagement.tsx` - Management UI
- `/src/lib/bannerService.ts` - Edge Config integration
- `/src/app/api/banner/route.ts` - API endpoints

**Files Modified:**
- `/src/app/page.tsx` - Added banner between hero and content
- `/src/app/committee/CommitteeConsoleClient.tsx` - Added management UI

## Features

- ✨ Smooth infinite scrolling animation
- 🎯 Earth orange background (#B15539) matching design
- ⏸️ Pauses on hover for readability
- 📱 Responsive design
- 🔐 Committee-only editing via existing auth system
- ⚡ Fast global updates via Edge Config
- 🎨 Matches Figma design exactly

## Troubleshooting

**Banner not showing:**
- Check that `EDGE_CONFIG` environment variable is set (auto-added when connecting Edge Config)
- Verify `banner_messages` key exists in Edge Config
- Check browser console for errors

**Can't save changes:**
- Verify `EDGE_CONFIG_ID` is set correctly
- Verify `VERCEL_API_TOKEN` is valid and has correct permissions
- Check you have committee access (role: `is-committee`)
- Check API route `/api/banner` for errors in Vercel logs

**Messages not updating:**
- Edge Config updates propagate within seconds globally
- Try hard refresh (Cmd+Shift+R / Ctrl+Shift+R)
- Check Vercel logs for any API errors

## Notes

- Messages are globally cached via Edge Config for ultra-fast loading
- No database queries needed - Edge Config is optimized for read-heavy data
- Committee members can update messages instantly without deployments
- Default messages are in `bannerService.ts` as fallback
