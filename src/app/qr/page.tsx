import { redirect } from 'next/navigation';

// Force dynamic rendering and no caching for real-time link updates
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function QRRedirect() {
  // Legacy QR route - redirect to main WhatsApp page with message
  // New token-based QR codes use /qr/[token] format
  redirect('/whatsapp?message=qr_deprecated');
}