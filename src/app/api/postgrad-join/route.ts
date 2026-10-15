import { NextRequest, NextResponse } from 'next/server';
import { getPostgradAccessToken, logPostgradEvent, markPostgradTokenAsUsed } from '@/lib/postgrad-access-tokens';
import { getPostgradWhatsAppLink } from '@/lib/edge-config';

export const dynamic = 'force-dynamic';
export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();
    if (!token || typeof token !== 'string') return NextResponse.json({ error: 'Invalid token format' }, { status: 400 });
    const tokenData = await getPostgradAccessToken(token);
    if (!tokenData) return NextResponse.json({ error: 'Invalid or expired verification token. Please request a new verification link.' }, { status: 404 });
    const whatsappLink = await getPostgradWhatsAppLink();
    if (!whatsappLink.startsWith('https://chat.whatsapp.com/')) return NextResponse.json({ error: 'WhatsApp group configuration error. Please contact the committee.' }, { status: 500 });
    await markPostgradTokenAsUsed(token);
    await logPostgradEvent(tokenData.email, tokenData.verification_method, token, 'successful_join', tokenData.phone);
    return NextResponse.json({ success: true, whatsappLink, message: 'Access verified. Redirecting to the Postgraduate WhatsApp group...' }, { headers: { 'Cache-Control': 'no-store' } });
  } catch { return NextResponse.json({ error: 'Internal server error. Please try again.' }, { status: 500 }); }
}

export async function GET() { return NextResponse.json({ error: 'Method not allowed' }, { status: 405 }); }