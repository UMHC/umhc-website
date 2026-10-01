// Womxn WhatsApp access token management
// Completely isolated from general WhatsApp token tables
import { supabaseAdmin } from './supabase-admin';
import crypto from 'crypto';

export interface WomxnAccessToken {
  id: string;
  token: string;
  email: string;
  phone?: string;
  verification_method: 'ac_uk_email' | 'manual_approval';
  status: 'active' | 'used' | 'expired';
  created_at: string;
  expires_at: string;
  used_at?: string;
}

export interface WomxnAccessLog {
  id: string;
  email: string;
  phone?: string;
  verification_method: 'ac_uk_email' | 'manual_approval';
  token: string;
  status: string;
  ip_hash?: string;
  created_at: string;
}

export interface CreateWomxnAccessTokenResult {
  token: string | null;
  errorCode?: string;
  errorMessage?: string;
}

function generateFragmentToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

function hashIP(ipAddress: string): string {
  const salt = process.env.IP_HASH_SALT || 'umhc_default_salt';
  const today = new Date().toISOString().split('T')[0];
  return crypto.createHash('sha256').update(ipAddress + salt + today).digest('hex');
}

function isMissingColumnError(error: unknown, columnName: string): boolean {
  if (!error || typeof error !== 'object') return false;

  const maybeError = error as { message?: string; code?: string };
  const message = maybeError.message || '';

  return maybeError.code === 'PGRST204' && message.includes(`'${columnName}'`);
}

