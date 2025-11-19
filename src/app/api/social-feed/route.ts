// app/api/social-feed/route.ts
import { NextResponse } from 'next/server';

// Cache the response for 2 days (172800 seconds)
export const revalidate = 172800;

const CONFIG = {
  instagram: {
    username: '_umhc_',
    userId: '6059806661', // Instagram user ID for _umhc_
    rapidApiKey: process.env.RAPID_API_KEY!,
  },
  tiktok: {
    username: '_umhc_',
    rapidApiKey: process.env.RAPID_API_KEY!,
  },
  strava: {
    clubId: process.env.STRAVA_CLUB_ID!,
    clientId: process.env.STRAVA_CLIENT_ID!,
    clientSecret: process.env.STRAVA_CLIENT_SECRET!,
    refreshToken: process.env.STRAVA_REFRESH_TOKEN!,
  }
};

interface SocialPost {
  id: string;
  type: 'instagram' | 'tiktok' | 'strava';
  content: {
    imageUrl?: string;
    videoUrl?: string;
    thumbnailUrl?: string;
    caption?: string;
    likes?: number;
    views?: number;
    timestamp: string;
    link: string;
    activityType?: string;
    distance?: number;
    elevation?: number;
    duration?: number;
    athleteName?: string;
  };
}

interface InstagramPostData {
  id?: string;
  code?: string;
  pk?: string;
  display_url?: string;
  image_versions2?: {
    candidates?: Array<{ url: string }>;
  };
  thumbnail_url?: string;
  media_url?: string;
  caption?: {
    text?: string;
  } | string;
  description?: string;
  like_count?: number;
  likes?: number;
  taken_at?: number;
  shortcode?: string;
}

interface InstagramPost {
  node?: InstagramPostData;
  id?: string;
  code?: string;
  pk?: string;
  display_url?: string;
  image_versions2?: {
    candidates?: Array<{ url: string }>;
  };
  thumbnail_url?: string;
  media_url?: string;
  caption?: {
    text?: string;
  } | string;
  description?: string;
  like_count?: number;
  likes?: number;
  taken_at?: number;
  shortcode?: string;
}

async function getInstagramPosts(): Promise<SocialPost[]> {
  try {
    // Check if API key is configured
    if (!CONFIG.instagram.rapidApiKey || CONFIG.instagram.rapidApiKey === 'undefined') {
      if (process.env.NODE_ENV === 'development') {
        console.warn('Instagram: RAPID_API_KEY not configured');
      }
      return [];
    }

    const response = await fetch(
      `https://instagram-api-fast-reliable-data-scraper.p.rapidapi.com/feed?user_id=${CONFIG.instagram.userId}`,
      {
        method: 'GET',
        headers: {
          'x-rapidapi-key': CONFIG.instagram.rapidApiKey,
          'x-rapidapi-host': 'instagram-api-fast-reliable-data-scraper.p.rapidapi.com'
        },
        next: { revalidate: 172800 } // Cache for 2 days
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      
      if (process.env.NODE_ENV === 'development') {
        // Parse the error to give more helpful feedback
        try {
          const errorData = JSON.parse(errorText);
          if (errorData.error === 'not authorized to view user') {
            console.warn(`Instagram API: Not authorized to view user ID ${CONFIG.instagram.userId}. This could mean:`);
            console.warn('  1. The Instagram account is private');
            console.warn('  2. Your RapidAPI subscription tier doesn\'t have access');
            console.warn('  3. The user ID might be incorrect');
            console.warn(`  Current username: ${CONFIG.instagram.username}`);
          } else {
            console.warn(`Instagram API returned ${response.status}:`, errorData.error || errorText);
          }
        } catch {
          console.warn(`Instagram API returned ${response.status}. Check your RapidAPI subscription and Instagram user ID.`);
        }
      } else {
        console.error('Instagram API error:', response.status, errorText);
      }
      // Return empty array instead of throwing to allow other feeds to load
      return [];
    }

    const data = await response.json();
    
    // Only log in development
    if (process.env.NODE_ENV === 'development') {
      console.log('Instagram API response:', JSON.stringify(data, null, 2));
    }
    
    // The new instagram120 API returns data in a different structure
    // Handle various possible response structures
    const posts = data.data?.posts || data.posts || data.items || data || [];

    if (!Array.isArray(posts)) {
      console.error('Instagram API: posts is not an array:', posts);
      return [];
    }

    return posts.slice(0, 10).map((post: InstagramPost) => {
      // Handle different possible post structures from the new API
      const postData = post.node || post;
      const id = postData.id || postData.code || postData.pk || `${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
      const imageUrl = postData.display_url || 
                      postData.image_versions2?.candidates?.[0]?.url || 
                      postData.thumbnail_url || 
                      postData.media_url;
      const caption = typeof postData.caption === 'string' ? postData.caption : postData.caption?.text || postData.description || '';
      const likes = postData.like_count || postData.likes || 0;
      const timestamp = postData.taken_at ? 
                       new Date(postData.taken_at * 1000).toISOString() : 
                       new Date().toISOString();
      
      return {
        id: `ig_${id}`,
        type: 'instagram' as const,
        content: {
          imageUrl,
          caption,
          likes,
          timestamp,
          link: `https://www.instagram.com/p/${postData.code || postData.shortcode || id}/`
        }
      };
    });
  } catch (error) {
    // Only log errors in production, development failures are expected without API keys
    if (process.env.NODE_ENV !== 'development') {
      console.error('Instagram fetch error:', error);
    }
    return [];
  }
}

