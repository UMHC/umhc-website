import { NextRequest, NextResponse } from 'next/server';
import { tokenStore, cleanupExpiredTokens } from '@/lib/tokenStore';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    
    if (!token) {
      return NextResponse.redirect(new URL('/verification-failed', request.url));
    }
    
    // Clean up expired tokens first
    cleanupExpiredTokens();
    
    // Check if token exists and is valid
    const tokenData = tokenStore.get(token);
    
    if (!tokenData) {
      return NextResponse.redirect(new URL('/verification-failed', request.url));
    }
    
    // Check if token has expired (24 hours)
    const now = Date.now();
    const expiry = 24 * 60 * 60 * 1000; // 24 hours
    
    if (now - tokenData.createdAt > expiry) {
      tokenStore.delete(token);
      return NextResponse.redirect(new URL('/verification-failed', request.url));
    }
    
    // Check if token has already been used
    if (tokenData.used) {
      return NextResponse.redirect(new URL('/verification-failed', request.url));
    }
    
    // Mark token as used
    tokenData.used = true;
    tokenStore.set(token, tokenData);
    
    // Get WhatsApp link
    const whatsappLink = process.env.WHATSAPP_GROUP_LINK;
    if (!whatsappLink) {
      console.error('WHATSAPP_GROUP_LINK not configured');
      return NextResponse.redirect(new URL('/verification-failed', request.url));
    }
    
    // Log successful access for security monitoring
    const phoneHash = tokenData.phone.replace(/\d(?=\d{4})/g, '*');
    const emailHash = tokenData.email.replace(/(.{2}).*(@.*)/, '$1***$2');
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`WhatsApp access granted: ${emailHash}, phone: ${phoneHash} at ${new Date().toISOString()}`);
    }
    
    // Instead of direct redirect, render an intermediate page with obfuscated redirect
    return NextResponse.redirect(new URL(`/whatsapp-redirect?t=${token}`, request.url));
    
  } catch (error) {
    console.error('Token redemption error:', error);
    return NextResponse.redirect(new URL('/verification-failed', request.url));
  }
}

// Handle unsupported methods
export async function POST() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}