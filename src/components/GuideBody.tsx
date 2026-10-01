import Image from 'next/image';
import { PortableText, type PortableTextComponents } from '@portabletext/react';
import type { PortableTextBlock } from 'sanity';
import { urlForImage } from '@/sanity/lib/image';

// Sanity encodes an asset's pixel dimensions in its reference id, e.g.
// "image-abc123...-4032x3024-jpg". Reading them lets in-body images render at
// their natural aspect ratio (uncropped) while still reserving the right amount
// of space up front, so there's no layout shift as they load.
function getImageDimensions(ref: string | undefined) {
  const match = ref?.match(/-(\d+)x(\d+)-[a-z]+$/);
  if (!match) return null;
  return { width: Number(match[1]), height: Number(match[2]) };
}

function getYouTubeId(url: string | undefined) {
  return (
    url?.match(
      /(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/
    )?.[1] ?? null
  );
}

// Written out in full so Tailwind's scanner picks the classes up - it can't
// resolve column counts built by string concatenation.
const GALLERY_COLUMNS: Record<number, string> = {
  2: 'grid-cols-2',
  3: 'grid-cols-2 sm:grid-cols-3',
  4: 'grid-cols-2 sm:grid-cols-4',
};

// The site doesn't use @tailwindcss/typography, so every element is styled
// explicitly with UMHC tokens to match the rest of the pages.
const components: PortableTextComponents = {
  block: {
    normal: ({ children }) => (
      <p className="text-base text-deep-black font-medium font-sans leading-relaxed mb-5">
        {children}
      </p>
    ),
    // clear-both so a new section always starts below a floated image rather
    // than squeezing into the column beside it.
    h2: ({ children }) => (
      <h2 className="clear-both text-lg sm:text-xl md:text-2xl font-bold text-black font-sans leading-tight pt-4 mt-10 mb-3">
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className="text-base sm:text-lg md:text-xl font-semibold text-black font-sans leading-tight mt-8 mb-2">
        {children}
      </h3>
    ),
    h4: ({ children }) => (
      <h4 className="text-base sm:text-lg font-medium text-black font-sans leading-tight mt-6 mb-2">
        {children}
      </h4>
    ),
    blockquote: ({ children }) => (
      <blockquote className="border-l-4 border-earth-orange bg-whellow rounded-r-2xl pl-5 pr-4 py-4 my-6 text-base text-slate-grey font-medium font-sans leading-relaxed italic">
        {children}
      </blockquote>
    ),
  },
  list: {
    bullet: ({ children }) => (
      <ul className="text-base text-deep-black font-medium font-sans leading-relaxed list-disc pl-6 space-y-2 mb-5">
        {children}
      </ul>
    ),
    number: ({ children }) => (
      <ol className="text-base text-deep-black font-medium font-sans leading-relaxed list-decimal pl-6 space-y-2 mb-5">
        {children}
      </ol>
    ),
  },
  marks: {
    strong: ({ children }) => <strong className="font-bold">{children}</strong>,
    em: ({ children }) => <em className="italic">{children}</em>,
    code: ({ children }) => (
      <code className="bg-whellow border border-slate-grey/20 rounded px-1.5 py-0.5 text-sm font-mono">
        {children}
      </code>
    ),
    link: ({ children, value }) => {
      const href = value?.href ?? '#';
      const isExternal = /^https?:\/\//.test(href);

      return (
        <a
          href={href}
          {...(isExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
          className="text-umhc-green hover:text-stealth-green underline font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-umhc-green focus-visible:ring-offset-2 rounded"
        >
          {children}
        </a>
      );
    },
  },
  types: {
    image: ({ value }) => {
      const dimensions = getImageDimensions(value?.asset?._ref);
      const placement: string = value?.placement ?? 'full';
      const isWrapped = placement === 'left' || placement === 'right';

      // Wrapped images only float from sm up - in a phone-width column a float
      // leaves unreadable slivers of text, so they go full width there instead.
      // clear-both stops consecutive wrapped images sitting beside each other.
      const figureClass = isWrapped
        ? placement === 'left'
          ? 'my-6 sm:my-2 sm:clear-both sm:float-left sm:mr-6 sm:mb-4 sm:w-[45%] sm:max-w-[330px]'
          : 'my-6 sm:my-2 sm:clear-both sm:float-right sm:ml-6 sm:mb-4 sm:w-[45%] sm:max-w-[330px]'
        : 'clear-both my-8';

      const imageSizes = isWrapped
        ? '(max-width: 640px) 100vw, 330px'
        : '(max-width: 768px) 100vw, 768px';
      const requestWidth = isWrapped ? 900 : 1400;

      // Without dimensions we can't know the ratio ahead of time, so fall back to
      // a contained image in a fixed box - still uncropped, just letterboxed.
      if (!dimensions) {
        return (
          <figure className={figureClass}>
            <div className="relative w-full aspect-[16/9]">
              <Image
                src={urlForImage(value).width(requestWidth).fit('max').url()}
                alt={value.alt ?? ''}
                fill
                className="object-contain rounded-2xl"
                sizes={imageSizes}
              />
            </div>
          </figure>
        );
      }

      return (
        <figure className={figureClass}>
          <Image
            src={urlForImage(value).width(requestWidth).fit('max').url()}
            alt={value.alt ?? ''}
            width={dimensions.width}
            height={dimensions.height}
            className="w-full h-auto rounded-2xl shadow-lg"
            sizes={imageSizes}
          />
        </figure>
      );
    },

    // A row of images across the full column width. These share a uniform
    // aspect ratio so the row lines up, unlike single in-body images.
    imageGallery: ({ value }) => {
      const images: Array<{ alt?: string } & Record<string, unknown>> =
        value?.images ?? [];
      if (images.length === 0) return null;

      return (
        <figure className="clear-both my-8">
          <div
            className={`grid gap-3 sm:gap-4 ${
              GALLERY_COLUMNS[images.length] ?? 'grid-cols-2 sm:grid-cols-3'
            }`}
          >
            {images.map((img, i) => (
              <div
                key={i}
                className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-lg"
              >
                <Image
                  src={urlForImage(img).width(800).height(600).fit('crop').url()}
                  alt={img.alt ?? ''}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 50vw, 33vw"
                />
              </div>
            ))}
          </div>
        </figure>
      );
    },

    youtube: ({ value }) => {
      const id = getYouTubeId(value?.url);
      if (!id) return null;

      return (
        <figure className="clear-both my-8">
          <div className="relative w-full aspect-video rounded-2xl overflow-hidden shadow-lg bg-deep-black">
            <iframe
              // nocookie domain so viewers aren't tracked before they hit play
              src={`https://www.youtube-nocookie.com/embed/${id}`}
              title={value?.title ?? 'YouTube video'}
              allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              loading="lazy"
              className="absolute inset-0 w-full h-full border-0"
            />
          </div>
        </figure>
      );
    },
  },
};

export default function GuideBody({ value }: { value: PortableTextBlock[] }) {
  return (
    <div className="font-sans text-deep-black">
      <PortableText value={value} components={components} />
      {/* Contain any trailing floated image so it can't overlap what follows */}
      <div className="clear-both" />
    </div>
  );
}
