import { NextRequest, NextResponse } from 'next/server';
import { getAccessToken, markTokenAsUsed, logAccess } from '@/lib/access-tokens';
import { getWhatsAppLink } from '@/lib/edge-config';

interface JoinRequest {
  token: string;
}

// Add no-cache headers for security
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// POST - Verify token and return WhatsApp link
export async function POST(request: NextRequest) {
  // Set no-cache headers
  const headers = {
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0',
  };

  try {
    const body: JoinRequest = await request.json();
    const { token } = body;

    if (!token || typeof token !== 'string') {
      return NextResponse.json(
        { error: 'Invalid token format' },
        { status: 400, headers }
      );
    }

    // Get token data from database
    const tokenData = await getAccessToken(token);

    if (!tokenData) {
      return NextResponse.json(
        { error: 'Invalid or expired verification token. Please request a new verification link.' },
        { status: 404, headers }
      );
    }

    // Check if token is already used
    if (tokenData.status === 'used') {
      return NextResponse.json(
        { error: 'This verification link has already been used. Each link can only be used once.' },
        { status: 400, headers }
      );
    }

    // Get current WhatsApp link from Edge Config
    const whatsappLink = await getWhatsAppLink();

    if (!whatsappLink || !whatsappLink.startsWith('https://chat.whatsapp.com/')) {
      console.error('Invalid WhatsApp link configuration');
      return NextResponse.json(
        { error: 'WhatsApp group configuration error. Please contact the committee.' },
        { status: 500, headers }
      );
    }

    // Mark token as used
    const tokenMarked = await markTokenAsUsed(token);
    if (!tokenMarked) {
      console.error('Failed to mark token as used:', token);
      // Continue anyway - user should still get access
    }

    // Log successful access
    const clientIP = request.headers.get('x-forwarded-for') ||
                    request.headers.get('x-real-ip') ||
                    'unknown';

    const accessLogged = await logAccess(
      tokenData.email,
      tokenData.verification_method,
      token,
      clientIP,
      tokenData.phone
    );

    if (!accessLogged) {
      console.warn('Failed to log access for token:', token);
      // Continue anyway - logging failure shouldn't block access
    }

    // Log successful verification for monitoring
    const emailMasked = tokenData.email.replace(/(.{2}).*(@.*)/, '$1***$2');
    console.log(`WhatsApp access granted: ${emailMasked} via ${tokenData.verification_method} at ${new Date().toISOString()}`);

    return NextResponse.json({
      success: true,
      whatsappLink,
      message: 'Access verified. Redirecting to WhatsApp group...'
    }, { headers });

  } catch (error) {
    console.error('Join API error:', error);
    return NextResponse.json(
      { error: 'Internal server error. Please try again.' },
      { status: 500, headers }
    );
  }
}

// Handle unsupported methods
export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}