import { NextRequest, NextResponse } from 'next/server';
import { isValidPhoneNumber } from 'libphonenumber-js';
import { sendResendEmailWithError } from '@/lib/resend';
import {
  createWomxnAccessToken,
  cleanupExpiredWomxnTokens,
  checkWomxnForDuplicates,
  formatWomxnDuplicateError,
  deleteWomxnAccessToken,
  logWomxnEvent,
} from '@/lib/womxn-access-tokens';

interface VerificationRequest {
  email: string;
  phone: string;
  turnstileToken: string;
  website?: string;
}

const ipRateLimitMap = new Map<string, { count: number; resetTime: number }>();
const emailPhoneRateLimitMap = new Map<string, { count: number; resetTime: number }>();

function checkIPRateLimit(ip: string): boolean {
  const now = Date.now();
  const windowMs = 15 * 60 * 1000;
  const maxAttempts = 5;
  const record = ipRateLimitMap.get(ip);
  if (!record || now > record.resetTime) {
    ipRateLimitMap.set(ip, { count: 1, resetTime: now + windowMs });
    return true;
  }
  if (record.count >= maxAttempts) return false;
  record.count++;
  return true;
}

function checkEmailPhoneRateLimit(email: string, phone: string): boolean {
  const now = Date.now();
  const windowMs = 30 * 60 * 1000;
  const maxAttempts = 3;
  const key = `${email.toLowerCase()}:${phone}`;
  const record = emailPhoneRateLimitMap.get(key);
  if (!record || now > record.resetTime) {
    emailPhoneRateLimitMap.set(key, { count: 1, resetTime: now + windowMs });
    return true;
  }
  if (record.count >= maxAttempts) return false;
  record.count++;
  return true;
}

function validateUniversityEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) return false;
  const emailParts = email.toLowerCase().split('@');
  if (emailParts.length !== 2) return false;
  const domain = emailParts[1];
  return domain === 'ac.uk' || domain.endsWith('.ac.uk');
}

function validateInternationalPhoneNumber(phone: string): boolean {
  try {
    return isValidPhoneNumber(phone);
  } catch {
    return false;
  }
}

async function verifyTurnstile(token: string): Promise<boolean> {
  try {
    const secret = process.env.TURNSTILE_SECRET_KEY;
    if (!secret) return false;
    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `secret=${encodeURIComponent(secret)}&response=${encodeURIComponent(token)}`,
    });
    if (!response.ok) return false;
    const result = await response.json();
    return result.success;
  } catch {
    return false;
  }
}

