import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { validateRequestBody, manualWhatsAppRequestSchema } from '@/lib/validation';
import { checkWomxnForDuplicates, formatWomxnDuplicateError } from '@/lib/womxn-access-tokens';

// Verify Cloudflare Turnstile token
async function verifyTurnstile(token: string): Promise<boolean> {
  try {
    const secret = process.env.TURNSTILE_SECRET_KEY;
    if (!secret) {
      console.error('TURNSTILE_SECRET_KEY not configured - this is required for production');
      return false;
    }

    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
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

// Simple rate limiting
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 minutes
  const maxAttempts = 3;

  const record = rateLimitMap.get(ip);
  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + windowMs });
    return true;
  }
  if (record.count >= maxAttempts) return false;
  record.count++;
  return true;
}

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';

    if (!checkRateLimit(ip)) {
      return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 });
    }

    const validationResult = await validateRequestBody(request, manualWhatsAppRequestSchema);
    if (!validationResult.success) {
      console.warn('Womxn manual request validation failed:', validationResult.error);
      return NextResponse.json({ error: validationResult.error }, { status: 400 });
    }

    const { firstName, surname, phone, email, userType, trips, turnstileToken } = validationResult.data;

    const turnstileValid = await verifyTurnstile(turnstileToken);
    if (!turnstileValid) {
      console.warn('Womxn manual request Turnstile verification failed');
      return NextResponse.json({ error: 'Security verification failed' }, { status: 400 });
    }

    // Check for duplicates in Womxn-specific tables only
    const duplicateCheck = await checkWomxnForDuplicates(email, phone);
    if (duplicateCheck.emailUsed || duplicateCheck.phoneUsed) {
      console.warn('Womxn manual request blocked due to duplicate detection', {
        emailUsed: duplicateCheck.emailUsed,
        phoneUsed: duplicateCheck.phoneUsed,
      });
      return NextResponse.json({ error: formatWomxnDuplicateError() }, { status: 400 });
    }

    // Store request in Womxn-specific table
    const { error: dbError } = await supabaseAdmin
      .schema('whatsapp_security')
      .from('womxn_requests')
      .insert({
        first_name: firstName,
        surname: surname,
        email: email,
        phone: phone,
        user_type: userType,
        trips: trips,
        status: 'pending',
      });

    if (dbError) {
      console.error('Database error:', dbError);
      return NextResponse.json({ error: 'Failed to submit request. Please try again.' }, { status: 500 });
    }

    if (process.env.NODE_ENV === 'development') {
      const phoneHash = phone.replace(/\d(?=\d{4})/g, '*');
      console.log(`Womxn WhatsApp manual request submitted: ${firstName} ${surname}, email: ${email}, phone: ${phoneHash}, type: ${userType} at ${new Date().toISOString()}`);
    }

    return NextResponse.json({ success: true, message: 'Request submitted successfully' });
  } catch (error) {
    console.error('Womxn manual request API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}
