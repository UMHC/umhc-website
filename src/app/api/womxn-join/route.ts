import { NextRequest, NextResponse } from 'next/server';
import { getWomxnAccessToken, markWomxnTokenAsUsed, logWomxnAccess } from '@/lib/womxn-access-tokens';
import { getWomxnWhatsAppLink } from '@/lib/edge-config';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(request: NextRequest) {
  const headers = {
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0',
  };

  try {
    const body = await request.json();
    const { token } = body;

    if (!token || typeof token !== 'string') {
      return NextResponse.json({ error: 'Invalid token format' }, { status: 400, headers });
    }

    const tokenData = await getWomxnAccessToken(token);
    if (!tokenData) {
      return NextResponse.json(
        { error: 'Invalid or expired verification token. Please request a new verification link.' },
        { status: 404, headers }
      );
    }

    if (tokenData.status === 'used') {
      return NextResponse.json(
        { error: 'This verification link has already been used. Each link can only be used once.' },
        { status: 400, headers }
      );
    }

    const whatsappLink = await getWomxnWhatsAppLink();
    if (!whatsappLink || !whatsappLink.startsWith('https://chat.whatsapp.com/')) {
      console.error('Invalid Womxn WhatsApp link configuration');
      return NextResponse.json(
        { error: 'WhatsApp group configuration error. Please contact the committee.' },
        { status: 500, headers }
      );
    }

    await markWomxnTokenAsUsed(token);

    const clientIP =
      request.headers.get('x-forwarded-for') ||
      request.headers.get('x-real-ip') ||
      'unknown';

    await logWomxnAccess(
      tokenData.email,
      tokenData.verification_method,
      token,
      clientIP,
      tokenData.phone
    );

    const emailMasked = tokenData.email.replace(/(.{2}).*(@.*)/, '$1***$2');
    console.log(`Womxn WhatsApp access granted: ${emailMasked} via ${tokenData.verification_method} at ${new Date().toISOString()}`);

    return NextResponse.json(
      { success: true, whatsappLink, message: 'Access verified. Redirecting to Womxn WhatsApp group...' },
      { headers }
    );
  } catch (error) {
    console.error('Womxn join API error:', error);
    return NextResponse.json({ error: 'Internal server error. Please try again.' }, { status: 500, headers });
  }
}

export async function GET() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}
