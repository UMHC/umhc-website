import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { validateRequestBody, manualWhatsAppRequestSchema } from '@/lib/validation';

// interface ManualRequestData {
//   firstName: string;
//   surname: string;
//   phone: string;
//   email: string;
//   userType: string;
//   trips?: string;
//   turnstileToken: string;
//   website?: string; // Honeypot field
// }


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
  const maxAttempts = 3; // More restrictive for manual requests

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
    // Rate limiting - simple IP-based check
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';

    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    // Validate request body using Zod schema
    const validationResult = await validateRequestBody(request, manualWhatsAppRequestSchema);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error },
        { status: 400 }
      );
    }

    const { firstName, surname, phone, email, userType, trips, turnstileToken } = validationResult.data;

    // Verify Turnstile token
    const turnstileValid = await verifyTurnstile(turnstileToken);
    if (!turnstileValid) {
      return NextResponse.json(
        { error: 'Security verification failed' },
        { status: 400 }
      );
    }

    // Store request in whatsapp_security schema (secure)
    const { error: dbError } = await supabaseAdmin
      .schema('whatsapp_security')
      .from('whatsapp_requests')
      .insert({
        first_name: firstName,
        surname: surname,
        email: email,
        phone: phone,
        user_type: userType,
        trips: trips,
        status: 'pending'
      });
    
    
    if (dbError) {
      console.error('Database error:', dbError);
      return NextResponse.json(
        { error: 'Failed to submit request. Please try again.' },
        { status: 500 }
      );
    }
    
    // Log successful request for monitoring
    const phoneHash = phone.replace(/\d(?=\d{4})/g, '*'); // Mask all but last 4 digits
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`Manual WhatsApp request submitted: ${firstName} ${surname}, email: ${email}, phone: ${phoneHash}, type: ${userType} at ${new Date().toISOString()}`);
    }

    return NextResponse.json({
      success: true,
      message: 'Request submitted successfully'
    });

  } catch (error) {
    console.error('Manual request API error:', error);
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