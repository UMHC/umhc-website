// Simplified access token management for WhatsApp verification revamp
import { supabaseAdmin } from './supabase-admin';
import crypto from 'crypto';

export interface AccessTokenData {
  email: string;
  phone?: string;
  verification_method: 'ac_uk_email' | 'manual_approval';
  ip_hash?: string;
}

export interface AccessToken extends AccessTokenData {
  id: string;
  token: string;
  status: 'active' | 'used' | 'expired';
  created_at: string;
  expires_at: string;
  used_at?: string;
  phone?: string;
}

export interface AccessLog {
  id: string;
  email: string;
  phone?: string;
  verification_method: 'ac_uk_email' | 'manual_approval';
  token: string;
  status: string;
  ip_hash?: string;
  created_at: string;
}

/**
 * Generate a secure fragment token for SafeLinks compatibility
 */
export function generateFragmentToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Hash IP address for privacy-compliant duplicate detection
 */
export function hashIP(ipAddress: string): string {
  const salt = process.env.IP_HASH_SALT || 'umhc_default_salt';
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
  return crypto.createHash('sha256').update(ipAddress + salt + today).digest('hex');
}

/**
 * Create a new access token
 */
export async function createAccessToken(
  email: string,
  verificationMethod: 'ac_uk_email' | 'manual_approval',
  ipAddress?: string,
  phone?: string
): Promise<string | null> {
  try {
    const token = generateFragmentToken();
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours
    const ipHash = ipAddress ? hashIP(ipAddress) : undefined;

    const { error } = await supabaseAdmin
      .schema('whatsapp_security')
      .from('access_tokens')
      .insert({
        token,
        email,
        phone: phone || null,
        verification_method: verificationMethod,
        status: 'active',
        created_at: now.toISOString(),
        expires_at: expiresAt.toISOString(),
        ip_hash: ipHash
      });

    if (error) {
      console.error('Error creating access token:', error);
      return null;
    }

    return token;
  } catch (error) {
    console.error('Unexpected error creating access token:', error);
    return null;
  }
}

/**
 * Get access token data by token string
 */
export async function getAccessToken(token: string): Promise<AccessToken | null> {
  try {
    const { data, error } = await supabaseAdmin
      .schema('whatsapp_security')
      .from('access_tokens')
      .select('*')
      .eq('token', token)
      .eq('status', 'active')
      .single();

    if (error || !data) {
      return null;
    }

    // Check if token is expired
    const now = new Date();
    const expiresAt = new Date(data.expires_at);

    if (now > expiresAt) {
      // Mark as expired
      await markTokenAsExpired(token);
      return null;
    }

    return data as AccessToken;
  } catch (error) {
    console.error('Error getting access token:', error);
    return null;
  }
}

/**
 * Mark a token as used
 */
