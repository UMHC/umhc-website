/**
 * Subdomain redirect mapping for past UMHC websites
 * Maps subdomains to their respective archived websites
 */
export const subdomainRedirects: Record<string, string> = {
    "2024.umhc.org.uk": "https://umhcdev.wixsite.com/umhc",
    "2023.umhc.org.uk": "https://umhc.org.uk/404",
    "2022.umhc.org.uk": "https://umhc.org.uk/404",
    "2021.umhc.org.uk": "https://umhc.org.uk/404",
    "2020.umhc.org.uk": "https://umhc.org.uk/404",
    "2019.umhc.org.uk": "https://umhc.org.uk/404",
    "2018.umhc.org.uk": "https://umhc.org.uk/404",
    "2017.umhc.org.uk": "https://umhc.org.uk/404",
    "2016.umhc.org.uk": "https://umhc.org.uk/404",
    "2015.umhc.org.uk": "https://umhc.org.uk/404",
    "2014.umhc.org.uk": "https://umhc.org.uk/404",
    "2013.umhc.org.uk": "https://umhc.org.uk/404",
    "2012.umhc.org.uk": "https://umhc.org.uk/404",
    "2011.umhc.org.uk": "https://umhc.org.uk/404",
    "2010.umhc.org.uk": "https://umhc.org.uk/404",
    "2009.umhc.org.uk": "https://umhc.org.uk/404",
    "2008.umhc.org.uk": "https://umhc.org.uk/404",
    "2007.umhc.org.uk": "https://umhc.org.uk/404",
    "2006.umhc.org.uk": "https://umhc.org.uk/404",
    "2005.umhc.org.uk": "https://umhc.org.uk/404",
    "2004.umhc.org.uk": "https://umhc.org.uk/404",
    "2003.umhc.org.uk": "https://umhc.org.uk/404",
    "2002.umhc.org.uk": "https://umhc.org.uk/404",
    "2001.umhc.org.uk": "https://umhc.org.uk/404",
    "2000.umhc.org.uk": "https://umhc.org.uk/404",
    "1999.umhc.org.uk": "https://umhc.org.uk/404",
    "1998.umhc.org.uk": "https://umhc.org.uk/404"

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
