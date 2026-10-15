import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { client, hasSanityConfig } from '@/sanity/lib/client';
import { urlForImage } from '@/sanity/lib/image';
import { GUIDE_BY_SLUG_QUERY, GUIDE_SLUGS_QUERY } from '@/sanity/lib/queries';
import type { GuideDetail } from '@/sanity/lib/types';
import GuideBody from '@/components/GuideBody';

export const revalidate = 60;

export async function generateStaticParams() {
  if (!hasSanityConfig || !client) {
    return [];
  }

  try {
    const slugs = await client.fetch<string[]>(GUIDE_SLUGS_QUERY);
    return slugs.map((slug) => ({ slug }));
  } catch {
    return [];
  }
}

async function getGuide(slug: string) {
  if (!hasSanityConfig || !client) {
    return null;
  }

  try {
    return await client.fetch<GuideDetail | null>(GUIDE_BY_SLUG_QUERY, { slug });
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  if (!hasSanityConfig || !client) {
    return { title: 'UMHC | Guides' };
  }

  const { slug } = await params;
  const guide = await getGuide(slug);

  if (!guide) {
    return { title: 'UMHC | Guide not found' };
  }

  const ogImage = guide.mainImage
    ? urlForImage(guide.mainImage).width(1200).height(630).fit('crop').url()
    : undefined;

  return {
    title: `UMHC | ${guide.title}`,
    description: guide.description,
    openGraph: {
      title: guide.title,
      description: guide.description,
      type: 'article',
      images: ogImage ? [ogImage] : undefined,
    },
  };
}

export default async function GuidePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  if (!hasSanityConfig || !client) {
    notFound();
  }

  const { slug } = await params;
  const guide = await getGuide(slug);

  if (!guide) {
    notFound();
  }

  const heroImageUrl = guide.mainImage
    ? urlForImage(guide.mainImage).width(1600).height(900).fit('crop').url()
    : undefined;

  const formattedDate = guide.publishedAt
    ? new Date(guide.publishedAt).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : null;

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: guide.title,
    description: guide.description,
    image: heroImageUrl ? [heroImageUrl] : undefined,
    datePublished: guide.publishedAt,
    publisher: {
      '@type': 'Organization',
      name: 'University of Manchester Hiking Club',
      url: 'https://umhc.org.uk',
    },
  };

  return (
    <div className="bg-cream-white min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 sm:pt-20 pb-12 sm:pb-16">
        {/* Back to all guides */}
        <Link
          href="/guides"
          className="inline-flex items-center gap-2 text-sm font-semibold text-umhc-green hover:text-stealth-green transition-colors font-sans mb-6 focus:outline-none focus-visible:ring-2 focus-visible:ring-umhc-green focus-visible:ring-offset-2 rounded group"
        >
          <ArrowLeftIcon
            className="w-4 h-4 stroke-[2.5] group-hover:-translate-x-1 transition-transform duration-200"
            aria-hidden="true"
          />
          All guides
        </Link>

        <article>
          {/* Hero image */}
          {heroImageUrl && (
            <div className="relative w-full aspect-[16/9] rounded-2xl overflow-hidden shadow-lg mb-8">
              <Image
                src={heroImageUrl}
                alt={guide.mainImage?.alt ?? ''}
                fill
                priority
                className="object-cover"
                sizes="(max-width: 896px) 100vw, 896px"
              />
            </div>
          )}

          {/* Title block */}
          <header className="mb-10">
            <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-deep-black leading-tight font-sans">
              {guide.title}
            </h1>

            {guide.description && (
              <p className="mt-3 text-sm sm:text-base text-slate-grey font-medium font-sans leading-relaxed">
                {guide.description}
              </p>
            )}

            {formattedDate && (
              <p className="mt-4 text-xs sm:text-sm text-slate-grey font-sans">
                Published{' '}
                <time dateTime={guide.publishedAt}>{formattedDate}</time>
              </p>
            )}
          </header>

          {/* Guide content */}
          {guide.body && <GuideBody value={guide.body} />}
        </article>

        {/* Footer nav */}
        <div className="mt-12 pt-8 border-t border-slate-grey/15">
          <Link
            href="/guides"
            className="inline-flex items-center gap-2 text-sm font-semibold text-umhc-green hover:text-stealth-green transition-colors font-sans focus:outline-none focus-visible:ring-2 focus-visible:ring-umhc-green focus-visible:ring-offset-2 rounded group"
          >
            <ArrowLeftIcon
              className="w-4 h-4 stroke-[2.5] group-hover:-translate-x-1 transition-transform duration-200"
              aria-hidden="true"
            />
            Back to all guides
          </Link>
        </div>
      </div>
    </div>
  );
}