export async function markTokenAsUsed(token: string): Promise<boolean> {
  try {
    const { error } = await supabaseAdmin
      .schema('whatsapp_security')
      .from('access_tokens')
      .update({
        status: 'used',
        used_at: new Date().toISOString()
      })
      .eq('token', token);

    if (error) {
      console.error('Error marking token as used:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Unexpected error marking token as used:', error);
    return false;
  }
}

/**
 * Mark a token as expired
 */
export async function markTokenAsExpired(token: string): Promise<boolean> {
  try {
    const { error } = await supabaseAdmin
      .schema('whatsapp_security')
      .from('access_tokens')
      .update({
        status: 'expired'
      })
      .eq('token', token);

    if (error) {
      console.error('Error marking token as expired:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Unexpected error marking token as expired:', error);
    return false;
  }
}

/**
 * Log successful WhatsApp access
 */
export async function logAccess(
  email: string,
  verificationMethod: 'ac_uk_email' | 'manual_approval',
  token: string,
  ipAddress?: string,
  phone?: string
): Promise<boolean> {
  try {
    const ipHash = ipAddress ? hashIP(ipAddress) : undefined;

    const { error } = await supabaseAdmin
      .schema('whatsapp_security')
      .from('access_logs')
      .insert({
        email,
        phone: phone || null,
        verification_method: verificationMethod,
        token,
        status: 'successful_join',
        ip_hash: ipHash,
        created_at: new Date().toISOString()
      });

    if (error) {
      console.error('Error logging access:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Unexpected error logging access:', error);
    return false;
  }
}

/**
 * Clean up expired tokens (call periodically)
 */
export async function cleanupExpiredTokens(): Promise<number> {
  try {
    // Try to use the stored function first
    const { data, error: rpcError } = await supabaseAdmin
      .schema('whatsapp_security')
      .rpc('cleanup_expired_access_tokens');

    if (!rpcError && typeof data === 'number') {
      return data;
    }

    // Fallback: manual cleanup
    const { error, count } = await supabaseAdmin
      .schema('whatsapp_security')
      .from('access_tokens')
      .update({ status: 'expired' })
      .eq('status', 'active')
      .lt('expires_at', new Date().toISOString());

    if (error) {
      console.error('Cleanup failed:', error);
      return 0;
    }

    return count || 0;
  } catch (error) {
    console.error('Unexpected error cleaning up tokens:', error);
    return 0;
  }
}

/**
 * Get access logs for monitoring (committee use)
 */
export async function getAccessLogs(limit: number = 100): Promise<AccessLog[]> {
  try {
    const { data, error } = await supabaseAdmin
      .schema('whatsapp_security')
      .from('access_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error getting access logs:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Unexpected error getting access logs:', error);
    return [];
  }
}

/**
 * Check for duplicate email/phone combinations across both systems
 * Returns details about existing usage if found
 */
export async function checkForDuplicates(email: string, phone?: string): Promise<{
  emailUsed: boolean;
  phoneUsed: boolean;
  emailDetails?: { verification_method: string; created_at: string };
  phoneDetails?: { verification_method: string; created_at: string };
}> {
  try {
    const result = {
      emailUsed: false,
      phoneUsed: false,
      emailDetails: undefined as { verification_method: string; created_at: string } | undefined,
      phoneDetails: undefined as { verification_method: string; created_at: string } | undefined
    };

    // Check access_logs for recent successful joins (within last 90 days)
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    // Check email usage in access logs
    const { data: emailLogs, error: emailError } = await supabaseAdmin
      .schema('whatsapp_security')
      .from('access_logs')
      .select('email, verification_method, created_at')
      .eq('email', email.toLowerCase())
      .eq('status', 'successful_join')
      .gte('created_at', ninetyDaysAgo.toISOString())
      .order('created_at', { ascending: false })
      .limit(1);

    if (!emailError && emailLogs && emailLogs.length > 0) {
      result.emailUsed = true;
      result.emailDetails = emailLogs[0];
    }

    // Check phone usage across both systems (only check if phone provided)
    if (phone) {
      // Check access_logs for phone usage (university email system)
      const { data: phoneAccessLogs, error: phoneAccessError } = await supabaseAdmin
        .schema('whatsapp_security')
        .from('access_logs')
        .select('phone, email, verification_method, created_at')
        .eq('phone', phone)
        .eq('status', 'successful_join')
        .gte('created_at', ninetyDaysAgo.toISOString())
        .order('created_at', { ascending: false })
        .limit(1);

      if (!phoneAccessError && phoneAccessLogs && phoneAccessLogs.length > 0) {
        // Only flag as duplicate if it's a different email
        if (phoneAccessLogs[0].email.toLowerCase() !== email.toLowerCase()) {
          result.phoneUsed = true;
          result.phoneDetails = {
            verification_method: phoneAccessLogs[0].verification_method,
            created_at: phoneAccessLogs[0].created_at
          };
        }
      }

      // Also check manual requests table for phone usage (if not already found)
      if (!result.phoneUsed) {
        const { data: phoneRequests, error: phoneError } = await supabaseAdmin
          .schema('whatsapp_security')
          .from('whatsapp_requests')
          .select('phone, email, status, created_at')
          .eq('phone', phone)
          .in('status', ['approved', 'pending'])
          .gte('created_at', ninetyDaysAgo.toISOString())
          .order('created_at', { ascending: false })
          .limit(1);

        if (!phoneError && phoneRequests && phoneRequests.length > 0) {
          // Only flag as duplicate if it's a different email
          if (phoneRequests[0].email.toLowerCase() !== email.toLowerCase()) {
            result.phoneUsed = true;
            result.phoneDetails = {
              verification_method: 'manual_approval',
              created_at: phoneRequests[0].created_at
            };
          }
        }
      }
    }

    return result;
  } catch (error) {
    console.error('Error checking for duplicates:', error);
    // Return safe default - don't block on error
    return {
      emailUsed: false,
      phoneUsed: false
    };
  }
}

/**
 * Format duplicate error message with contact information
 */
export function formatDuplicateError(): string {
  // Use generic message for all duplicate cases
  return 'One of the inputs you provided has already been used to request access and can only be used once. If you believe this is an error or would like some help with this please reach out to us at whatsapp@umhc.org.uk';
}