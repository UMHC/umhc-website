// QR Token Management for Secure WhatsApp Access
import { supabaseAdmin } from './supabase-admin';

export interface QRToken {
  id: string;
  token: string;
  name: string;
  enabled: boolean;
  created_at: string;
  created_by: string | null;
  last_used_at: string | null;
  use_count: number;
}

export interface QRAccessLog {
  id: string;
  qr_token: string;
  ip_hash: string | null;
  user_agent_hash: string | null;
  accessed_at: string;
  status: 'successful_redirect' | 'token_disabled' | 'token_not_found' | 'qr_disabled_globally';
}

/**
 * Create a new QR token
 */
export async function createQRToken(name: string, createdBy?: string): Promise<string | null> {
  try {
    const { data, error } = await supabaseAdmin
      .schema('whatsapp_security')
      .rpc('create_qr_token', {
        token_name: name,
        created_by_email: createdBy || null
      });

    if (error) {
      console.error('Error creating QR token:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Unexpected error creating QR token:', error);
    return null;
  }
}

/**
 * Get all QR tokens
 */
export async function getQRTokens(): Promise<QRToken[]> {
  try {
    const { data, error } = await supabaseAdmin
      .schema('whatsapp_security')
      .from('qr_tokens')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching QR tokens:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Unexpected error fetching QR tokens:', error);
    return [];
  }
}

/**
 * Validate a QR token and check if it's enabled
 */
export async function validateQRToken(token: string): Promise<{
  valid: boolean;
  token?: QRToken;
  reason?: string;
}> {
  try {
    const { data, error } = await supabaseAdmin
      .schema('whatsapp_security')
      .from('qr_tokens')
      .select('*')
      .eq('token', token)
      .single();

    if (error || !data) {
      return {
        valid: false,
        reason: 'token_not_found'
      };
    }

    if (!data.enabled) {
      return {
        valid: false,
        token: data,
        reason: 'token_disabled'
      };
    }

    return {
      valid: true,
      token: data
    };
  } catch (error) {
    console.error('Error validating QR token:', error);
    return {
      valid: false,
      reason: 'validation_error'
    };
  }
}

/**
 * Enable or disable a specific QR token
 */
export async function toggleQRToken(tokenId: string, enabled: boolean): Promise<boolean> {
  try {
    const { error } = await supabaseAdmin
      .schema('whatsapp_security')
      .from('qr_tokens')
      .update({ enabled })
      .eq('id', tokenId);

    if (error) {
      console.error('Error toggling QR token:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Unexpected error toggling QR token:', error);
    return false;
  }
}

/**
 * Delete a QR token completely
 */
export async function deleteQRToken(tokenId: string): Promise<boolean> {
  try {
    const { error } = await supabaseAdmin
      .schema('whatsapp_security')
      .from('qr_tokens')
      .delete()
      .eq('id', tokenId);

    if (error) {
      console.error('Error deleting QR token:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Unexpected error deleting QR token:', error);
    return false;
  }
}

/**
 * Invalidate all QR tokens (when QR feature is globally disabled)
 */
export async function invalidateAllQRTokens(): Promise<number> {
  try {
    const { data, error } = await supabaseAdmin
      .schema('whatsapp_security')
      .rpc('invalidate_all_qr_tokens');

    if (error) {
      console.error('Error invalidating QR tokens:', error);
      return 0;
    }

    return data || 0;
  } catch (error) {
    console.error('Unexpected error invalidating QR tokens:', error);
    return 0;
  }
}

/**
 * Reactivate all QR tokens (when QR feature is globally re-enabled)
 */
export async function reactivateAllQRTokens(): Promise<number> {
  try {
    const { data, error } = await supabaseAdmin
      .schema('whatsapp_security')
      .rpc('reactivate_all_qr_tokens');

    if (error) {
      console.error('Error reactivating QR tokens:', error);
      return 0;
    }

    return data || 0;
  } catch (error) {
    console.error('Unexpected error reactivating QR tokens:', error);
    return 0;
  }
}

/**
 * Log QR access attempt
 */
export async function logQRAccess(
  token: string,
  status: QRAccessLog['status'],
  clientIP?: string,
  userAgent?: string
): Promise<boolean> {
  try {
    const { error } = await supabaseAdmin
      .schema('whatsapp_security')
      .rpc('log_qr_access', {
        access_token: token,
        client_ip: clientIP || null,
        client_user_agent: userAgent || null,
        access_status: status
      });

    if (error) {
      console.error('Error logging QR access:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Unexpected error logging QR access:', error);
    return false;
  }
}

/**
 * Get QR access logs for monitoring
 */
export async function getQRAccessLogs(limit: number = 100): Promise<QRAccessLog[]> {
  try {
    const { data, error } = await supabaseAdmin
      .schema('whatsapp_security')
      .from('qr_access_logs')
      .select('*')
      .order('accessed_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching QR access logs:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Unexpected error fetching QR access logs:', error);
    return [];
  }
}

/**
 * Generate QR code URL for a token with UMHC logo
 */
export function generateQRCodeURL(token: string, size: number = 300, baseURL?: string): string {
  const base = baseURL || (typeof window !== 'undefined' ? window.location.origin : 'https://umhc.org.uk');
  const qrURL = `${base}/qr/${token}`;

  // Use our custom QR generation endpoint with UMHC logo
  const apiBase = typeof window !== 'undefined' ? window.location.origin : base;
  return `${apiBase}/api/qr-code?data=${encodeURIComponent(qrURL)}&size=${size}`;
}