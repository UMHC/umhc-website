// Next.js middleware for security and caching controls
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { addNoCacheHeaders } from './src/middleware/no-cache';

export function middleware(request: NextRequest) {
  // Create response
  const response = NextResponse.next();

  // Add no-cache headers for sensitive routes
  return addNoCacheHeaders(request, response);
}

// Configure which paths this middleware runs on
export const config = {
  matcher: [
    // Match all paths except static files and API routes that don't need protection
    '/((?!_next/static|_next/image|favicon.ico|images|icons|.*\\.(?:png|jpg|jpeg|gif|webp|svg|ico)$).*)',
  ],
};