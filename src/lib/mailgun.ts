import Mailgun from 'mailgun.js';
import formData from 'form-data';

// Initialize Mailgun client
const mailgun = new Mailgun(formData);

interface MailgunConfig {
  apiKey: string;
  domain: string;
  mg?: ReturnType<typeof mailgun.client>;
}

let config: MailgunConfig | null = null;

function getMailgunClient() {
  if (!config) {
    const apiKey = process.env.MAILGUN_API_KEY;
    const domain = 'verify.umhc.org.uk';

    if (!apiKey) {
      throw new Error('MAILGUN_API_KEY environment variable is required');
    }

    config = {
      apiKey,
      domain,
      mg: mailgun.client({
        username: 'api',
        key: apiKey,
        url: 'https://api.eu.mailgun.net' // EU endpoint for GDPR compliance
      })
    };
  }

  return config;
}

export interface MailgunEmailData {
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
  'h:Reply-To'?: string;
  'h:X-Mailgun-Track-Clicks'?: string;
  'h:X-Mailgun-Track-Opens'?: string;
}

export interface MailgunError {
  isRateLimit: boolean;
  error: string;
}

/**
 * Send email using Mailgun with the verify.umhc.org.uk domain
 */
export async function sendMailgunEmail(emailData: MailgunEmailData): Promise<boolean> {
  try {
    const { mg, domain } = getMailgunClient();

    if (!mg) {
      console.error('Mailgun client not initialized');
      return false;
    }

    // Set default from address if not provided
    const fromAddress = emailData.from || `UMHC <noreply@${domain}>`;

    const messageData = {
      ...emailData,
      from: fromAddress,
      // Disable tracking by default for privacy
      'h:X-Mailgun-Track-Clicks': emailData['h:X-Mailgun-Track-Clicks'] || 'false',
      'h:X-Mailgun-Track-Opens': emailData['h:X-Mailgun-Track-Opens'] || 'false',
    };

    const result = await mg.messages.create(domain, messageData);

    if (!result || !result.id) {
      console.error('Mailgun email sending failed - no message ID returned');
      return false;
    }

    return true;
  } catch (error) {
    console.error('Mailgun email sending error:', error);
    return false;
  }
}

/**
 * Send email using Mailgun with detailed error information
 */
export async function sendMailgunEmailWithError(emailData: MailgunEmailData): Promise<{ success: boolean; error?: MailgunError }> {
  try {
    const { mg, domain } = getMailgunClient();

    if (!mg) {
      console.error('Mailgun client not initialized');
      return {
        success: false,
        error: {
          isRateLimit: false,
          error: 'Email service not configured properly'
        }
      };
    }

    // Set default from address if not provided
    const fromAddress = emailData.from || `UMHC <noreply@${domain}>`;

    const messageData = {
      ...emailData,
      from: fromAddress,
      // Disable tracking by default for privacy
      'h:X-Mailgun-Track-Clicks': emailData['h:X-Mailgun-Track-Clicks'] || 'false',
      'h:X-Mailgun-Track-Opens': emailData['h:X-Mailgun-Track-Opens'] || 'false',
    };

    const result = await mg.messages.create(domain, messageData);

    if (!result || !result.id) {
      console.error('Mailgun email sending failed - no message ID returned');
      return {
        success: false,
        error: {
          isRateLimit: false,
          error: 'Email sending failed'
        }
      };
    }

    return { success: true };
  } catch (error: unknown) {
    console.error('Mailgun email sending error:', error);

    // Check if it's a rate limit error
    const isRateLimit = Boolean(
      (error as { status?: number })?.status === 429 ||
      (error as { response?: { status?: number } })?.response?.status === 429 ||
      (typeof error === 'object' && error !== null && 'message' in error &&
        typeof (error as { message: string }).message === 'string' &&
        (error as { message: string }).message.toLowerCase().includes('rate limit')) ||
      (error as { response?: { data?: { message?: string } } })?.response?.data?.message?.toLowerCase()?.includes('rate limit')
    );

    return {
      success: false,
      error: {
        isRateLimit,
        error: isRateLimit
          ? 'Email service is currently experiencing high volume. Please try again in a few hours.'
          : 'Email sending failed'
      }
    };
  }
}

/**
 * Validate Mailgun configuration
 */
export function validateMailgunConfig(): { isValid: boolean; error?: string } {
  try {
    const apiKey = process.env.MAILGUN_API_KEY;

    if (!apiKey) {
      return {
        isValid: false,
        error: 'MAILGUN_API_KEY environment variable is required'
      };
    }

    if (!apiKey.startsWith('key-') && !apiKey.startsWith('pubkey-')) {
      return {
        isValid: false,
        error: 'MAILGUN_API_KEY must be a valid Mailgun API key'
      };
    }

    return { isValid: true };
  } catch (error) {
    return {
      isValid: false,
      error: error instanceof Error ? error.message : 'Unknown validation error'
    };
  }
}

// Re-export for backward compatibility during transition
// DEPRECATED: Use sendMailgunEmail instead
export async function sendEmail(emailData: MailgunEmailData): Promise<boolean> {
  console.warn('DEPRECATED: sendEmail function is deprecated, use sendMailgunEmail instead');
  return sendMailgunEmail(emailData);
}