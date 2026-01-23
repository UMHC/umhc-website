// Banner message management using Edge Config
import { get } from '@vercel/edge-config';
import { unstable_cache } from 'next/cache';

export interface BannerMessage {
  text: string;
  order: number;
}

// Cached function to get banner messages
const getCachedBannerMessages = unstable_cache(
  async () => {
    const messages = await get('banner_messages');
    return messages;
  },
  ['banner-messages'],
  {
    revalidate: 1200, // 20 minutes
    tags: ['banner-messages']
  }
);

/**
 * Get banner messages from Edge Config
 * Returns empty array if no messages or Edge Config is unavailable
 */
export async function getBannerMessages(): Promise<BannerMessage[]> {
  try {
    const messages = await getCachedBannerMessages();

    if (Array.isArray(messages) && messages.length > 0) {
      // Validate the structure
      const validMessages: BannerMessage[] = [];
      
      for (const msg of messages) {
        if (
          typeof msg === 'object' &&
          msg !== null &&
          'text' in msg &&
          'order' in msg
        ) {
          const msgUnknown = msg as Record<string, unknown>;
          if (
            typeof msgUnknown.text === 'string' &&
            typeof msgUnknown.order === 'number'
          ) {
            validMessages.push({
              text: msgUnknown.text,
              order: msgUnknown.order
            });
          }
        }
      }

      if (validMessages.length > 0) {
        // Sort by order
        return validMessages.sort((a, b) => a.order - b.order);
      }
    }

    // Return empty array if no valid messages or if intentionally hidden
    return [];
  } catch (error) {
    console.warn('Failed to get banner messages from Edge Config:', error);
    // Return empty array on error - banner will be hidden
    return [];
  }
}
