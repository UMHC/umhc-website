import { NextRequest, NextResponse } from 'next/server';
import { isValidPhoneNumber } from 'libphonenumber-js';
import { Resend } from 'resend';
import crypto from 'crypto';
import { createToken, deleteToken, cleanupExpiredTokens } from '@/lib/tokenStore';
import { supabaseAdmin } from '@/lib/supabase-admin';

interface VerificationRequest {
  phone: string;
  email: string;
  trips?: string;
  turnstileToken: string;
  website?: string; // Honeypot field
}

// Global verification code store
declare global {
  var verificationCodeStore: Map<string, { email: string; token: string; expiresAt: number }> | undefined;
}

// Validate international phone number
function validateInternationalPhoneNumber(phone: string): boolean {
  try {
    return isValidPhoneNumber(phone);
  } catch {
    return false;
  }
}

// Validate university email (.ac.uk)
function validateUniversityEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return false;
  }
  
  // Properly parse email to check domain - prevents malicious URL bypass
  const emailParts = email.toLowerCase().split('@');
  if (emailParts.length !== 2) {
    return false;
  }
  
  const domain = emailParts[1];
  // Check if domain is exactly 'ac.uk' or ends with '.ac.uk' (allows university subdomains)
  // The key security fix is parsing the email properly to get just the domain part
  return domain === 'ac.uk' || domain.endsWith('.ac.uk');
}

// Generate unique access token
function generateAccessToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

// Generate short, Outlook-safe verification code (6 digit numeric)
function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// generateShortCode function removed - using URL parameters instead


