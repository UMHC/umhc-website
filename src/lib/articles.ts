import { client, hasSanityConfig } from '@/sanity/lib/client';
import { ARTICLE_BY_SLUG_QUERY, ARTICLE_SLUGS_QUERY } from '@/sanity/lib/queries';
import type { Article } from '@/sanity/lib/types';

export async function getArticle(slug: string) {
  if (!hasSanityConfig || !client) return null;
  try {
    return await client.fetch<Article | null>(ARTICLE_BY_SLUG_QUERY, { slug });
  } catch {
    return null;
  }
}

export async function getArticleSlugs() {
  if (!hasSanityConfig || !client) return [];
  try {
    return await client.fetch<string[]>(ARTICLE_SLUGS_QUERY);
  } catch {
    return [];
  }
}