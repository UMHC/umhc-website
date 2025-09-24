import { NextRequest, NextResponse } from 'next/server';
import { isValidPhoneNumber } from 'libphonenumber-js';
import { Resend } from 'resend';
import { createAccessToken, cleanupExpiredTokens, checkForDuplicates, formatDuplicateError } from '@/lib/access-tokens';

interface VerificationRequest {
  email: string;
  phone: string;
  turnstileToken: string;
  website?: string; // Honeypot field
}

// Rate limiting - simple IP-based check
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 minutes
  const maxAttempts = 3; // Reduced for simplified flow

  const record = rateLimitMap.get(ip);

  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (record.count >= maxAttempts) {
    return false;
  }

  record.count++;
  return true;
}

// Validate university email (.ac.uk)
function validateUniversityEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return false;
  }

  const emailParts = email.toLowerCase().split('@');
  if (emailParts.length !== 2) {
    return false;
  }

  const domain = emailParts[1];
  return domain === 'ac.uk' || domain.endsWith('.ac.uk');
}

// Validate international phone number
function validateInternationalPhoneNumber(phone: string): boolean {
  try {
    return isValidPhoneNumber(phone);
  } catch {
    return false;
  }
}

// Verify Cloudflare Turnstile token
async function verifyTurnstile(token: string): Promise<boolean> {
  try {
    const secret = process.env.TURNSTILE_SECRET_KEY;
    if (!secret) {
      console.error('TURNSTILE_SECRET_KEY not configured');
      return false;
    }

    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `secret=${encodeURIComponent(secret)}&response=${encodeURIComponent(token)}`,
    });

    if (!response.ok) {
      console.error('Turnstile verification request failed:', response.status);
      return false;
    }

    const result = await response.json();

    if (!result.success) {
      console.warn('Turnstile verification failed:', result['error-codes'] || 'Unknown error');
    }

    return result.success;
  } catch (error) {
    console.error('Turnstile verification error:', error);
    return false;
  }
}

// Send fragment-based verification email
async function sendFragmentVerificationEmail(email: string, token: string): Promise<boolean> {
  try {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.error('RESEND_API_KEY not configured');
      return false;
    }

    const resend = new Resend(apiKey);

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const fragmentUrl = `${baseUrl}/join#${token}`;

    const { error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'UMHC <noreply@umhc.co.uk>',
      to: email,
      subject: 'UMHC WhatsApp Group Access',
      html: `
        <div style="background-color: #FFFCF7; padding: 40px 0; font-family: 'Open Sans', Arial, sans-serif;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; background-color: #FFFEFB; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.08);">

          <!-- Logo section -->
          <div style="text-align: center; margin-bottom: 20px;">
            <img src="https://umhc.org.uk/api/logo?file=umhc-badge.webp" alt="UMHC Logo" width="120" style="max-width: 100%; height: auto; border: 0;">
          </div>

          <p style="color: #494949; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
            Hi,
          </p>

          <p style="color: #494949; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
            Welcome to the UMHC community! Click the button below to join our WhatsApp group:
          </p>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${fragmentUrl}"
              style="background-color: #1C5713; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block; font-size: 16px;">
              Join WhatsApp Group
            </a>
          </div>

          <p style="color: #494949; font-size: 14px; line-height: 1.6; margin-top: 20px;">
            <strong>Can't click the button?</strong> Copy and paste this link into your browser:
          </p>

          <div style="background-color: #f8f9fa; border: 1px solid #dee2e6; border-radius: 4px; padding: 10px; margin: 10px 0; word-break: break-all;">
            <code style="color: #1C5713; font-size: 14px;">${fragmentUrl}</code>
          </div>

          <p style="color: #494949; font-size: 14px; line-height: 1.6;">
            This link is valid for 24 hours and can only be used once. Please don't share this link with anyone.
          </p>

          <p style="color: #494949; font-size: 14px; line-height: 1.6;">
            We look forward to seeing you on the hills! 🏔️
          </p>

        </div>
      </div>
      `,
    });

    if (error) {
      console.error('Email sending error:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Email sending error:', error);
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: VerificationRequest = await request.json();
    const { email, phone, turnstileToken, website } = body;

    // Honeypot check
    if (website && website.trim() !== '') {
      return NextResponse.json(
        { error: 'Bot detected' },
        { status: 400 }
      );
    }

    // Rate limiting
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';

    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: 'Too many attempts. Please try again later.' },
        { status: 429 }
      );
    }

    // Validate phone number
    if (!validateInternationalPhoneNumber(phone)) {
      return NextResponse.json(
        { error: 'Invalid phone number format' },
        { status: 400 }
      );
    }

    // Validate university email
    if (!validateUniversityEmail(email)) {
      return NextResponse.json(
        { error: 'Automatic access is restricted to users with \'.ac.uk\' email addresses. You can request manual access via the manual request form.' },
        { status: 400 }
      );
    }

    // Verify Turnstile token
    const turnstileValid = await verifyTurnstile(turnstileToken);
    if (!turnstileValid) {
      return NextResponse.json(
        { error: 'Security verification failed' },
        { status: 400 }
      );
    }

    // Check for duplicate email/phone usage
    const duplicateCheck = await checkForDuplicates(email, phone);
    if (duplicateCheck.emailUsed || duplicateCheck.phoneUsed) {
      return NextResponse.json(
        { error: formatDuplicateError() },
        { status: 400 }
      );
    }

    // Clean up expired tokens
    await cleanupExpiredTokens();

    // Create new access token
    const token = await createAccessToken(email, 'ac_uk_email', ip, phone);

    if (!token) {
      console.error('Failed to create access token');
      return NextResponse.json(
        { error: 'Failed to create verification token. Please try again.' },
        { status: 500 }
      );
    }

    // Send fragment-based verification email
    const emailSent = await sendFragmentVerificationEmail(email, token);
    if (!emailSent) {
      return NextResponse.json(
        { error: 'Failed to send verification email. Please try again.' },
        { status: 500 }
      );
    }

    // Log successful verification for monitoring
    const emailMasked = email.replace(/(.{2}).*(@.*)/, '$1***$2');
    console.log(`Fragment verification email sent: ${emailMasked} at ${new Date().toISOString()}`);

    return NextResponse.json({
      success: true,
      message: 'Verification link sent to your email address'
    });

  } catch (error) {
    console.error('Simplified verification API error:', error);
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