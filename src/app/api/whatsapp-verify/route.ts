import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

interface VerifyCodeRequest {
  verificationCode: string;
}

// Global verification code store (declared in whatsapp/route.ts)
declare global {
  var verificationCodeStore: Map<string, { email: string; token: string; expiresAt: number }> | undefined;
}

export async function POST(request: NextRequest) {
  try {
    const body: VerifyCodeRequest = await request.json();
    const { verificationCode } = body;

    // Validate verification code format
    if (!verificationCode || !/^\d{6}$/.test(verificationCode)) {
      return NextResponse.json(
        { error: 'Invalid verification code format' },
        { status: 400 }
      );
    }

    // First try to find the verification code in the database
    let codeData = null;

    try {
      const { data: dbCodeData, error: dbError } = await supabaseAdmin
        .schema('whatsapp_security')
        .from('verification_codes')
        .select('*')
        .eq('code', verificationCode)
        .single();

      if (!dbError && dbCodeData) {
        // Check if code is expired
        if (new Date() > new Date(dbCodeData.expires_at)) {
          // Clean up expired code
          await supabaseAdmin
            .schema('whatsapp_security')
            .from('verification_codes')
            .delete()
            .eq('code', verificationCode);

          return NextResponse.json(
            { error: 'Verification code has expired. Please request a new one.' },
            { status: 400 }
          );
        }

        codeData = {
          email: dbCodeData.email,
          token: dbCodeData.token
        };

        // Code is valid - remove it (single use)
        await supabaseAdmin
          .schema('whatsapp_security')
          .from('verification_codes')
          .delete()
          .eq('code', verificationCode);
      }
    } catch (error) {
      console.error('Database error looking up verification code:', error);
    }

    // Fall back to in-memory store if database lookup failed
    if (!codeData) {
      if (!global.verificationCodeStore) {
        return NextResponse.json(
          { error: 'Verification code not found or expired' },
          { status: 400 }
        );
      }

      const memoryCodeData = global.verificationCodeStore.get(verificationCode);

      if (!memoryCodeData) {
        return NextResponse.json(
          { error: 'Verification code not found or expired' },
          { status: 400 }
        );
      }

      // Check if code is expired
      if (Date.now() > memoryCodeData.expiresAt) {
        // Clean up expired code
        global.verificationCodeStore.delete(verificationCode);
        return NextResponse.json(
          { error: 'Verification code has expired. Please request a new one.' },
          { status: 400 }
        );
      }

      codeData = {
        email: memoryCodeData.email,
        token: memoryCodeData.token
      };

      // Code is valid - remove it (single use)
      global.verificationCodeStore.delete(verificationCode);
    }

    // Get WhatsApp group link for direct redirect
    const whatsappLink = process.env.WHATSAPP_GROUP_LINK;
    if (!whatsappLink) {
      console.error('WHATSAPP_GROUP_LINK not configured');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    // Log successful verification for security monitoring
    const emailHash = codeData.email.replace(/(.{2}).*(@.*)/, '$1***$2');

    if (process.env.NODE_ENV === 'development') {
      console.log(`WhatsApp verification code used: ${emailHash} at ${new Date().toISOString()}`);
    }

    return NextResponse.json({
      success: true,
      token: codeData.token,
      whatsappUrl: whatsappLink,
      message: 'Verification code validated successfully'
    });

  } catch (error) {
    console.error('Verification code API error:', error);
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