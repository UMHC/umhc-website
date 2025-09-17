import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { Resend } from 'resend';
import crypto from 'crypto';
import { createToken, cleanupExpiredTokens } from '@/lib/tokenStore';
import { requireCommitteeAccess } from '@/middleware/auth';
import { validateRequestBody, whatsAppRequestReviewSchema } from '@/lib/validation';


// Generate unique access token
function generateAccessToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

// Send approval email with unique link
async function sendApprovalEmail(email: string, firstName: string, requestData: { trips?: string }): Promise<boolean> {
  try {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.error('RESEND_API_KEY not configured');
      return false;
    }
    
    const resend = new Resend(apiKey);
    
    // Generate unique access token
    const accessToken = generateAccessToken();
    
    // Clean up expired tokens first
    await cleanupExpiredTokens();

    // Store token (using email as identifier since they don't have phone in this flow)
    const tokenCreated = await createToken(accessToken, {
      email,
      phone: '', // Will be empty for manual approvals
      trips: requestData.trips,
      createdAt: Date.now(),
      used: false
    });

    if (!tokenCreated) {
      console.error('Failed to create token in database');
      return false;
    }
    
    const verificationUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/whatsapp-access/${accessToken}`;
    
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
            Hi ${firstName},
          </p>
          
          <p style="color: #494949; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
            Here's the link to our WhatsApp group, please don't share this link with anyone. 
          </p>
          
          <p style="color: #494949; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
            Thank you for your patience in this process.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" 
              style="background-color: #1C5713; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block;">
              Join WhatsApp Group
            </a>
          </div>
          
          <p style="color: #494949; font-size: 14px; line-height: 1.6; margin-top: 20px;">
            This link is valid for 24 hours and can only be used once. If it expires, request access again <a href="https://umhc.org.uk/whatsapp" style="color: #2E4E39;">here</a>
          </p>
          
          <p style="color: #494949; font-size: 14px; line-height: 1.6;">
            We look forward to seeing you on the hills
          </p>
          
        </div>
      </div>
      `,
    });
    
    if (error) {
      console.error('Approval email sending error:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Approval email sending error:', error);
    return false;
  }
}

// GET - Fetch all WhatsApp requests
export async function GET(request: NextRequest) {
  try {
    // Check authentication and authorization using centralized middleware
    const authResult = await requireCommitteeAccess(request);
    if (!authResult.success) {
      return authResult.response;
    }

    // Fetch requests from secure Supabase schema, ordered by creation date (newest first)
    const { data: requests, error: dbError } = await supabaseAdmin
      .schema('whatsapp_security')
      .from('whatsapp_requests')
      .select('*')
      .order('created_at', { ascending: false });
    

    if (dbError) {
      console.error('Database error:', dbError);
      return NextResponse.json(
        { error: 'Failed to fetch requests' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      requests: requests || []
    });

  } catch (error) {
    console.error('WhatsApp requests API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH - Approve or reject a request
export async function PATCH(request: NextRequest) {
  try {
    // Check authentication and authorization using centralized middleware
    const authResult = await requireCommitteeAccess(request);
    if (!authResult.success) {
      return authResult.response;
    }

    // Validate request body using Zod schema
    const validationResult = await validateRequestBody(request, whatsAppRequestReviewSchema);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error },
        { status: 400 }
      );
    }

    const { requestId, action, reviewedBy } = validationResult.data;

    // Get the request details before updating from secure schema
    const { data: requestData, error: fetchError } = await supabaseAdmin
      .schema('whatsapp_security')
      .from('whatsapp_requests')
      .select('*')
      .eq('id', requestId)
      .single();

    if (fetchError || !requestData) {
      console.error('Request fetch error:', fetchError);
      return NextResponse.json(
        { error: 'Request not found' },
        { status: 404 }
      );
    }

    // Update request status in secure schema
    const { error: updateError } = await supabaseAdmin
      .schema('whatsapp_security')
      .from('whatsapp_requests')
      .update({
        status: action === 'approve' ? 'approved' : 'rejected',
        reviewed_by: reviewedBy,
        reviewed_at: new Date().toISOString()
      })
      .eq('id', requestId);
    

    if (updateError) {
      console.error('Database update error:', updateError);
      return NextResponse.json(
        { error: 'Failed to update request' },
        { status: 500 }
      );
    }

    // If approved, send email with access link
    if (action === 'approve') {
      const emailSent = await sendApprovalEmail(requestData.email, requestData.first_name, requestData);
      if (!emailSent) {
        // Log warning but don't fail the request
        console.warn(`Approval processed but email failed for request ${requestId}`);
      }
    }

    // Log action for monitoring
    if (process.env.NODE_ENV === 'development') {
      console.log(`WhatsApp request ${action}d: ${requestData.first_name} ${requestData.surname} by ${reviewedBy} at ${new Date().toISOString()}`);
    }

    return NextResponse.json({
      success: true,
      message: `Request ${action}d successfully`
    });

  } catch (error) {
    console.error('WhatsApp request action error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Handle unsupported methods
export async function POST() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}