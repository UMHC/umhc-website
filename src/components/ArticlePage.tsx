import type { Article } from '@/sanity/lib/types';
import GuideBody from '@/components/GuideBody';

export default function ArticlePage({
  article,
  centered = false,
}: {
  article: Article;
  centered?: boolean;
}) {
  const formattedDate = article.publishedAt
    ? new Date(article.publishedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
    : null;

  return (
    <div className="bg-cream-white min-h-screen">
      <div className={`${centered ? 'max-w-5xl' : 'max-w-4xl'} mx-auto px-4 sm:px-6 lg:px-8 pt-16 sm:pt-20 pb-12 sm:pb-16`}>
        <article>
          <header className={`${centered ? 'text-center' : ''} mb-10`}>
            <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-deep-black leading-tight font-sans">{article.title}</h1>
            {formattedDate && <p className="mt-4 text-xs sm:text-sm text-slate-grey font-sans">Updated <time dateTime={article.publishedAt}>{formattedDate}</time></p>}
          </header>
          <div className={centered ? 'max-w-4xl mx-auto' : undefined}>
            <GuideBody value={article.body} />
          </div>
        </article>
      </div>
    </div>
  );
}