async function getTikTokVideos(): Promise<SocialPost[]> {
  try {
    const response = await fetch(
      `https://tiktok-scraper7.p.rapidapi.com/user/posts?unique_id=${CONFIG.tiktok.username}&count=10`,
      {
        headers: {
          'X-RapidAPI-Key': CONFIG.tiktok.rapidApiKey,
          'X-RapidAPI-Host': 'tiktok-scraper7.p.rapidapi.com'
        },
        next: { revalidate: 172800 } // Cache for 2 days
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      // Only log in development, and make it less alarming
      if (process.env.NODE_ENV === 'development') {
        console.warn(`TikTok API returned ${response.status}. This is normal in development if API credentials are not configured.`);
      } else {
        console.error('TikTok API error:', response.status, errorText);
      }
      // Return empty array instead of throwing to allow other feeds to load
      return [];
    }

    const data = await response.json();
    
    // Only log in development
    if (process.env.NODE_ENV === 'development') {
      console.log('TikTok API response:', JSON.stringify(data, null, 2));
    }
    
    // Try different possible response structures
    const videos = data.data?.videos || data.videos || data.data || [];
    
    if (!Array.isArray(videos)) {
      console.error('TikTok API: videos is not an array:', videos);
      return [];
    }

    return videos.slice(0, 10).map((video: { 
      aweme_id?: string; 
      video_id?: string; 
      id?: string; 
      cover?: string; 
      video?: { cover?: string; play_addr?: string }; 
      thumbnail?: string; 
      desc?: string; 
      title?: string; 
      description?: string; 
      play?: string; 
      play_addr?: string; 
      play_count?: number; 
      digg_count?: number; 
      share_url?: string; 
      stats?: { play_count?: number; digg_count?: number }; 
      create_time?: number 
    }) => ({
      id: `tt_${video.aweme_id || video.video_id || video.id || Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
      type: 'tiktok' as const,
      content: {
        thumbnailUrl: video.cover || video.video?.cover || video.thumbnail,
        videoUrl: video.play || video.video?.play_addr || video.play_addr,
        caption: video.title || video.desc || video.description || '',
        views: video.play_count || video.stats?.play_count || 0,
        likes: video.digg_count || video.stats?.digg_count || 0,
        timestamp: new Date((video.create_time || Date.now() / 1000) * 1000).toISOString(),
        link: video.share_url || `https://www.tiktok.com/@${CONFIG.tiktok.username}/video/${video.video_id || video.aweme_id || video.id}`
      }
    }));
  } catch (error) {
    // Only log errors in production, development failures are expected without API keys
    if (process.env.NODE_ENV !== 'development') {
      console.error('TikTok fetch error:', error);
    }
    return [];
  }
}

async function getStravaAccessToken(): Promise<string> {
  const response = await fetch('https://www.strava.com/oauth/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      client_id: CONFIG.strava.clientId,
      client_secret: CONFIG.strava.clientSecret,
      refresh_token: CONFIG.strava.refreshToken,
      grant_type: 'refresh_token',
    }),
  });

  if (!response.ok) throw new Error('Strava token refresh failed');
  
  const data = await response.json();
  return data.access_token;
}

async function getStravaActivities(): Promise<SocialPost[]> {
  try {
    const accessToken = await getStravaAccessToken();
    
    const response = await fetch(
      `https://www.strava.com/api/v3/clubs/${CONFIG.strava.clubId}/activities?per_page=10`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
        next: { revalidate: 172800 } // Cache for 2 days
      }
    );

    if (!response.ok) throw new Error('Strava API failed');

    const activities = await response.json();

    return activities.map((activity: { 
      type: string; 
      distance: number; 
      total_elevation_gain: number; 
      moving_time: number; 
      start_date: string; 
      name: string; 
      id: string;
      athlete: { firstname: string; lastname: string }
    }) => ({
      id: `strava_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
      type: 'strava' as const,
      content: {
        activityType: activity.type,
        distance: activity.distance,
        elevation: activity.total_elevation_gain,
        duration: activity.moving_time,
        athleteName: `${activity.athlete.firstname} ${activity.athlete.lastname}`,
        caption: activity.name,
        timestamp: new Date().toISOString(), // Club activities don't have timestamps
        link: `https://www.strava.com/clubs/${CONFIG.strava.clubId}`
      }
    }));
  } catch (error) {
    // Only log errors in production, development failures are expected without API keys
    if (process.env.NODE_ENV !== 'development') {
      console.error('Strava fetch error:', error);
    }
    return [];
  }
}

export async function GET() {
  try {
    // Fetch all social media data in parallel
    const [instagramPosts, tiktokVideos, stravaActivities] = await Promise.allSettled([
      getInstagramPosts(),
      getTikTokVideos(),
      getStravaActivities()
    ]);

    // Combine all posts, filtering out failed requests
    const allPosts = [
      ...(instagramPosts.status === 'fulfilled' ? instagramPosts.value : []),
      ...(tiktokVideos.status === 'fulfilled' ? tiktokVideos.value : []),
      ...(stravaActivities.status === 'fulfilled' ? stravaActivities.value : [])
    ];

    // Sort by timestamp (most recent first)
    allPosts.sort((a, b) => 
      new Date(b.content.timestamp).getTime() - new Date(a.content.timestamp).getTime()
    );    
    // Only log in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`Social feed: ${allPosts.length} posts loaded`);
    }
    return NextResponse.json(allPosts);
  } catch (error) {
    console.error('Social feed error:', error);
    return NextResponse.json({ error: 'Failed to fetch social data' }, { status: 500 });
  }
}
