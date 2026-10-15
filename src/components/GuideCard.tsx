import Image from 'next/image';
import Link from 'next/link';
import { ArrowRightIcon } from '@heroicons/react/24/outline';
import { urlForImage } from '@/sanity/lib/image';
import type { GuideImage } from '@/sanity/lib/types';

interface GuideCardProps {
  title: string;
  description: string;
  image: GuideImage | null;
  slug: string;
  publishedAt?: string;
}

export default function GuideCard({
  title,
  description,
  image,
  slug,
  publishedAt,
}: GuideCardProps) {
  const formattedDate = publishedAt
    ? new Date(publishedAt).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : null;

  return (
    <Link
      href={`/guides/${slug}`}
      className="group block rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-umhc-green focus-visible:ring-offset-2"
      aria-label={`Read guide: ${title}`}
    >
      <article className="flex flex-col sm:flex-row bg-whellow border border-slate-grey/10 rounded-2xl overflow-hidden shadow-sm transition-all duration-300 group-hover:shadow-lg group-hover:border-umhc-green/25">
        {/* Image */}
        <div className="relative w-full aspect-[16/10] sm:aspect-auto sm:w-[38%] sm:min-h-[260px] shrink-0 overflow-hidden bg-cream-white">
          {image && (
            <Image
              src={urlForImage(image).width(800).height(700).fit('crop').url()}
              alt={image.alt || `Cover image for the guide: ${title}`}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, 38vw"
            />
          )}
          {/* Accent bar tying the card to the UMHC palette */}
          <div className="absolute inset-x-0 bottom-0 h-1 bg-earth-orange sm:inset-y-0 sm:left-auto sm:right-0 sm:h-auto sm:w-1" />
        </div>

        {/* Content */}
        <div className="flex flex-1 flex-col p-5 sm:p-6 lg:p-8">
          <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-deep-black font-sans leading-tight transition-colors duration-200 group-hover:text-umhc-green">
            {title}
          </h2>

          <p className="mt-3 text-sm sm:text-base text-slate-grey font-medium font-sans leading-relaxed line-clamp-3 lg:line-clamp-4">
            {description}
          </p>

          {/* Footer row pinned to the bottom on wider screens */}
          <div className="mt-5 sm:mt-auto sm:pt-6 flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
            {formattedDate ? (
              <time
                dateTime={publishedAt}
                className="text-xs sm:text-sm text-slate-grey/80 font-sans"
              >
                {formattedDate}
              </time>
            ) : (
              <span aria-hidden="true" />
            )}

            <span className="inline-flex items-center gap-2 text-sm font-semibold text-umhc-green font-sans transition-colors duration-200 group-hover:text-stealth-green">
              Read full guide
              <ArrowRightIcon
                className="w-4 h-4 stroke-[2.5] transition-transform duration-200 group-hover:translate-x-1"
                aria-hidden="true"
              />
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}
