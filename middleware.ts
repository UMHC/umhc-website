import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getRedirectUrl } from './src/lib/subdomain-redirects';
import { getRewriteUrl } from './src/lib/subdomain-rewrites';

export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || '';
  
  // Check if the hostname should be rewritten (proxied)
  const rewriteUrl = getRewriteUrl(hostname);
  
  if (rewriteUrl) {
    // REWRITE: Proxy content from external URL while keeping subdomain visible
    const url = new URL(request.url);
    const externalUrl = new URL(rewriteUrl);
    externalUrl.pathname = url.pathname;
    externalUrl.search = url.search;
    
    return NextResponse.rewrite(externalUrl);
  }
  
  // Check if the hostname matches any subdomain redirects
  const redirectUrl = getRedirectUrl(hostname);
  
  if (redirectUrl) {
    // Use 308 Permanent Redirect for SEO and caching benefits
    return NextResponse.redirect(redirectUrl, { status: 308 });
  }
  
  // Continue with normal request flow
  return NextResponse.next();
}

// Configure which routes the middleware should run on
// This runs on all routes to catch subdomain redirects
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
