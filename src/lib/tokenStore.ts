// Persistent token store for WhatsApp verification system using Supabase
import { supabaseAdmin } from './supabase-admin';

export interface TokenData {
  email: string;
  phone: string;
  trips?: string;
  createdAt: number;
  used: boolean;
}

// Extended interface for in-memory storage that includes expiry
interface TokenDataWithExpiry extends TokenData {
  expiresAt?: number;
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
    // Check if we should use fallback
    const useFallback = await shouldUseFallback();

    if (useFallback) {
      console.log('Using in-memory token storage fallback');
      // Add expiry information to token data
      const tokenWithExpiry = {
        ...tokenData,
        expiresAt: tokenData.createdAt + 24 * 60 * 60 * 1000 // 24 hours from now
      };
      global.inMemoryTokenStore!.set(token, tokenWithExpiry);
      return true;
    }

    // Set expiry to 24 hours from creation
    const createdAt = new Date(tokenData.createdAt);
    const expiresAt = new Date(createdAt.getTime() + 24 * 60 * 60 * 1000);

    const { error } = await supabaseAdmin
      .schema('whatsapp_security')
      .from('verification_tokens')
      .insert({
        token,
        email: tokenData.email,
        phone: tokenData.phone,
        trips: tokenData.trips || null,
        created_at: createdAt.toISOString(),
        expires_at: expiresAt.toISOString(),
        used: tokenData.used
      });

    if (error) {
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
    // Check if we should use fallback
    const useFallback = await shouldUseFallback();

    if (useFallback) {
      const data = global.inMemoryTokenStore!.get(token);
      if (!data) {
        return null;
      }

      // Check if token is expired (for in-memory storage)
      const now = Date.now();
      if (data.expiresAt && now > data.expiresAt) {
        global.inMemoryTokenStore!.delete(token);
        return null;
      }

      return data;
    }

    const { data, error } = await supabaseAdmin
      .schema('whatsapp_security')
      .from('verification_tokens')
      .select('*')
      .eq('token', token)
      .single();

    if (error) {
      console.error('Error retrieving token:', error);
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
    // Check if we should use fallback
    const useFallback = await shouldUseFallback();

    if (useFallback) {
      return global.inMemoryTokenStore!.delete(token);
    }

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
    // Check if we should use fallback
    const useFallback = await shouldUseFallback();

    if (useFallback) {
      const data = global.inMemoryTokenStore!.get(token);
      if (data) {
        global.inMemoryTokenStore!.set(token, { ...data, used: true });
        return true;
      }
      return false;
    }

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
    // Check if we should use fallback
    const useFallback = await shouldUseFallback();

    if (useFallback) {
      // Clean up expired tokens from in-memory store
      const now = Date.now();
      let cleaned = 0;

      for (const [token, data] of global.inMemoryTokenStore!.entries()) {
        if (data.expiresAt && now > data.expiresAt) {
          global.inMemoryTokenStore!.delete(token);
          cleaned++;
        }
      }

      return cleaned;
    }

    // Try to use the stored function first
    const { error: rpcError } = await supabaseAdmin
      .schema('whatsapp_security')
      .rpc('cleanup_expired_tokens', {});

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
      console.error('Cleanup failed:', fallbackError);
      return 0;
    }

    return count || 0;
  } catch (error) {
    console.error('Unexpected error cleaning up tokens:', error);
    return 0;
  }
}

// In-memory fallback for when database is not available
// Use global to persist across API route reloads in development
declare global {
  var inMemoryTokenStore: Map<string, TokenDataWithExpiry> | undefined;
}

// Initialize in-memory store
if (!global.inMemoryTokenStore) {
  global.inMemoryTokenStore = new Map<string, TokenDataWithExpiry>();
}

// Helper function to check if we should use in-memory fallback
async function shouldUseFallback(): Promise<boolean> {
  // Quick test to see if Supabase is properly configured
  try {
    const { error } = await supabaseAdmin
      .schema('whatsapp_security')
      .from('verification_tokens')
      .select('*')
      .limit(1);

    // If we get a table/schema not found error, use fallback
    return Boolean(error && (error.code === '42501' || error.code === '42P01'));
  } catch {
    return true; // Use fallback if any connection error
  }
}

// Legacy compatibility functions for existing code
// These maintain the same interface as the old in-memory store

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