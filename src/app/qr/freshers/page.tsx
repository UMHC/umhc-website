import { redirect } from 'next/navigation';
import { getWhatsAppLink, isQRRedirectEnabled } from '@/lib/edge-config';

// Force dynamic rendering and no caching for real-time link updates
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function QRFreshersRedirect() {
  // Check if QR redirect is enabled
  const qrEnabled = await isQRRedirectEnabled();

  if (!qrEnabled) {
    // If QR redirect is disabled, redirect to main WhatsApp page
    redirect('/whatsapp');
  }

  // Get current WhatsApp link from Edge Config
  const whatsappLink = await getWhatsAppLink();

  if (!whatsappLink || !whatsappLink.startsWith('https://chat.whatsapp.com/')) {
    // If no valid link, redirect to main WhatsApp page
    redirect('/whatsapp');
  }

  // Direct redirect to WhatsApp group
  redirect(whatsappLink);
}