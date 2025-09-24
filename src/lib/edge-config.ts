// Edge Config integration for WhatsApp link management
import { get } from '@vercel/edge-config';

export interface EdgeConfigData {
  whatsapp_link: string;
  qr_redirect_enabled: boolean;
}

// Default fallback values if Edge Config is not available
const DEFAULT_CONFIG: EdgeConfigData = {
  whatsapp_link: process.env.WHATSAPP_GROUP_LINK || 'https://chat.whatsapp.com/fallback',
  qr_redirect_enabled: true
};

/**
 * Get the current WhatsApp group link from Edge Config
 * Falls back to environment variable if Edge Config is unavailable
 */
export async function getWhatsAppLink(): Promise<string> {
  try {
    const whatsappLink = await get('whatsapp_link');

    if (typeof whatsappLink === 'string' && whatsappLink.startsWith('https://chat.whatsapp.com/')) {
      return whatsappLink;
    }

    // Fall back to environment variable
    return DEFAULT_CONFIG.whatsapp_link;
  } catch (error) {
    console.warn('Failed to get WhatsApp link from Edge Config:', error);
    return DEFAULT_CONFIG.whatsapp_link;
  }
}

/**
 * Check if QR redirect is enabled
 */
export async function isQRRedirectEnabled(): Promise<boolean> {
  try {
    const qrEnabled = await get('qr_redirect_enabled');
    return typeof qrEnabled === 'boolean' ? qrEnabled : DEFAULT_CONFIG.qr_redirect_enabled;
  } catch (error) {
    console.warn('Failed to get QR redirect status from Edge Config:', error);
    return DEFAULT_CONFIG.qr_redirect_enabled;
  }
}

/**
 * Get all Edge Config data
 */
export async function getEdgeConfig(): Promise<EdgeConfigData> {
  try {
    const [whatsappLink, qrEnabled] = await Promise.all([
      getWhatsAppLink(),
      isQRRedirectEnabled()
    ]);

    return {
      whatsapp_link: whatsappLink,
      qr_redirect_enabled: qrEnabled
    };
  } catch (error) {
    console.warn('Failed to get Edge Config data:', error);
    return DEFAULT_CONFIG;
  }
}

/**
 * Update Edge Config values via Vercel API
 * This requires VERCEL_API_TOKEN and VERCEL_TEAM_ID environment variables
 */
export async function updateEdgeConfig(config: Partial<EdgeConfigData>): Promise<boolean> {
  try {
    const apiToken = process.env.VERCEL_API_TOKEN;
    const teamId = process.env.VERCEL_TEAM_ID;
    const edgeConfigId = process.env.EDGE_CONFIG_ID;

    if (!apiToken || !edgeConfigId) {
      console.error('Missing required environment variables for Edge Config update');
      return false;
    }

    // Build the API URL
    const baseUrl = teamId
      ? `https://api.vercel.com/v1/edge-config/${edgeConfigId}/items?teamId=${teamId}`
      : `https://api.vercel.com/v1/edge-config/${edgeConfigId}/items`;

    // Prepare the update payload
    const items = Object.entries(config).map(([key, value]) => ({
      operation: 'update',
      key,
      value
    }));

    const response = await fetch(baseUrl, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${apiToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ items }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Edge Config update failed:', response.status, errorText);
      return false;
    }

    const result = await response.json();
    console.log('Edge Config updated successfully:', result);
    return true;

  } catch (error) {
    console.error('Edge Config update error:', error);
    return false;
  }
}