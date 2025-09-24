// Middleware for adding no-cache headers to sensitive routes
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function addNoCacheHeaders(request: NextRequest, response: NextResponse) {
  // Define sensitive routes that should never be cached
  const sensitiveRoutes = [
    '/join',
    '/whatsapp',
    '/whatsapp-request',
    '/whatsapp-verify',
    '/qr',
    '/committee',
    '/api/join',
    '/api/whatsapp',
    '/api/whatsapp-simplified',
    '/api/whatsapp-request',
    '/api/committee'
  ];

  const pathname = request.nextUrl.pathname;
  const isSensitive = sensitiveRoutes.some(route =>
    pathname === route || pathname.startsWith(route + '/')
  );

  if (isSensitive) {
    // Add comprehensive no-cache headers
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    response.headers.set('Surrogate-Control', 'no-store');

    // Additional security headers for sensitive pages
    response.headers.set('X-Robots-Tag', 'noindex, nofollow, noarchive, nosnippet, noimageindex');

    // CSRF protection for state-changing operations
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      response.headers.set('X-Content-Type-Options', 'nosniff');
      response.headers.set('X-Frame-Options', 'DENY');
    }
  }

  return response;
}

// Helper function to get no-cache headers object
export function getNoCacheHeaders() {
  return {
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
    'Pragma': 'no-cache',
    'Expires': '0',
    'Surrogate-Control': 'no-store',
    'X-Robots-Tag': 'noindex, nofollow, noarchive, nosnippet, noimageindex',
  };
}