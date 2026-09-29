import type { Metadata } from 'next';
import PostgradJoinClient from './PostgradJoinClient';

export const metadata: Metadata = { title: 'UMHC | Join Postgraduate WhatsApp Group', robots: 'noindex, nofollow' };
export const dynamic = 'force-dynamic';
export default function PostgradJoinPage() { return <main className="min-h-screen bg-whellow flex items-center justify-center px-4" aria-label="Postgraduate WhatsApp group join page"><PostgradJoinClient /></main>; }