// Send verification email via Resend
async function sendVerificationEmail(email: string, token: string, verificationCode: string): Promise<boolean> {
  try {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.error('RESEND_API_KEY not configured');
      return false;
    }
    
    const resend = new Resend(apiKey);
    
    // Determine the base URL for production vs development
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');

    // Use instant verification with URL parameters (bypasses SafeLinks)
    const instantVerificationUrl = `${baseUrl}/go?code=${verificationCode}`;
    const fallbackUrl = `${baseUrl}/whatsapp-verify?code=${verificationCode}`;

    const { error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'UMHC <noreply@umhc.co.uk>',
      to: email,
      subject: 'UMHC WhatsApp Group Link',
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
            Here's your access to our WhatsApp group. We've provided multiple ways to join (email security may block some methods):
          </p>

          <!-- Instant verification method -->
          <div style="text-align: center; margin: 30px 0; padding: 20px; background-color: #f8f9fa; border-radius: 8px;">
            <h3 style="color: #1C5713; margin-bottom: 15px; font-size: 18px;">🚀 Instant Access Link</h3>
            <a href="${instantVerificationUrl}"
              style="background-color: #1C5713; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block; margin-bottom: 15px; font-size: 16px;">
              Join WhatsApp Group Instantly
            </a>
            <p style="color: #666; font-size: 14px; margin: 0;">
              Click the button above to join immediately
            </p>
          </div>

          <!-- Fallback verification method -->
          <div style="text-align: center; margin: 30px 0; padding: 20px; background-color: #fff3cd; border-radius: 8px;">
            <h3 style="color: #856404; margin-bottom: 15px; font-size: 18px;">Method 2: Verification Code (If the link doesn't work)</h3>
            <p style="color: #856404; font-size: 16px; margin-bottom: 15px;">Go to: <a href="${fallbackUrl}" style="color: #2E4E39; text-decoration: underline;">umhc.org.uk/whatsapp-verify</a></p>
            <div style="background-color: #1C5713; color: white; padding: 15px; border-radius: 8px; font-size: 24px; font-weight: bold; letter-spacing: 2px; margin: 10px 0;">
              ${verificationCode}
            </div>
            <p style="color: #856404; font-size: 14px; margin: 0;">Enter this 6-digit code on the verification page</p>
          </div>

          <p style="color: #494949; font-size: 14px; line-height: 1.6; margin-top: 20px;">
            Both methods are valid for 24 hours and can only be used once. If they expire, request access again <a href="https://umhc.org.uk/whatsapp" style="color: #2E4E39;">here</a>
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

// Verify Cloudflare Turnstile token
async function verifyTurnstile(token: string): Promise<boolean> {
  try {
    const secret = process.env.TURNSTILE_SECRET_KEY;
    if (!secret) {
      console.error('TURNSTILE_SECRET_KEY not configured - this is required for production');
      return false; // Reject if not configured properly
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
    
    // Log failed verifications for security monitoring
    if (!result.success) {
      console.warn('Turnstile verification failed:', result['error-codes'] || 'Unknown error');
    }
    
    return result.success;
  } catch (error) {
    console.error('Turnstile verification error:', error);
    return false;
  }
}

// Simple rate limiting - in production, use Redis or database
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 minutes
  const maxAttempts = 5;

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

export async function POST(request: NextRequest) {
  try {
    const body: VerificationRequest = await request.json();
    const { phone, email, trips, turnstileToken, website } = body;

    // Honeypot check - if website field is filled, it's a bot
    if (website && website.trim() !== '') {
      return NextResponse.json(
        { error: 'Bot detected' },
        { status: 400 }
      );
    }

    // Rate limiting - simple IP-based check
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
        { error: 'Due to lots of trouble with bots last year, automatic access to our WhatsApp community is restricted to users with access to a \'.ac.uk\' email address. You can manually request access to our WhatsApp community via the manual request form and a member of the Committee will approve it as soon as possible.' },
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

    // All validations passed - generate unique token and send email
    const whatsappLink = process.env.WHATSAPP_GROUP_LINK;
    if (!whatsappLink) {
      console.error('WHATSAPP_GROUP_LINK not configured');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }
    
    // Clean up expired tokens and verification codes
    await cleanupExpiredTokens();

    // Clean up expired verification codes and short codes from database
    try {
      const currentTime = new Date().toISOString();

      // Clean verification codes
      await supabaseAdmin
        .schema('whatsapp_security')
        .from('verification_codes')
        .delete()
        .lt('expires_at', currentTime);

      // Clean short codes (database cleanup disabled since we're using memory)
      // await supabaseAdmin
      //   .schema('whatsapp_security')
      //   .from('short_codes')
      //   .delete()
      //   .lt('expires_at', currentTime);
    } catch (error) {
      console.error('Error cleaning up expired codes:', error);
    }

    // Clean up expired verification codes from memory
    if (global.verificationCodeStore) {
      const now = Date.now();
      for (const [code, data] of global.verificationCodeStore.entries()) {
        if (now > data.expiresAt) {
          global.verificationCodeStore.delete(code);
        }
      }
    }

    // Short code cleanup removed - using URL parameters instead

    // Generate unique access token and verification code
    const accessToken = generateAccessToken();
    const verificationCode = generateVerificationCode();

    // Store token with user data in persistent storage
    const tokenCreated = await createToken(accessToken, {
      email,
      phone,
      trips,
      createdAt: Date.now(),
      used: false
    });

    if (!tokenCreated) {
      console.error('Failed to create token in database');
      return NextResponse.json(
        { error: 'Failed to create verification token. Please try again.' },
        { status: 500 }
      );
    }

    // Store verification code in database for persistence in serverless environment
    try {
      const { error: codeError } = await supabaseAdmin
        .schema('whatsapp_security')
        .from('verification_codes')
        .insert({
          code: verificationCode,
          email,
          token: accessToken,
          expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
        });

      if (codeError) {
        console.error('Failed to store verification code:', codeError);
        // Fall back to in-memory storage if database fails
        if (!global.verificationCodeStore) {
          global.verificationCodeStore = new Map();
        }
        global.verificationCodeStore.set(verificationCode, {
          email,
          token: accessToken,
          expiresAt: Date.now() + 24 * 60 * 60 * 1000
        });
      }
    } catch (error) {
      console.error('Database error storing verification code:', error);
      // Fall back to in-memory storage
      if (!global.verificationCodeStore) {
        global.verificationCodeStore = new Map();
      }
      global.verificationCodeStore.set(verificationCode, {
        email,
        token: accessToken,
        expiresAt: Date.now() + 24 * 60 * 60 * 1000
      });
    }

    // Send verification email with instant verification
    const emailSent = await sendVerificationEmail(email, accessToken, verificationCode);
    if (!emailSent) {
      // Clean up token if email failed
      await deleteToken(accessToken);
      return NextResponse.json(
        { error: 'Failed to send verification email. Please try again.' },
        { status: 500 }
      );
    }
    
    // Log successful verification for security monitoring
    const phoneHash = phone.replace(/\d(?=\d{4})/g, '*'); // Mask all but last 4 digits
    const emailHash = email.replace(/(.{2}).*(@.*)/, '$1***$2'); // Mask email username
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`Verification email sent: ${emailHash}, phone: ${phoneHash} at ${new Date().toISOString()}`);
    }

    return NextResponse.json({
      success: true,
      message: 'Verification link sent to your email address'
    });

  } catch (error) {
    console.error('Verification API error:', error);
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