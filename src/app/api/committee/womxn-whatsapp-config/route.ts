import { NextRequest, NextResponse } from 'next/server';
import { requireCommitteeAccess, hasPermission } from '@/middleware/auth';
import { getWomxnAccessLogs, cleanupExpiredWomxnTokens } from '@/lib/womxn-access-tokens';
import { supabaseAdmin } from '@/lib/supabase-admin';

interface WomxnWhatsAppConfigRequest {
  whatsapp_womxn_link?: string;
}

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// GET - Get current Womxn WhatsApp configuration and access logs
export async function GET(request: NextRequest) {
  const headers = {
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0',
  };

  try {
    const authResult = await requireCommitteeAccess(request);
    if (!authResult.success) {
      return authResult.response;
    }

    if (!hasPermission(authResult.data.permissions, 'manage-womxn-whatsapp')) {
      return NextResponse.json(
        { error: 'You do not have permission to manage the Womxn WhatsApp group' },
        { status: 403, headers }
      );
    }

    const { getEdgeConfig } = await import('@/lib/edge-config');
    const config = await getEdgeConfig();

    const accessLogs = await getWomxnAccessLogs(50);

    const { data: manualRequests, error: manualError } = await supabaseAdmin
      .schema('whatsapp_security')
      .from('womxn_requests')
      .select('id, email, phone, first_name, surname, status, created_at')
      .order('created_at', { ascending: false })
      .limit(50);

    if (manualError) {
      console.warn('Failed to fetch Womxn manual requests:', manualError);
    }

    const combinedLogs = [
      ...accessLogs.map(log => ({
        id: log.id,
        email: log.email,
        phone: log.phone,
        verification_method: log.verification_method,
        status: log.status,
        created_at: log.created_at,
        type: 'access' as const,
      })),
      ...(manualRequests || []).map(req => ({
        id: `manual_${req.id}`,
        email: req.email,
        phone: req.phone,
        verification_method: 'manual_approval' as const,
        status: req.status,
        created_at: req.created_at,
        type: 'manual' as const,
      })),
    ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    const cleanedTokens = await cleanupExpiredWomxnTokens();

    // Only expose the womxn link, not the general link
    const womxnConfig = { whatsapp_womxn_link: config.whatsapp_womxn_link };

    return NextResponse.json(
      {
        success: true,
        config: womxnConfig,
        accessLogs: combinedLogs,
        cleanupResult: { expiredTokensCleaned: cleanedTokens },
      },
      { headers }
    );
  } catch (error) {
    console.error('Womxn WhatsApp config API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500, headers });
  }
}

// POST - Update Womxn WhatsApp link in Edge Config
export async function POST(request: NextRequest) {
  const headers = {
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0',
  };

  try {
    const authResult = await requireCommitteeAccess(request);
    if (!authResult.success) {
      return authResult.response;
    }

    if (!hasPermission(authResult.data.permissions, 'manage-womxn-whatsapp')) {
      return NextResponse.json(
        { error: 'You do not have permission to manage the Womxn WhatsApp group' },
        { status: 403, headers }
      );
    }

    const body: WomxnWhatsAppConfigRequest = await request.json();

    if (body.whatsapp_womxn_link) {
      if (!body.whatsapp_womxn_link.startsWith('https://chat.whatsapp.com/')) {
        return NextResponse.json(
          { error: 'Invalid WhatsApp link. Must start with https://chat.whatsapp.com/' },
          { status: 400, headers }
        );
      }
    }

    const { updateEdgeConfig } = await import('@/lib/edge-config');

    const updateData: { whatsapp_womxn_link?: string } = {};
    if (body.whatsapp_womxn_link) updateData.whatsapp_womxn_link = body.whatsapp_womxn_link;

    const success = await updateEdgeConfig(updateData);

    if (!success) {
      const hasApiToken = !!process.env.VERCEL_API_TOKEN;
      const hasEdgeConfigId = !!process.env.EDGE_CONFIG_ID;

      if (!hasApiToken || !hasEdgeConfigId) {
        return NextResponse.json(
          {
            error: 'Configuration update failed',
            message: 'Missing required environment variables for automatic updates',
            requirements: {
              VERCEL_API_TOKEN: hasApiToken ? 'Set' : 'Missing',
              EDGE_CONFIG_ID: hasEdgeConfigId ? 'Set' : 'Missing',
            },
          },
          { status: 500, headers }
        );
      }

      return NextResponse.json(
        { error: 'Failed to update configuration. Please try again or contact support.' },
        { status: 500, headers }
      );
    }

    console.log(`Womxn WhatsApp config updated by ${authResult.data.user.email}:`, updateData);

    return NextResponse.json(
      { success: true, message: 'Configuration updated successfully', updated: updateData },
      { headers }
    );
  } catch (error) {
    console.error('Womxn WhatsApp config update error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500, headers });
  }
}

export async function PUT() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}
