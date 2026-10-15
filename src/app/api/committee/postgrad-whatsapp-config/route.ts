import { NextRequest, NextResponse } from 'next/server';
import { requireCommitteeAccess, hasPermission } from '@/middleware/auth';
import { cleanupExpiredPostgradTokens, getPostgradAccessLogs } from '@/lib/postgrad-access-tokens';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { getEdgeConfig, updateEdgeConfig } from '@/lib/edge-config';

async function authorised(request: NextRequest) { const result = await requireCommitteeAccess(request); if (!result.success) return result; if (!hasPermission(result.data.permissions, 'manage-postgrad-whatsapp')) return { success: false as const, response: NextResponse.json({ error: 'You do not have permission to manage the Postgraduate WhatsApp group' }, { status: 403 }) }; return result; }
export const dynamic = 'force-dynamic';
export async function GET(request: NextRequest) {
  const auth = await authorised(request); if (!auth.success) return auth.response;
  const config = await getEdgeConfig(); const logs = await getPostgradAccessLogs(50); const { data: requests } = await supabaseAdmin.schema('whatsapp_security').from('postgrad_requests').select('id,email,phone,status,created_at').order('created_at', { ascending: false }).limit(50);
  const cleaned = await cleanupExpiredPostgradTokens();
  return NextResponse.json({ success: true, config: { whatsapp_postgrad_link: config.whatsapp_postgrad_link }, accessLogs: [...logs.map((log) => ({ ...log, type: 'access' })), ...(requests || []).map((request) => ({ ...request, verification_method: 'manual_approval', type: 'manual' }))].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()), cleanupResult: { expiredTokensCleaned: cleaned } }, { headers: { 'Cache-Control': 'no-store' } });
}
export async function POST(request: NextRequest) {
  const auth = await authorised(request); if (!auth.success) return auth.response;
  const { whatsapp_postgrad_link } = await request.json();
  if (typeof whatsapp_postgrad_link !== 'string' || !whatsapp_postgrad_link.startsWith('https://chat.whatsapp.com/')) return NextResponse.json({ error: 'Invalid WhatsApp link' }, { status: 400 });
  if (!(await updateEdgeConfig({ whatsapp_postgrad_link }))) return NextResponse.json({ error: 'Configuration update failed' }, { status: 500 });
  return NextResponse.json({ success: true, message: 'Postgraduate WhatsApp link updated successfully' });
}