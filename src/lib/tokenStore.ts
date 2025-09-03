// Shared token store for WhatsApp verification system
// In production, this should be replaced with Redis or a database

export interface TokenData {
  email: string;
  phone: string;
  trips?: string;
  createdAt: number;
  used: boolean;
}

// Use global to persist across API route reloads in development
declare global {
  var tokenStore: Map<string, TokenData> | undefined;
}

export const tokenStore: Map<string, TokenData> = global.tokenStore || new Map();

if (process.env.NODE_ENV === 'development') {
  global.tokenStore = tokenStore;
}

// Clean up expired tokens (24 hour expiry)
export function cleanupExpiredTokens() {
  const now = Date.now();
  const expiry = 24 * 60 * 60 * 1000; // 24 hours
  
  for (const [token, data] of tokenStore.entries()) {
    if (now - data.createdAt > expiry) {
      tokenStore.delete(token);
    }
  }
}