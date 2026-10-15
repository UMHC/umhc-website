import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getArticle } from '@/lib/articles';
import ArticlePage from '@/components/ArticlePage';

export const metadata: Metadata = {
  title: 'UMHC | Code of Conduct',
  description: 'The University of Manchester Hiking Club code of conduct.',
};

export const revalidate = 60;

export default async function CodeOfConductPage() {
  const article = await getArticle('code-of-conduct');
  if (!article) notFound();
  return <ArticlePage article={article} centered />;
}