export async function createWomxnAccessToken(
  email: string,
  verificationMethod: 'ac_uk_email' | 'manual_approval',
  ipAddress?: string,
  phone?: string
): Promise<CreateWomxnAccessTokenResult> {
  try {
    const token = generateFragmentToken();
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const ipHash = ipAddress ? hashIP(ipAddress) : undefined;

    const payloadWithIpHash = {
      token,
      email,
      phone: phone || null,
      verification_method: verificationMethod,
      status: 'active',
      created_at: now.toISOString(),
      expires_at: expiresAt.toISOString(),
      ip_hash: ipHash,
    };

    const { error } = await supabaseAdmin
      .schema('whatsapp_security')
      .from('womxn_access_tokens')
      .insert(payloadWithIpHash);

    if (error) {
      // Backwards-compatibility for environments where the migration omitted ip_hash.
      if (isMissingColumnError(error, 'ip_hash')) {
        const { error: fallbackError } = await supabaseAdmin
          .schema('whatsapp_security')
          .from('womxn_access_tokens')
          .insert({
            token,
            email,
            phone: phone || null,
            verification_method: verificationMethod,
            status: 'active',
            created_at: now.toISOString(),
            expires_at: expiresAt.toISOString(),
          });

        if (!fallbackError) {
          return { token };
        }

        console.error('Error creating Womxn access token (fallback):', fallbackError);
        return {
          token: null,
          errorCode: fallbackError.code,
          errorMessage: fallbackError.message,
        };
      }

      console.error('Error creating Womxn access token:', error);
      return {
        token: null,
        errorCode: error.code,
        errorMessage: error.message,
      };
    }

    return { token };
  } catch (error) {
    console.error('Unexpected error creating Womxn access token:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return { token: null, errorMessage: message };
  }
}

export async function getWomxnAccessToken(token: string): Promise<WomxnAccessToken | null> {
  try {
    const { data, error } = await supabaseAdmin
      .schema('whatsapp_security')
      .from('womxn_access_tokens')
      .select('*')
      .eq('token', token)
      .eq('status', 'active')
      .single();

    if (error || !data) return null;

    const now = new Date();
    if (now > new Date(data.expires_at)) {
      await supabaseAdmin
        .schema('whatsapp_security')
        .from('womxn_access_tokens')
        .update({ status: 'expired' })
        .eq('token', token);
      return null;
    }

    return data as WomxnAccessToken;
  } catch (error) {
    console.error('Error getting Womxn access token:', error);
    return null;
  }
}

export async function markWomxnTokenAsUsed(token: string): Promise<boolean> {
  try {
    const { error } = await supabaseAdmin
      .schema('whatsapp_security')
      .from('womxn_access_tokens')
      .update({ status: 'used', used_at: new Date().toISOString() })
      .eq('token', token);
    return !error;
  } catch {
    return false;
  }
}

export async function logWomxnAccess(
  email: string,
  verificationMethod: 'ac_uk_email' | 'manual_approval',
  token: string,
  ipAddress?: string,
  phone?: string
): Promise<boolean> {
  return logWomxnEvent(email, verificationMethod, token, 'successful_join', ipAddress, phone);
}

export async function logWomxnEvent(
  email: string,
  verificationMethod: 'ac_uk_email' | 'manual_approval',
  token: string,
  status: string,
  ipAddress?: string,
  phone?: string
): Promise<boolean> {
  try {
    const ipHash = ipAddress ? hashIP(ipAddress) : undefined;
    const payloadWithIpHash = {
      email,
      phone: phone || null,
      verification_method: verificationMethod,
      token,
      status,
      ip_hash: ipHash,
      created_at: new Date().toISOString(),
    };

    const { error } = await supabaseAdmin
      .schema('whatsapp_security')
      .from('womxn_access_logs')
      .insert(payloadWithIpHash);

    if (error) {
      if (isMissingColumnError(error, 'ip_hash')) {
        const { error: fallbackError } = await supabaseAdmin
          .schema('whatsapp_security')
          .from('womxn_access_logs')
          .insert({
            email,
            phone: phone || null,
            verification_method: verificationMethod,
            token,
            status,
            created_at: new Date().toISOString(),
          });

        return !fallbackError;
      }

      return false;
    }

    return true;
  } catch {
    return false;
  }
}

export async function deleteWomxnAccessToken(token: string): Promise<boolean> {
  try {
    const { error } = await supabaseAdmin
      .schema('whatsapp_security')
      .from('womxn_access_tokens')
      .delete()
      .eq('token', token);
    return !error;
  } catch {
    return false;
  }
}

export async function getWomxnAccessLogs(limit = 100): Promise<WomxnAccessLog[]> {
  try {
    const { data, error } = await supabaseAdmin
      .schema('whatsapp_security')
      .from('womxn_access_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) return [];
    return data || [];
  } catch {
    return [];
  }
}

export async function cleanupExpiredWomxnTokens(): Promise<number> {
  try {
    const { error, count } = await supabaseAdmin
      .schema('whatsapp_security')
      .from('womxn_access_tokens')
      .update({ status: 'expired' })
      .eq('status', 'active')
      .lt('expires_at', new Date().toISOString());

    if (error) return 0;
    return count || 0;
  } catch {
    return 0;
  }
}

export async function checkWomxnForDuplicates(
  email: string,
  phone?: string
): Promise<{ emailUsed: boolean; phoneUsed: boolean }> {
  try {
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    const { data: emailLogs } = await supabaseAdmin
      .schema('whatsapp_security')
      .from('womxn_access_logs')
      .select('email')
      .eq('email', email.toLowerCase())
      .eq('status', 'successful_join')
      .gte('created_at', ninetyDaysAgo.toISOString())
      .limit(1);

    const emailUsed = (emailLogs?.length ?? 0) > 0;

    let phoneUsed = false;
    if (phone) {
      const { data: phoneLogs } = await supabaseAdmin
        .schema('whatsapp_security')
        .from('womxn_access_logs')
        .select('phone, email')
        .eq('phone', phone)
        .eq('status', 'successful_join')
        .gte('created_at', ninetyDaysAgo.toISOString())
        .limit(1);

      if (phoneLogs?.length && phoneLogs[0].email.toLowerCase() !== email.toLowerCase()) {
        phoneUsed = true;
      }

      if (!phoneUsed) {
        const { data: phoneReqs } = await supabaseAdmin
          .schema('whatsapp_security')
          .from('womxn_requests')
          .select('phone, email')
          .eq('phone', phone)
          .in('status', ['approved', 'pending'])
          .gte('created_at', ninetyDaysAgo.toISOString())
          .limit(1);

        if (phoneReqs?.length && phoneReqs[0].email.toLowerCase() !== email.toLowerCase()) {
          phoneUsed = true;
        }
      }
    }

    return { emailUsed, phoneUsed };
  } catch {
    return { emailUsed: false, phoneUsed: false };
  }
}

export function formatWomxnDuplicateError(): string {
  return 'One of the inputs you provided has already been used to request access and can only be used once. If you believe this is an error or would like some help with this please reach out to us at whatsapp@umhc.org.uk';
}