async function sendWomxnVerificationEmail(
  email: string,
  token: string,
  baseUrl: string
): Promise<{ success: boolean; isRateLimit?: boolean; error?: string; messageId?: string }> {
  try {
    const fragmentUrl = `${baseUrl}/womxn-join#${token}`;

    const result = await sendResendEmailWithError({
      to: email,
      from: process.env.RESEND_FROM_EMAIL || 'UMHC Hiking Club <response@mail.umhc.org.uk>',
      subject: 'UMHC Womxn WhatsApp Group Access',
      html: `
        <div style="background-color: #FFFCF7; padding: 40px 0; font-family: 'Open Sans', Arial, sans-serif;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; background-color: #FFFEFB; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.08);">
          <div style="text-align: center; margin-bottom: 20px;">
            <img src="https://umhc.org.uk/api/logo?file=umhc-badge.webp" alt="UMHC Logo" width="120" style="max-width: 100%; height: auto; border: 0;">
          </div>
          <p style="color: #494949; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">Hi,</p>
          <p style="color: #494949; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
            Welcome! Click the button below to join the UMHC Womxn WhatsApp group:
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${fragmentUrl}" style="background-color: #1C5713; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block; font-size: 16px;">
              Join Womxn WhatsApp Group
            </a>
          </div>
          <p style="color: #494949; font-size: 14px; line-height: 1.6; margin-top: 20px;">
            <strong>Can't click the button?</strong> Copy and paste this link into your browser:
          </p>
          <div style="background-color: #f8f9fa; border: 1px solid #dee2e6; border-radius: 4px; padding: 10px; margin: 10px 0; word-break: break-all;">
            <code style="color: #1C5713; font-size: 14px;">${fragmentUrl}</code>
          </div>
          <p style="color: #494949; font-size: 14px; line-height: 1.6;">
            This link is valid for 24 hours and can only be used once. Please don't share this link.
          </p>
          <p style="color: #494949; font-size: 14px; line-height: 1.6;">
            We look forward to seeing you on the hills! 🏔️
          </p>
        </div>
      </div>`,
    });

    if (result.success) return { success: true, messageId: result.data?.messageId };
    return { success: false, isRateLimit: result.error?.isRateLimit, error: result.error?.error };
  } catch (error) {
    console.error('Womxn email sending error:', error);
    return { success: false, error: 'Email sending failed' };
  }
}

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(request: NextRequest) {
  try {
    const body: VerificationRequest = await request.json();
    const { email, phone, turnstileToken, website } = body;

    if (website && website.trim() !== '') {
      return NextResponse.json({ error: 'Bot detected' }, { status: 400 });
    }

    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';

    if (!checkIPRateLimit(ip)) {
      return NextResponse.json(
        { error: 'Too many attempts from your network. Please try again later.' },
        { status: 429 }
      );
    }

    if (!checkEmailPhoneRateLimit(email, phone)) {
      return NextResponse.json(
        { error: 'You have already requested access with these details recently. Please check your email, or wait 30 minutes before trying again.' },
        { status: 429 }
      );
    }

    if (!validateInternationalPhoneNumber(phone)) {
      return NextResponse.json({ error: 'Invalid phone number format' }, { status: 400 });
    }

    if (!validateUniversityEmail(email)) {
      return NextResponse.json(
        { error: 'Automatic access is restricted to users with \'.ac.uk\' email addresses. You can request manual access via the manual request form.' },
        { status: 400 }
      );
    }

    const turnstileValid = await verifyTurnstile(turnstileToken);
    if (!turnstileValid) {
      return NextResponse.json({ error: 'Security verification failed' }, { status: 400 });
    }

    const duplicateCheck = await checkWomxnForDuplicates(email, phone);
    if (duplicateCheck.emailUsed || duplicateCheck.phoneUsed) {
      return NextResponse.json({ error: formatWomxnDuplicateError() }, { status: 400 });
    }

    await cleanupExpiredWomxnTokens();

    const tokenResult = await createWomxnAccessToken(email, 'ac_uk_email', ip, phone);
    if (!tokenResult.token) {
      if (tokenResult.errorCode === '42501') {
        return NextResponse.json(
          {
            error: 'Database permissions are not configured for Womxn access tokens. Please contact committee tech support.',
            code: 'DB_PERMISSION_DENIED',
          },
          { status: 500 }
        );
      }

      return NextResponse.json(
        { error: tokenResult.errorMessage || 'Failed to create verification token. Please try again.' },
        { status: 500 }
      );
    }

    const runtimeOrigin = request.nextUrl.origin;
    const configuredBaseUrl = process.env.NEXT_PUBLIC_BASE_URL;
    const baseUrl = process.env.NODE_ENV === 'production'
      ? (configuredBaseUrl || runtimeOrigin)
      : runtimeOrigin;

    const emailResult = await sendWomxnVerificationEmail(email, tokenResult.token, baseUrl);
    if (!emailResult.success) {
      await deleteWomxnAccessToken(tokenResult.token);
      if (emailResult.isRateLimit) {
        return NextResponse.json(
          { error: 'We\'re experiencing high email volume right now. Please try again in a few hours.' },
          { status: 503 }
        );
      }
      return NextResponse.json(
        { error: emailResult.error || 'Failed to send verification email. Please try again.' },
        { status: 500 }
      );
    }

    // Record that the verification email was successfully sent.
    await logWomxnEvent(email, 'ac_uk_email', tokenResult.token, 'verification_email_sent', ip, phone);

    const emailMasked = email.replace(/(.{2}).*(@.*)/, '$1***$2');
    const messageId = emailResult.messageId || 'unknown';
    console.log(`Womxn verification email sent: ${emailMasked} (resend_id=${messageId}) at ${new Date().toISOString()}`);

    return NextResponse.json({
      success: true,
      message: 'A verification link has been sent to your university email address.',
    });
  } catch (error) {
    console.error('Womxn verification API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}
