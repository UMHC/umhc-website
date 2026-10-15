import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getArticle, getArticleSlugs } from '@/lib/articles';
import ArticlePage from '@/components/ArticlePage';

export const revalidate = 60;

export async function generateStaticParams() {
  return (await getArticleSlugs()).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const article = await getArticle((await params).slug);
  return article ? { title: `UMHC | ${article.title}`, description: article.description } : { title: 'UMHC | Article not found' };
}

export default async function ArticleRoute({ params }: { params: Promise<{ slug: string }> }) {
  const article = await getArticle((await params).slug);
  if (!article) notFound();
  return <ArticlePage article={article} />;
}