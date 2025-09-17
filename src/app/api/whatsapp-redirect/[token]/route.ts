import { NextRequest, NextResponse } from 'next/server';
import { getToken, deleteToken } from '@/lib/tokenStore';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    const body = await request.json();
    
    if (!token) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 400 }
      );
    }
    
    // Additional timing verification to prevent replay attacks
    const timestamp = body.timestamp;
    const now = Date.now();
    const timeDiff = Math.abs(now - timestamp);
    
    // Request must be made within 10 seconds of timestamp
    if (timeDiff > 10000) {
      return NextResponse.json(
        { error: 'Request expired' },
        { status: 400 }
      );
    }
    
    // Verify token exists and was already marked as used by the first API call
    const tokenData = await getToken(token);

    if (!tokenData || !tokenData.used) {
      return NextResponse.json(
        { error: 'Invalid or unused token' },
        { status: 400 }
      );
    }
    
    // Get WhatsApp link
    const whatsappLink = process.env.WHATSAPP_GROUP_LINK;
    if (!whatsappLink) {
      console.error('WHATSAPP_GROUP_LINK not configured');
      return NextResponse.json(
        { error: 'Configuration error' },
        { status: 500 }
      );
    }
    
    // Clean up token after providing the link (single use)
    await deleteToken(token);
    
    // Add additional obfuscation by base64 encoding the URL
    const obfuscatedUrl = Buffer.from(whatsappLink).toString('base64');
    
    // Return obfuscated URL that gets decoded client-side
    return NextResponse.json({
      success: true,
      encodedUrl: obfuscatedUrl
    });
    
  } catch (error) {
    console.error('Redirect API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
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