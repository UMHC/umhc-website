'use client';

import { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import { Instagram, Play, Activity } from 'lucide-react';

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
    // Strava specific
    activityType?: string;
    distance?: number;
    elevation?: number;
    duration?: number;
    athleteName?: string;
  };
}

const SocialWall = () => {
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollContainerRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    fetchSocialData();
    
    // Refresh data every 2 days
    const interval = setInterval(fetchSocialData, 2 * 24 * 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Start auto-scrolling when posts are loaded
    if (posts.length > 0 && !loading) {
      // Add a small delay to ensure DOM is ready
      setTimeout(() => {
        startAutoScroll();
      }, 100);
    }
  }, [posts, loading]);

  const fetchSocialData = async () => {
    try {
      const response = await fetch('/api/social-feed', {
        next: { revalidate: 172800 } // Cache for 2 days
      });
      const data = await response.json();
      
      // Shuffle and distribute posts across columns
      const shuffled = [...data].sort(() => Math.random() - 0.5);
      setPosts(shuffled);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching social data:', error);
      setLoading(false);
    }
  };

  const startAutoScroll = () => {
    const scrollSpeeds = [22, 24, 20, 26, 23]; // More consistent speeds for smoother scrolling
    
    scrollContainerRefs.current.forEach((container, index) => {
      if (!container) return;
      
      let scrollPos = 0;
      const scrollSpeed = scrollSpeeds[index % scrollSpeeds.length];
      
      console.log(`Starting scroll for column ${index}, speed: ${scrollSpeed}`);
      console.log(`Column ${index} dimensions - Height: ${container.clientHeight}, ScrollHeight: ${container.scrollHeight}`);
      
      const scroll = () => {
        if (container.scrollHeight > container.clientHeight) {
          scrollPos += 0.5; // Smoother increment
          container.scrollTop = scrollPos;
          
          // Log first few scroll attempts
          if (scrollPos < 10) {
            console.log(`Column ${index} scrolling to position: ${scrollPos}, current scrollTop: ${container.scrollTop}`);
          }
          
          // Reset scroll when reaching bottom
          if (scrollPos >= container.scrollHeight - container.clientHeight) {
            scrollPos = 0;
            console.log(`Column ${index} resetting scroll position`);
          }
        } else {
          console.log(`Column ${index} has no scrollable content (height: ${container.clientHeight}, scrollHeight: ${container.scrollHeight})`);
        }
      };
      
      // Use setInterval for consistent timing
      const intervalId = setInterval(scroll, scrollSpeed);
      
      // Store interval ID for cleanup if needed
      (container as any).scrollIntervalId = intervalId;
    });
  };

  const distributePostsToColumns = (posts: SocialPost[], numColumns: number) => {
    const columns: SocialPost[][] = Array(numColumns).fill(null).map(() => []);
    
    posts.forEach((post, index) => {
      columns[index % numColumns].push(post);
    });
    
    // Duplicate posts to ensure smooth infinite scroll
    return columns.map(column => [...column, ...column]);
  };

  const formatDistance = (meters: number) => {
    const km = meters / 1000;
    return km.toFixed(1) + ' km';
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  };

  const PostCard = ({ post }: { post: SocialPost }) => {
    const handleClick = () => {
      window.open(post.content.link, '_blank', 'noopener,noreferrer');
    };

    return (
      <div 
        className="bg-white rounded-lg overflow-hidden cursor-pointer transform transition-transform hover:scale-105 shadow-md hover:shadow-lg h-fit"
        onClick={handleClick}
      >
        {post.type === 'instagram' && (
          <>
            {post.content.imageUrl && (
              <div className="relative w-full aspect-square">
                <Image
                  src={post.content.imageUrl}
                  alt="Instagram post"
                  fill
                  className="object-cover"
                  sizes="320px"
                />
                <div className="absolute top-2 right-2 bg-white rounded-full p-1.5">
                  <Instagram className="w-4 h-4 text-pink-600" />
                </div>
              </div>
            )}
            <div className="p-3">
              <p className="text-sm text-gray-700 line-clamp-2" style={{ fontFamily: 'Open Sans, sans-serif' }}>
                {post.content.caption}
              </p>
              {post.content.likes && (
                <p className="text-xs text-gray-500 mt-1">❤️ {post.content.likes.toLocaleString()}</p>
              )}
            </div>
          </>
        )}

        {post.type === 'tiktok' && (
          <>
            <div className="relative w-full aspect-[9/16]">
              {post.content.thumbnailUrl && (
                <Image
                  src={post.content.thumbnailUrl}
                  alt="TikTok thumbnail"
                  fill
                  className="object-cover"
                  sizes="320px"
                />
              )}
              <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center">
                <Play className="w-12 h-12 text-white fill-white" />
              </div>
              <div className="absolute top-2 right-2 bg-white rounded-full p-1.5">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                </svg>
              </div>
            </div>
            <div className="p-3">
              <p className="text-sm text-gray-700 line-clamp-2" style={{ fontFamily: 'Open Sans, sans-serif' }}>
                {post.content.caption}
              </p>
              {post.content.views && (
                <p className="text-xs text-gray-500 mt-1">👁 {post.content.views.toLocaleString()}</p>
              )}
            </div>
          </>
        )}

        {post.type === 'strava' && (
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <Activity className="w-5 h-5 text-orange-600" />
                <span className="font-semibold text-sm" style={{ fontFamily: 'Open Sans, sans-serif' }}>
                  {post.content.activityType}
                </span>
              </div>
              <div className="bg-orange-100 rounded-full px-2 py-1">
                <span className="text-xs text-orange-600 font-medium">Strava</span>
              </div>
            </div>
            
            <p className="text-sm text-gray-700 mb-3" style={{ fontFamily: 'Open Sans, sans-serif' }}>
              {post.content.athleteName}
            </p>
            
            <div className="grid grid-cols-3 gap-2 text-center">
              {post.content.distance && (
                <div>
                  <p className="text-xs text-gray-500">Distance</p>
                  <p className="font-semibold text-sm">{formatDistance(post.content.distance)}</p>
                </div>
              )}
              {post.content.duration && (
                <div>
                  <p className="text-xs text-gray-500">Time</p>
                  <p className="font-semibold text-sm">{formatDuration(post.content.duration)}</p>
                </div>
              )}
              {post.content.elevation && (
                <div>
                  <p className="text-xs text-gray-500">Elevation</p>
                  <p className="font-semibold text-sm">{Math.round(post.content.elevation)}m</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="w-full py-16">
        <h2 className="text-3xl font-bold text-center mb-12" style={{ fontFamily: 'Open Sans, sans-serif' }}>
          Check out our socials!
        </h2>
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      </div>
    );
  }

  const columns = distributePostsToColumns(posts, 5);

  return (
    <section className="w-full py-16 bg-yellow-50">
      <div className="container mx-auto px-4">
        <h2 className="font-bold text-deep-black text-3xl md:text-4xl lg:text-[40px] text-center whitespace-nowrap mt-0 mb-4 sm:mb-6 md:mb-8" style={{ fontFamily: 'Open Sans, sans-serif' }}>
          Check out our socials!
        </h2>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 max-h-[600px] overflow-hidden">
          {columns.map((columnPosts, columnIndex) => (
            <div
              key={columnIndex}
              ref={(el) => { scrollContainerRefs.current[columnIndex] = el; }}
              className="overflow-y-auto social-wall-column"
              style={{ 
                maxHeight: '600px',
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
                willChange: 'scroll-position',
                transform: 'translateZ(0)', // Force hardware acceleration
                scrollBehavior: 'auto'
              } as React.CSSProperties}
            >
              <div className="space-y-4">
                {columnPosts.map((post, index) => (
                  <PostCard key={`${post.id}-${index}`} post={post} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SocialWall;
