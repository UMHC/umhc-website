import { NextRequest, NextResponse } from 'next/server';
import { getToken } from '@/lib/tokenStore';

interface RedirectRequest {
  shortCode: string;
}

// Global short code store (fallback if database doesn't exist)
declare global {
  var shortCodeStore: Map<string, { token: string; email: string; expiresAt: number }> | undefined;
}

export async function POST(request: NextRequest) {
  try {
    const body: RedirectRequest = await request.json();
    const { shortCode } = body;

    // Validate short code format (12 hex characters)
    if (!shortCode || !/^[a-f0-9]{12}$/.test(shortCode)) {
      return NextResponse.json(
        { error: 'Sorry, this link didn\'t work. Please use the 6-digit verification code from your email instead.' },
        { status: 400 }
      );
    }

    // Look up the short code in memory store
    if (!global.shortCodeStore) {
      return NextResponse.json(
        { error: 'Sorry, this link didn\'t work. Please use the 6-digit verification code from your email instead.' },
        { status: 400 }
      );
    }

    const shortCodeData = global.shortCodeStore.get(shortCode);
    if (!shortCodeData) {
      return NextResponse.json(
        { error: 'Sorry, this link didn\'t work. Please use the 6-digit verification code from your email instead.' },
        { status: 400 }
      );
    }

    // Check if code is expired
    if (Date.now() > shortCodeData.expiresAt) {
      // Clean up expired code
      global.shortCodeStore.delete(shortCode);
      return NextResponse.json(
        { error: 'Sorry, this link didn\'t work. Please use the 6-digit verification code from your email instead.' },
        { status: 400 }
      );
    }

    // Verify the associated token is still valid
    const tokenData = await getToken(shortCodeData.token);
    if (!tokenData) {
      // Clean up invalid short code
      global.shortCodeStore.delete(shortCode);
      return NextResponse.json(
        { error: 'Sorry, this link didn\'t work. Please use the 6-digit verification code from your email instead.' },
        { status: 400 }
      );
    }

    // Remove short code (single use) but keep token for manual verification
    global.shortCodeStore.delete(shortCode);

    // Get WhatsApp group link
    const whatsappLink = process.env.WHATSAPP_GROUP_LINK;
    if (!whatsappLink) {
      console.error('WHATSAPP_GROUP_LINK not configured');
      return NextResponse.json(
        { error: 'Sorry, this link didn\'t work. Please use the 6-digit verification code from your email instead.' },
        { status: 400 }
      );
    }

    // Log successful verification for security monitoring
    const emailHash = shortCodeData.email.replace(/(.{2}).*(@.*)/, '$1***$2');

    if (process.env.NODE_ENV === 'development') {
      console.log(`WhatsApp short code used: ${emailHash} at ${new Date().toISOString()}`);
    }

    return NextResponse.json({
      success: true,
      whatsappUrl: whatsappLink,
      message: 'Verification successful'
    });

  } catch (error) {
    console.error('Short code verification API error:', error);
    return NextResponse.json(
      { error: 'Sorry, this link didn\'t work. Please use the 6-digit verification code from your email instead.' },
      { status: 400 }
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