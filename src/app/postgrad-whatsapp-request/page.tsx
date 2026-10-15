import type { Metadata } from 'next';
import PostgradManualRequestForm from '@/components/PostgradManualRequestForm';
export const metadata: Metadata = { title: 'UMHC | Postgraduate WhatsApp Access Request', robots: 'noindex, nofollow' };
export default function PostgradWhatsAppRequestPage() { return <main className="min-h-screen bg-whellow flex items-center justify-center px-4 py-10 pt-28 sm:pt-32"><PostgradManualRequestForm /></main>; }