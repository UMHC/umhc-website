/**
 * Subdomain redirect mapping for past UMHC websites
 * Maps subdomains to their respective archived websites
 */
export const subdomainRedirects: Record<string, string> = {
  '2024.umhc.org.uk': 'https://umhcdev.wixsite.com/umhc',
  '2023.umhc.org.uk': 'https://umhc.org.uk/404',
  'mail.umhc.org.uk': 'https://accounts.zoho.eu/signin?servicename=VirtualOffice&signupurl=https://www.zoho.com/mail/signup.html&serviceurl=https://mail.zoho.eu',
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
