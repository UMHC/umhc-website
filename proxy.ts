// Next.js 16 proxy configuration
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { addNoCacheHeaders } from './src/middleware/no-cache';
import { withAuth } from "@kinde-oss/kinde-auth-nextjs/middleware";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Protected routes - require authentication
  if (pathname.startsWith('/committee') || pathname.startsWith('/api/finance')) {
    return withAuth(request, {
      isReturnToCurrentPage: true,
    });
  }

  // Add no-cache headers for sensitive routes
  const response = NextResponse.next();
  return addNoCacheHeaders(request, response);
}

// Configure which paths this proxy runs on
export const config = {
  matcher: [
    // Match all paths except static files
    '/((?!_next/static|_next/image|favicon.ico|images|icons|.*\\.(?:png|jpg|jpeg|gif|webp|svg|ico)$).*)',
  ],
};
