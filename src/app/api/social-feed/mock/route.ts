// app/api/social-feed/mock/route.ts
// Use this for testing while setting up real APIs

import { NextResponse } from 'next/server';

const mockPosts = [
  // Instagram posts
  ...Array.from({ length: 8 }, (_, i) => ({
    id: `ig_mock_${i}`,
    type: 'instagram' as const,
    content: {
      imageUrl: `https://picsum.photos/400/400?random=${i}`,
      caption: `Amazing hike to the Peak District with UMHC! 🏔️ Perfect weather and great company. #UMHC #ManchesterHiking #PeakDistrict`,
      likes: Math.floor(Math.random() * 200) + 50,
      timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      link: 'https://www.instagram.com/p/mock/'
    }
  })),
  
  // TikTok videos
  ...Array.from({ length: 6 }, (_, i) => ({
    id: `tt_mock_${i}`,
    type: 'tiktok' as const,
    content: {
      thumbnailUrl: `https://picsum.photos/400/600?random=${i + 20}`,
      videoUrl: '',
      caption: `POV: You're hiking with UMHC and the views are incredible! 🎥⛰️ #UniversityLife #ManchesterUni #HikingClub`,
      views: Math.floor(Math.random() * 5000) + 1000,
      likes: Math.floor(Math.random() * 500) + 100,
      timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      link: 'https://www.tiktok.com/@umhc/video/mock'
    }
  })),
  
  // Strava activities
  ...Array.from({ length: 10 }, (_, i) => ({
    id: `strava_mock_${i}`,
    type: 'strava' as const,
    content: {
      activityType: ['Hike', 'Walk', 'Run'][Math.floor(Math.random() * 3)],
      distance: Math.floor(Math.random() * 20000) + 5000,
      elevation: Math.floor(Math.random() * 500) + 100,
      duration: Math.floor(Math.random() * 7200) + 3600,
      athleteName: ['Sarah Johnson', 'Mike Chen', 'Emma Wilson', 'Alex Kumar'][Math.floor(Math.random() * 4)],
      caption: 'UMHC Weekend Hike',
      timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      link: 'https://www.strava.com/activities/mock'
    }
  }))
];

export async function GET() {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Sort by timestamp
  const sortedPosts = [...mockPosts].sort((a, b) => 
    new Date(b.content.timestamp).getTime() - new Date(a.content.timestamp).getTime()
  );
  
  return NextResponse.json(sortedPosts);
}
