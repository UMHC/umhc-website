import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { validateRequestBody, manualWhatsAppRequestSchema } from '@/lib/validation';
import { checkPostgradForDuplicates, formatPostgradDuplicateError } from '@/lib/postgrad-access-tokens';

const attempts = new Map<string, { count: number; reset: number }>();
function allowed(ip: string) { const now = Date.now(); const current = attempts.get(ip); if (!current || now > current.reset) { attempts.set(ip, { count: 1, reset: now + 900000 }); return true; } if (current.count >= 3) return false; current.count += 1; return true; }
async function verifyTurnstile(token: string) { const secret = process.env.TURNSTILE_SECRET_KEY; if (!secret) return false; const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: `secret=${encodeURIComponent(secret)}&response=${encodeURIComponent(token)}` }); return response.ok && (await response.json()).success === true; }

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    if (!allowed(ip)) return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 });
    const validation = await validateRequestBody(request, manualWhatsAppRequestSchema);
    if (!validation.success) return NextResponse.json({ error: validation.error }, { status: 400 });
    const { firstName, surname, phone, email, userType, trips, turnstileToken } = validation.data;
    if (!(await verifyTurnstile(turnstileToken))) return NextResponse.json({ error: 'Security verification failed' }, { status: 400 });
    const duplicate = await checkPostgradForDuplicates(email, phone);
    if (duplicate.emailUsed || duplicate.phoneUsed) return NextResponse.json({ error: formatPostgradDuplicateError() }, { status: 400 });
    const { error } = await supabaseAdmin.schema('whatsapp_security').from('postgrad_requests').insert({ first_name: firstName, surname, email, phone, user_type: userType, trips, status: 'pending' });
    if (error) return NextResponse.json({ error: 'Failed to submit request. Please try again.' }, { status: 500 });
    return NextResponse.json({ success: true, message: 'Request submitted successfully' });
  } catch (error) { console.error('Postgrad manual request API error:', error); return NextResponse.json({ error: 'Internal server error' }, { status: 500 }); }
}
export async function GET() { return NextResponse.json({ error: 'Method not allowed' }, { status: 405 }); }