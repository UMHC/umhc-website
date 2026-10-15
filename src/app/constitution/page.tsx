import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getArticle } from '@/lib/articles';
import ArticlePage from '@/components/ArticlePage';

export const metadata: Metadata = {
  title: 'UMHC | Constitution',
  description: 'The University of Manchester Hiking Club constitution.',
};

export const revalidate = 60;

export default async function ConstitutionPage() {
  const article = await getArticle('constitution');
  if (!article) notFound();
  return <ArticlePage article={article} centered />;
}