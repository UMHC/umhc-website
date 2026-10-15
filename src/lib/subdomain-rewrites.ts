/**
 * Subdomain rewrite (proxy) mapping
 * Maps subdomains to external URLs that should be proxied
 * User sees the subdomain URL but gets content from the target
 */
export const subdomainRewrites: Record<string, string> = {
  // Add more proxy subdomains as needed
};

/**
 * Get rewrite URL for a given hostname
 * @param hostname - The request hostname (e.g., "subdomain.umhc.org.uk")
 * @returns The rewrite URL if found, undefined otherwise
 */
export function getRewriteUrl(hostname: string): string | undefined {
  return subdomainRewrites[hostname.toLowerCase()];
}
