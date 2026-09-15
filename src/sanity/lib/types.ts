import type { SanityImageObject } from '@sanity/image-url';
import type { PortableTextBlock } from 'sanity';

export interface GuideImage extends SanityImageObject {
  alt?: string;
}

export interface GuideListItem {
  _id: string;
  title: string;
  description: string;
  slug: { current: string };
  mainImage: GuideImage | null;
  publishedAt: string;
}

export interface GuideDetail extends GuideListItem {
  body: PortableTextBlock[];
}
