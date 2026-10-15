import { defineQuery } from 'next-sanity';

export const GUIDES_LIST_QUERY = defineQuery(`
  *[_type == "guide" && defined(slug.current)] | order(publishedAt desc) {
    _id,
    title,
    description,
    slug,
    mainImage,
    publishedAt
  }
`);

export const GUIDE_BY_SLUG_QUERY = defineQuery(`
  *[_type == "guide" && slug.current == $slug][0] {
    _id,
    title,
    description,
    slug,
    mainImage,
    body,
    publishedAt
  }
`);

export const GUIDE_SLUGS_QUERY = defineQuery(`
  *[_type == "guide" && defined(slug.current)][].slug.current
`);

export const ARTICLE_BY_SLUG_QUERY = defineQuery(`
  *[_type == "article" && slug.current == $slug][0] {
    _id, title, description, slug, body, publishedAt
  }
`);

export const ARTICLE_SLUGS_QUERY = defineQuery(`
  *[_type == "article" && defined(slug.current)][].slug.current
`);
