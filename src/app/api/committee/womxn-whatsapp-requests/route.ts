import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { sendResendEmail } from '@/lib/resend';
import { requireCommitteeAccess, hasPermission } from '@/middleware/auth';
import { validateRequestBody, whatsAppRequestReviewSchema } from '@/lib/validation';

// Send approval email with Womxn-specific fragment verification link
async function sendWomxnApprovalEmail(email: string, firstName: string): Promise<boolean> {
  try {
    const { createWomxnAccessToken } = await import('@/lib/womxn-access-tokens');
    const tokenResult = await createWomxnAccessToken(email, 'manual_approval');

    if (!tokenResult.token) {
      console.error('Failed to create Womxn access token for manual approval:', {
        code: tokenResult.errorCode,
        message: tokenResult.errorMessage,
      });
      return false;
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const fragmentUrl = `${baseUrl}/womxn-join#${tokenResult.token}`;

    const emailSent = await sendResendEmail({
      to: email,
      from: process.env.RESEND_FROM_EMAIL || 'UMHC Hiking Club <response@mail.umhc.org.uk>',
      subject: 'UMHC Womxn WhatsApp Group Access Approved',
      html: `
        <div style="background-color: #FFFCF7; padding: 40px 0; font-family: 'Open Sans', Arial, sans-serif;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; background-color: #FFFEFB; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.08);">

          <div style="text-align: center; margin-bottom: 20px;">
            <img src="https://umhc.org.uk/api/logo?file=umhc-badge.webp" alt="UMHC Logo" width="120" style="max-width: 100%; height: auto; border: 0;">
          </div>

          <p style="color: #494949; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
            Hi ${firstName},
          </p>

          <p style="color: #494949; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
            Great news! Your request to join the UMHC Womxn WhatsApp group has been approved.
          </p>

          <p style="color: #494949; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
            Click the button below to join the Womxn WhatsApp group:
          </p>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${fragmentUrl}"
              style="background-color: #1C5713; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block; font-size: 16px;">
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
            This link is valid for 24 hours and can only be used once. Please don't share this link with anyone.
          </p>

          <p style="color: #494949; font-size: 14px; line-height: 1.6;">
            Thank you for your patience in this process. We look forward to seeing you on the hills! 🏔️
          </p>

        </div>
      </div>
      `,
    });

    return emailSent;
  } catch (error) {
    console.error('Womxn approval email sending error:', error);
    return false;
  }
}

// GET - Fetch all Womxn WhatsApp requests
export async function GET(request: NextRequest) {
  try {
    const authResult = await requireCommitteeAccess(request);
    if (!authResult.success) {
      return authResult.response;
    }

    if (!hasPermission(authResult.data.permissions, 'manage-womxn-whatsapp')) {
      return NextResponse.json(
        { error: 'You do not have permission to manage the Womxn WhatsApp group' },
        { status: 403 }
      );
    }

    const { data: requests, error: dbError } = await supabaseAdmin
      .schema('whatsapp_security')
      .from('womxn_requests')
      .select('*')
      .order('created_at', { ascending: false });

    if (dbError) {
      // If migration has not been run yet, keep console usable while showing setup warning.
      if (dbError.code === '42P01') {
        return NextResponse.json({
          success: true,
          requests: [],
          setupWarning: 'womxn_requests table not found. Run the Womxn WhatsApp SQL migration to enable request management.'
        });
      }

      console.error('Database error:', dbError);
      return NextResponse.json({ error: 'Failed to fetch requests', details: dbError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, requests: requests || [] });
  } catch (error) {
    console.error('Womxn WhatsApp requests API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH - Approve or reject a Womxn request
export async function PATCH(request: NextRequest) {
  try {
    const authResult = await requireCommitteeAccess(request);
    if (!authResult.success) {
      return authResult.response;
    }

    if (!hasPermission(authResult.data.permissions, 'manage-womxn-whatsapp')) {
      return NextResponse.json(
        { error: 'You do not have permission to manage the Womxn WhatsApp group' },
        { status: 403 }
      );
    }

    const validationResult = await validateRequestBody(request, whatsAppRequestReviewSchema);
    if (!validationResult.success) {
      return NextResponse.json({ error: validationResult.error }, { status: 400 });
    }

    const { requestId, action, reviewedBy } = validationResult.data;

    const { data: requestData, error: fetchError } = await supabaseAdmin
      .schema('whatsapp_security')
      .from('womxn_requests')
      .select('*')
      .eq('id', requestId)
      .single();

    if (fetchError || !requestData) {
      console.error('Request fetch error:', fetchError);
      return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    }

    const { error: updateError } = await supabaseAdmin
      .schema('whatsapp_security')
      .from('womxn_requests')
      .update({
        status: action === 'approve' ? 'approved' : 'rejected',
        reviewed_by: reviewedBy,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', requestId);

    if (updateError) {
      console.error('Database update error:', updateError);
      return NextResponse.json({ error: 'Failed to update request' }, { status: 500 });
    }

    if (action === 'approve') {
      const emailSent = await sendWomxnApprovalEmail(requestData.email, requestData.first_name);
      if (!emailSent) {
        console.warn(`Womxn approval processed but email failed for request ${requestId}`);
      }
    }

    if (process.env.NODE_ENV === 'development') {
      console.log(`Womxn WhatsApp request ${action}d: ${requestData.first_name} ${requestData.surname} by ${reviewedBy} at ${new Date().toISOString()}`);
    }

    return NextResponse.json({ success: true, message: `Request ${action}d successfully` });
  } catch (error) {
    console.error('Womxn WhatsApp request action error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}
