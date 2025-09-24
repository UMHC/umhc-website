import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { validateQRToken, logQRAccess } from '@/lib/qr-tokens';
import { getWhatsAppLink, isQRRedirectEnabled } from '@/lib/edge-config';

// Force dynamic rendering and no caching for security
export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface QRTokenPageProps {
  params: Promise<{
    token: string;
  }>;
}

export default async function QRTokenRedirect({ params }: QRTokenPageProps) {
  const { token } = await params;
  const headersList = await headers();
  const userAgent = headersList.get('user-agent') || undefined;
  const forwardedFor = headersList.get('x-forwarded-for');
  const realIP = headersList.get('x-real-ip');
  const clientIP = forwardedFor || realIP || undefined;

  try {
    // First check if QR redirect is globally enabled
    const qrGloballyEnabled = await isQRRedirectEnabled();

    if (!qrGloballyEnabled) {
      // Log the blocked access
      await logQRAccess(token, 'qr_disabled_globally', clientIP, userAgent);
      redirect('/whatsapp?message=qr_disabled');
    }

    // Validate the specific QR token
    const validation = await validateQRToken(token);

    if (!validation.valid) {
      // Log the failed access attempt
      const status = validation.reason === 'token_not_found' ? 'token_not_found' : 'token_disabled';
      await logQRAccess(token, status, clientIP, userAgent);

      if (validation.reason === 'token_not_found') {
        redirect('/whatsapp?message=qr_invalid');
      } else {
        redirect('/whatsapp?message=qr_token_disabled');
      }
    }

    // Get current WhatsApp link
    const whatsappLink = await getWhatsAppLink();

    if (!whatsappLink || !whatsappLink.startsWith('https://chat.whatsapp.com/')) {
      // Log the access attempt but note that link is invalid
      await logQRAccess(token, 'successful_redirect', clientIP, userAgent);
      redirect('/whatsapp?message=link_unavailable');
    }

    // Log successful access
    await logQRAccess(token, 'successful_redirect', clientIP, userAgent);

    // Successful redirect to WhatsApp group
    redirect(whatsappLink);

  } catch (error) {
    // Check if this is a Next.js redirect (which is expected behavior)
    if (error && typeof error === 'object' && 'digest' in error &&
        typeof error.digest === 'string' && error.digest.includes('NEXT_REDIRECT')) {
      // This is a successful redirect, let it continue
      throw error;
    }

    console.error('QR token redirect error:', error);
    // Log the error but don't expose details
    await logQRAccess(token, 'token_not_found', clientIP, userAgent);
    redirect('/whatsapp?message=qr_error');
  }
}