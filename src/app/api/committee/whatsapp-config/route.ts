import { NextRequest, NextResponse } from 'next/server';
import { requireCommitteeAccess } from '@/middleware/auth';
import { getAccessLogs, cleanupExpiredTokens } from '@/lib/access-tokens';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { getQRTokens, invalidateAllQRTokens, reactivateAllQRTokens } from '@/lib/qr-tokens';

interface WhatsAppConfigRequest {
  whatsapp_link?: string;
  qr_redirect_enabled?: boolean;
}

// Add no-cache headers for security
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// GET - Get current WhatsApp configuration and access logs
export async function GET(request: NextRequest) {
  // Set no-cache headers
  const headers = {
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0',
  };

  try {
    // Check authentication and authorization
    const authResult = await requireCommitteeAccess(request);
    if (!authResult.success) {
      return authResult.response;
    }

    // Get current config from Edge Config
    const { getEdgeConfig } = await import('@/lib/edge-config');
    const config = await getEdgeConfig();

    // Get recent access logs (successful joins)
    const accessLogs = await getAccessLogs(50);

    // Get recent manual requests (pending/approved/rejected)
    const { data: manualRequests, error: manualError } = await supabaseAdmin
      .schema('whatsapp_security')
      .from('whatsapp_requests')
      .select('id, email, phone, first_name, surname, status, created_at')
      .order('created_at', { ascending: false })
      .limit(50);

    if (manualError) {
      console.warn('Failed to fetch manual requests:', manualError);
    }

    // Combine and format all logs for display
    const combinedLogs = [
      // Access logs (successful joins)
      ...accessLogs.map(log => ({
        id: log.id,
        email: log.email,
        phone: log.phone,
        verification_method: log.verification_method,
        status: log.status,
        created_at: log.created_at,
        type: 'access' as const
      })),
      // Manual requests (all statuses)
      ...(manualRequests || []).map(req => ({
        id: `manual_${req.id}`,
        email: req.email,
        phone: req.phone,
        verification_method: 'manual_approval' as const,
        status: req.status,
        created_at: req.created_at,
        type: 'manual' as const
      }))
    ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    // Get QR tokens
    const qrTokens = await getQRTokens();

    // Clean up expired tokens
    const cleanedTokens = await cleanupExpiredTokens();

    return NextResponse.json({
      success: true,
      config,
      accessLogs: combinedLogs,
      qrTokens,
      cleanupResult: {
        expiredTokensCleaned: cleanedTokens
      }
    }, { headers });

  } catch (error) {
    console.error('WhatsApp config API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers }
    );
  }
}

// POST - Update WhatsApp configuration (requires Vercel API access)
export async function POST(request: NextRequest) {
  // Set no-cache headers
  const headers = {
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0',
  };

  try {
    // Check authentication and authorization
    const authResult = await requireCommitteeAccess(request);
    if (!authResult.success) {
      return authResult.response;
    }

    const body: WhatsAppConfigRequest = await request.json();

    // Validate WhatsApp link if provided
    if (body.whatsapp_link) {
      if (!body.whatsapp_link.startsWith('https://chat.whatsapp.com/')) {
        return NextResponse.json(
          { error: 'Invalid WhatsApp link. Must start with https://chat.whatsapp.com/' },
          { status: 400, headers }
        );
      }
    }

    // Update Edge Config using Vercel API
    const { updateEdgeConfig } = await import('@/lib/edge-config');

    // Prepare update object with only provided values
    const updateData: { whatsapp_link?: string; qr_redirect_enabled?: boolean } = {};
    if (body.whatsapp_link) updateData.whatsapp_link = body.whatsapp_link;
    if (body.qr_redirect_enabled !== undefined) updateData.qr_redirect_enabled = body.qr_redirect_enabled;

    const success = await updateEdgeConfig(updateData);

    // Handle QR token invalidation/reactivation based on global setting
    let qrTokensAffected = 0;
    if (body.qr_redirect_enabled !== undefined) {
      if (body.qr_redirect_enabled === false) {
        // Invalidate all QR tokens when QR is globally disabled
        qrTokensAffected = await invalidateAllQRTokens();
        console.log(`Invalidated ${qrTokensAffected} QR tokens due to global QR disable`);
      } else if (body.qr_redirect_enabled === true) {
        // Reactivate all QR tokens when QR is globally re-enabled
        qrTokensAffected = await reactivateAllQRTokens();
        console.log(`Reactivated ${qrTokensAffected} QR tokens due to global QR enable`);
      }
    }

    if (!success) {
      // Check if required environment variables are missing
      const hasApiToken = !!process.env.VERCEL_API_TOKEN;
      const hasEdgeConfigId = !!process.env.EDGE_CONFIG_ID;

      if (!hasApiToken || !hasEdgeConfigId) {
        return NextResponse.json({
          error: 'Configuration update failed',
          message: 'Missing required environment variables for automatic updates',
          requirements: {
            VERCEL_API_TOKEN: hasApiToken ? 'Set' : 'Missing',
            EDGE_CONFIG_ID: hasEdgeConfigId ? 'Set' : 'Missing',
            VERCEL_TEAM_ID: 'Optional'
          },
          manualInstructions: `
            To enable automatic updates, add these environment variables:
            1. VERCEL_API_TOKEN: Create a token at https://vercel.com/account/tokens
            2. EDGE_CONFIG_ID: Find this in your Edge Config settings

            Or update manually in Vercel dashboard:
            - whatsapp_link: ${body.whatsapp_link || 'current value'}
            - qr_redirect_enabled: ${body.qr_redirect_enabled !== undefined ? body.qr_redirect_enabled : 'current value'}
          `
        }, { status: 500, headers });
      }

      return NextResponse.json({
        error: 'Failed to update configuration. Please try again or contact support.'
      }, { status: 500, headers });
    }

    console.log(`WhatsApp config updated by ${authResult.data.user.email}:`, updateData);

    const responseMessage = qrTokensAffected > 0
      ? `Configuration updated successfully. ${qrTokensAffected} QR tokens were ${body.qr_redirect_enabled ? 'reactivated' : 'invalidated'}.`
      : 'Configuration updated successfully';

    return NextResponse.json({
      success: true,
      message: responseMessage,
      updated: updateData,
      qrTokensAffected
    }, { headers });

  } catch (error) {
    console.error('WhatsApp config update error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers }
    );
  }
}

// Handle unsupported methods
export async function PUT() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}

export async function DELETE() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}