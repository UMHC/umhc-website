import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

interface Question {
  question: string;
  options: string[];
  correct: number;
}

interface VerificationRequest {
  phone: string;
  answer: string;
  questionId: number;
  turnstileToken: string;
  website?: string; // Honeypot field
}

// Validate UK phone number format
function validateUKPhoneNumber(phone: string): boolean {
  // Remove all spaces and special characters except +
  const cleaned = phone.replace(/[^\d+]/g, '');
  
  // Check if it starts with +44
  if (!cleaned.startsWith('+44')) {
    return false;
  }
  
  // Remove +44 and check remaining digits
  const withoutCountryCode = cleaned.substring(3);
  
  // UK mobile numbers typically start with 7 and have 10 digits total after +44
  return /^7\d{9}$/.test(withoutCountryCode);
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
    const { phone, answer, questionId, turnstileToken, website } = body;

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
    if (!validateUKPhoneNumber(phone)) {
      return NextResponse.json(
        { error: 'Invalid UK phone number format' },
        { status: 400 }
      );
    }

    // Load questions
    let questions: Question[];
    try {
      const questionsPath = path.join(process.cwd(), 'questions.json');
      const questionsData = fs.readFileSync(questionsPath, 'utf8');
      questions = JSON.parse(questionsData);
    } catch (error) {
      console.error('Error loading questions:', error);
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    // Validate question ID and answer
    if (questionId < 0 || questionId >= questions.length) {
      return NextResponse.json(
        { error: 'Invalid question' },
        { status: 400 }
      );
    }

    const question = questions[questionId];
    const answerIndex = parseInt(answer);
    
    if (isNaN(answerIndex) || answerIndex !== question.correct) {
      return NextResponse.json(
        { error: 'Incorrect answer' },
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

    // All validations passed - return WhatsApp link
    const whatsappLink = process.env.WHATSAPP_GROUP_LINK;
    if (!whatsappLink) {
      console.error('WHATSAPP_GROUP_LINK not configured');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    // Log successful verification for security monitoring
    // Note: Only log phone number hash in production for privacy
    const phoneHash = phone.replace(/\d(?=\d{4})/g, '*'); // Mask all but last 4 digits
    
    // Only log in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`Successful verification: ${phoneHash} at ${new Date().toISOString()}`);
    }

    return NextResponse.json({
      success: true,
      whatsappLink,
      message: 'Verification successful'
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