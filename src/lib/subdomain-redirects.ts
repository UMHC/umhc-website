/**
 * Subdomain redirect mapping for past UMHC websites
 * Maps subdomains to their respective archived websites
 */
export const subdomainRedirects: Record<string, string> = {
    "finance.umhc.org.uk": "https://lucasholik.github.io/umhc-treasurer/",
    "2024.umhc.org.uk": "https://umhcdev.wixsite.com/umhc",
    "2023.umhc.org.uk": "https://umhc.org.uk/404"
  // Add more year mappings as needed
};

/**
 * Get redirect URL for a given hostname
 * @param hostname - The request hostname (e.g., "2024.umhc.org.uk")
 * @returns The redirect URL if found, undefined otherwise
 */
export function getRedirectUrl(hostname: string): string | undefined {
  return subdomainRedirects[hostname.toLowerCase()];
}
