import type { Metadata } from 'next';
import PostgradVerificationForm from '@/components/PostgradVerificationForm';
export const metadata: Metadata = { title: 'UMHC | Postgraduate WhatsApp Access', robots: 'noindex, nofollow' };
export default function PostgradWhatsAppPage() { return <main className="min-h-screen bg-whellow flex items-center justify-center px-4 py-10"><PostgradVerificationForm /></main>; }