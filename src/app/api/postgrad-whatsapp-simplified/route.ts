import { NextRequest, NextResponse } from 'next/server';
import { isValidPhoneNumber } from 'libphonenumber-js';
import { sendResendEmailWithError } from '@/lib/resend';
import { checkPostgradForDuplicates, createPostgradAccessToken, deletePostgradAccessToken, formatPostgradDuplicateError, logPostgradEvent } from '@/lib/postgrad-access-tokens';

const ipAttempts = new Map<string, { count: number; reset: number }>();
const detailAttempts = new Map<string, { count: number; reset: number }>();

function allowed(map: Map<string, { count: number; reset: number }>, key: string, max: number, windowMs: number) {
  const now = Date.now();
  const current = map.get(key);
  if (!current || now > current.reset) { map.set(key, { count: 1, reset: now + windowMs }); return true; }
  if (current.count >= max) return false;
  current.count += 1;
  return true;
}

async function verifyTurnstile(token: string) {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return false;
  const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: `secret=${encodeURIComponent(secret)}&response=${encodeURIComponent(token)}` });
  if (!response.ok) return false;
  return (await response.json()).success === true;
}

function validUniversityEmail(email: string) {
  const parts = email.toLowerCase().split('@');
  return parts.length === 2 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && (parts[1] === 'ac.uk' || parts[1].endsWith('.ac.uk'));
}

async function sendVerificationEmail(email: string, token: string, baseUrl: string) {
  const fragmentUrl = `${baseUrl}/postgrad-join#${token}`;
  return sendResendEmailWithError({
    to: email,
    from: process.env.RESEND_FROM_EMAIL || 'UMHC Hiking Club <response@mail.umhc.org.uk>',
    subject: 'UMHC Postgraduate WhatsApp Group Access',
    html: `<div style="background:#FFFCF7;padding:40px 0;font-family:Arial,sans-serif"><div style="max-width:600px;margin:auto;padding:24px;background:#FFFEFB"><img src="https://umhc.org.uk/logos/umhc-badge.webp" alt="UMHC Logo" width="120" style="display:block;max-width:120px;height:auto;border:0"><p>Welcome! Click below to join the UMHC Postgraduate WhatsApp group.</p><p><a href="${fragmentUrl}" style="background:#1C5713;color:white;padding:15px 30px;text-decoration:none;border-radius:8px;display:inline-block">Join Postgraduate WhatsApp Group</a></p><p>This link is valid for 24 hours and can only be used once.</p></div></div>`,
  });
}

export const dynamic = 'force-dynamic';
export async function POST(request: NextRequest) {
  try {
    const { email, phone, turnstileToken, website } = await request.json();
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    if (website?.trim()) return NextResponse.json({ error: 'Bot detected' }, { status: 400 });
    if (!allowed(ipAttempts, ip, 5, 15 * 60 * 1000) || !allowed(detailAttempts, `${String(email).toLowerCase()}:${phone}`, 3, 30 * 60 * 1000)) return NextResponse.json({ error: 'Too many attempts. Please try again later.' }, { status: 429 });
    if (typeof email !== 'string' || !validUniversityEmail(email)) return NextResponse.json({ error: 'Automatic access is available for postgraduate university email addresses ending in .ac.uk, including universities outside Manchester. International or other non-.ac.uk postgraduate students can request manual access.' }, { status: 400 });
    if (typeof phone !== 'string' || !isValidPhoneNumber(phone)) return NextResponse.json({ error: 'Invalid phone number format' }, { status: 400 });
    if (!(await verifyTurnstile(turnstileToken))) return NextResponse.json({ error: 'Security verification failed' }, { status: 400 });
    const duplicate = await checkPostgradForDuplicates(email, phone);
    if (duplicate.emailUsed || duplicate.phoneUsed) return NextResponse.json({ error: formatPostgradDuplicateError() }, { status: 400 });
    const tokenResult = await createPostgradAccessToken(email, 'ac_uk_email', phone);
    if (!tokenResult.token) return NextResponse.json({ error: tokenResult.errorMessage || 'Failed to create verification token' }, { status: 500 });
    const baseUrl = process.env.NODE_ENV === 'production' ? (process.env.NEXT_PUBLIC_BASE_URL || request.nextUrl.origin) : request.nextUrl.origin;
    const emailResult = await sendVerificationEmail(email, tokenResult.token, baseUrl);
    if (!emailResult.success) { await deletePostgradAccessToken(tokenResult.token); return NextResponse.json({ error: emailResult.error || 'Failed to send verification email' }, { status: emailResult.error?.isRateLimit ? 503 : 500 }); }
    await logPostgradEvent(email, 'ac_uk_email', tokenResult.token, 'verification_email_sent', phone);
    return NextResponse.json({ success: true, message: 'A verification link has been sent to your university email address.' });
  } catch (error) {
    console.error('Postgrad verification API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET() { return NextResponse.json({ error: 'Method not allowed' }, { status: 405 }); }