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
  const scrollIntervalIds = useRef<NodeJS.Timeout[]>([]);

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
    
    // Cleanup intervals on unmount
    return () => {
      scrollIntervalIds.current.forEach(id => clearInterval(id));
    };
  }, [posts, loading]);

  const fetchSocialData = async () => {
    try {
      const response = await fetch('/api/social-feed', {
        next: { revalidate: 172800 } // Cache for 2 days
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Check if data is valid and not empty
      if (!data || !Array.isArray(data) || data.length === 0) {
        console.warn('API returned empty or invalid data, using cached content');
        loadCachedData();
        return;
      }
      
      // Shuffle and distribute posts across columns
      const shuffled = [...data].sort(() => Math.random() - 0.5);
      setPosts(shuffled);
      
      // Cache the successful data
      cacheData(shuffled);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching social data:', error);
      console.log('Attempting to load cached data...');
      loadCachedData();
    }
  };

  const cacheData = (data: SocialPost[]) => {
    try {
      const cacheItem = {
        data,
        timestamp: Date.now(),
        expiry: Date.now() + (2 * 24 * 60 * 60 * 1000) // 2 days
      };
      localStorage.setItem('socialWallCache', JSON.stringify(cacheItem));
    } catch (error) {
      console.error('Error caching social data:', error);
    }
  };

  const loadCachedData = () => {
    try {
      const cachedItem = localStorage.getItem('socialWallCache');
      if (cachedItem) {
        const { data, expiry } = JSON.parse(cachedItem);
        
        // Check if cache is still valid
        if (Date.now() < expiry && data && Array.isArray(data) && data.length > 0) {
          console.log('Loading cached social data');
          setPosts(data);
          setLoading(false);
          return;
        } else {
          console.log('Cached data expired or invalid');
          localStorage.removeItem('socialWallCache');
        }
      }
      
      // If no valid cache, use fallback data
      console.log('No valid cache found, using fallback data');
      loadFallbackData();
    } catch (error) {
      console.error('Error loading cached data:', error);
      loadFallbackData();
    }
  };

  const loadFallbackData = () => {
    // Fallback data in case everything fails
    const fallbackPosts: SocialPost[] = [
      {
        id: 'fallback-1',
        type: 'instagram',
        content: {
          imageUrl: '/images/umhc-badge.webp',
          caption: 'Follow us on Instagram for the latest updates!',
          link: 'https://instagram.com/_umhc_/',
          timestamp: new Date().toISOString()
        }
      },
      {
        id: 'fallback-2',
        type: 'strava',
        content: {
          activityType: 'Hike',
          athleteName: 'UMHC Member',
          distance: 12000,
          duration: 14400,
          elevation: 800,
          link: 'https://strava.com',
          timestamp: new Date().toISOString()
        }
      }
    ];
    
    setPosts(fallbackPosts);
    setLoading(false);
  };

  const startAutoScroll = () => {
    const scrollSpeeds = [22, 24, 20, 26, 23]; // More consistent speeds for smoother scrolling
    
    // Clear existing intervals
    scrollIntervalIds.current.forEach(id => clearInterval(id));
    scrollIntervalIds.current = [];
    
    scrollContainerRefs.current.forEach((contentDiv, index) => {
      if (!contentDiv) return;
      
      let translateY = 0;
      const scrollSpeed = scrollSpeeds[index % scrollSpeeds.length];
      const parentContainer = contentDiv.parentElement;
      
      if (!parentContainer) return;
      
      console.log(`Starting scroll for column ${index}, speed: ${scrollSpeed}`);
      
      const scroll = () => {
        const containerHeight = parentContainer.clientHeight;
        const contentHeight = contentDiv.scrollHeight;
        
        if (contentHeight > containerHeight) {
          translateY += 0.5; // Smoother increment
          
          // Reset when content has scrolled completely out of view
          if (translateY >= contentHeight) {
            translateY = 0;
            console.log(`Column ${index} resetting scroll position`);
          }
          
          // Apply transform to move content up
          contentDiv.style.transform = `translateY(-${translateY}px)`;
          
          // Log first few scroll attempts
          if (translateY < 10) {
            console.log(`Column ${index} scrolling to position: ${translateY}`);
          }
        } else {
          console.log(`Column ${index} has no scrollable content (height: ${containerHeight}, contentHeight: ${contentHeight})`);
        }
      };
      
      // Use setInterval for consistent timing
      const intervalId = setInterval(scroll, scrollSpeed);
      scrollIntervalIds.current.push(intervalId);
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
    <section className="w-full py-16 bg-whellow">
      <div className="container mx-auto px-4">
        <h2 className="font-bold text-deep-black text-3xl md:text-4xl lg:text-[40px] text-center whitespace-nowrap mt-0 mb-4 sm:mb-6 md:mb-8" style={{ fontFamily: 'Open Sans, sans-serif' }}>
          Check out our socials!
        </h2>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 max-h-[600px] overflow-hidden">
          {columns.map((columnPosts, columnIndex) => (
            <div
              key={columnIndex}
              className="social-wall-column"
              style={{ 
                maxHeight: '600px',
                overflow: 'hidden',
                position: 'relative'
              } as React.CSSProperties}
            >
              <div
                ref={(el) => { scrollContainerRefs.current[columnIndex] = el; }}
                className="space-y-4"
                style={{ 
                  transform: 'translateY(0px)',
                  transition: 'none'
                } as React.CSSProperties}
              >
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
