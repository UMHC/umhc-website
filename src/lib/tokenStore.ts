// Persistent token store for WhatsApp verification system using Supabase
import { supabaseAdmin } from './supabase-admin';

export interface TokenData {
  email: string;
  phone: string;
  trips?: string;
  createdAt: number;
  used: boolean;
}

// Database row interface (internal use)
interface TokenRow {
  id: string;
  token: string;
  email: string;
  phone: string;
  trips: string | null;
  created_at: string;
  expires_at: string;
  used: boolean;
  used_at: string | null;
}

// Convert database row to TokenData interface for compatibility
function rowToTokenData(row: TokenRow): TokenData {
  return {
    email: row.email,
    phone: row.phone,
    trips: row.trips || undefined,
    createdAt: new Date(row.created_at).getTime(),
    used: row.used
  };
}

// Create a new token in the database
export async function createToken(token: string, tokenData: TokenData): Promise<boolean> {
  try {
    const { error } = await supabaseAdmin
      .schema('whatsapp_security')
      .from('verification_tokens')
      .insert({
        token,
        email: tokenData.email,
        phone: tokenData.phone,
        trips: tokenData.trips || null,
        created_at: new Date(tokenData.createdAt).toISOString(),
        used: tokenData.used
      });

    if (error) {
      // If table doesn't exist, log but don't fail the whole operation
      if (error.code === '42501' || error.code === '42P01') {
        console.log('Token storage table not set up yet - token not persisted');
        return true; // Don't fail the whole operation
      }
      console.error('Error creating token:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Unexpected error creating token:', error);
    return false;
  }
}

// Get token data from the database
export async function getToken(token: string): Promise<TokenData | null> {
  try {
    const { data, error } = await supabaseAdmin
      .schema('whatsapp_security')
      .from('verification_tokens')
      .select('*')
      .eq('token', token)
      .single();

    if (error) {
      // If table doesn't exist, this is expected - return null gracefully
      if (error.code === '42501' || error.code === '42P01') {
        console.log('Token storage table not set up yet - token verification skipped');
        return null;
      }
      return null;
    }

    if (!data) {
      return null;
    }

    // Check if token is expired
    const now = new Date();
    const expiresAt = new Date(data.expires_at);

    if (now > expiresAt) {
      // Token is expired, delete it and return null
      await deleteToken(token);
      return null;
    }

    return rowToTokenData(data);
  } catch (error) {
    console.error('Error getting token:', error);
    return null;
  }
}

// Delete a token from the database
export async function deleteToken(token: string): Promise<boolean> {
  try {
    const { error } = await supabaseAdmin
      .schema('whatsapp_security')
      .from('verification_tokens')
      .delete()
      .eq('token', token);

    if (error) {
      console.error('Error deleting token:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Unexpected error deleting token:', error);
    return false;
  }
}

// Mark a token as used
export async function markTokenAsUsed(token: string): Promise<boolean> {
  try {
    const { error } = await supabaseAdmin
      .schema('whatsapp_security')
      .from('verification_tokens')
      .update({
        used: true,
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

// Clean up expired tokens (24 hour expiry)
export async function cleanupExpiredTokens(): Promise<number> {
  try {
    // Try to use the stored function first
    const { error: rpcError } = await supabaseAdmin
      .rpc('cleanup_expired_tokens', {}, {
        schema: 'whatsapp_security'
      });

    if (!rpcError) {
      return 0; // Success but we don't get count from RPC
    }

    // Fallback: manual cleanup if function doesn't exist
    const { error: fallbackError, count } = await supabaseAdmin
      .schema('whatsapp_security')
      .from('verification_tokens')
      .delete()
      .lt('expires_at', new Date().toISOString());

    if (fallbackError) {
      // If table doesn't exist, that's fine - no tokens to clean up
      if (fallbackError.code === '42501' || fallbackError.code === '42P01') {
        console.log('Token storage table not set up yet - skipping cleanup');
        return 0;
      }
      console.error('Fallback cleanup failed:', fallbackError);
      return 0;
    }

    return count || 0;
  } catch (error) {
    console.error('Unexpected error cleaning up tokens:', error);
    return 0;
  }
}

// Legacy compatibility functions for existing code
// These maintain the same interface as the old in-memory store

// Use global to persist across API route reloads in development (for backwards compatibility during migration)
declare global {
  var tokenStore: Map<string, TokenData> | undefined;
}

// Legacy Map-like interface for backwards compatibility
export const tokenStore = {
  // Set method - creates a new token
  set: async (token: string, data: TokenData): Promise<void> => {
    await createToken(token, data);
  },

  // Get method - retrieves token data
  get: async (token: string): Promise<TokenData | undefined> => {
    const data = await getToken(token);
    return data || undefined;
  },

  // Delete method - removes a token
  delete: async (token: string): Promise<boolean> => {
    return await deleteToken(token);
  },

  // Has method - checks if token exists
  has: async (token: string): Promise<boolean> => {
    const data = await getToken(token);
    return data !== null;
  }
};