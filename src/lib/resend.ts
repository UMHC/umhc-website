import { Resend } from 'resend';

interface ResendConfig {
  apiKey: string;
  resend?: Resend;
}

let config: ResendConfig | null = null;

function getResendClient() {
  if (!config) {
    const apiKey = process.env.RESEND_API_KEY;

    if (!apiKey) {
      throw new Error('RESEND_API_KEY environment variable is required');
    }

    config = {
      apiKey,
      resend: new Resend(apiKey)
    };
  }

  return config;
}

export interface ResendEmailData {
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
  replyTo?: string;
}

export interface ResendError {
  isRateLimit: boolean;
  error: string;
}

/**
 * Send email using Resend with the mail.umhc.org.uk domain
 */
export async function sendResendEmail(emailData: ResendEmailData): Promise<boolean> {
  try {
    const { resend } = getResendClient();

    if (!resend) {
      console.error('Resend client not initialized');
      return false;
    }

    // Set default from address if not provided
    const fromAddress = emailData.from || process.env.RESEND_FROM_EMAIL || 'UMHC Hiking Club <response@mail.umhc.org.uk>';

    const messageData = {
      from: fromAddress,
      to: emailData.to,
      subject: emailData.subject,
      html: emailData.html,
      ...(emailData.replyTo && { replyTo: emailData.replyTo })
    };

    const { error } = await resend.emails.send(messageData);

    if (error) {
      console.error('Resend email sending failed:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Resend email sending error:', error);
    return false;
  }
}

/**
 * Send email using Resend with detailed error information
 */
export async function sendResendEmailWithError(emailData: ResendEmailData): Promise<{ success: boolean; error?: ResendError }> {
  try {
    const { resend } = getResendClient();

    if (!resend) {
      console.error('Resend client not initialized');
      return {
        success: false,
        error: {
          isRateLimit: false,
          error: 'Email service not configured properly'
        }
      };
    }

    // Set default from address if not provided
    const fromAddress = emailData.from || process.env.RESEND_FROM_EMAIL || 'UMHC Hiking Club <response@mail.umhc.org.uk>';

    const messageData = {
      from: fromAddress,
      to: emailData.to,
      subject: emailData.subject,
      html: emailData.html,
      ...(emailData.replyTo && { replyTo: emailData.replyTo })
    };

    const { error } = await resend.emails.send(messageData);

    if (error) {
      console.error('Resend email sending failed:', error);
      
      // Check if it's a rate limit error
      const isRateLimit = Boolean(
        (error as { message?: string })?.message?.toLowerCase().includes('rate limit') ||
        (error as { message?: string })?.message?.toLowerCase().includes('too many requests')
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

    return { success: true };
  } catch (error: unknown) {
    console.error('Resend email sending error:', error);

    // Check if it's a rate limit error
    const isRateLimit = Boolean(
      (error as { status?: number })?.status === 429 ||
      (error as { response?: { status?: number } })?.response?.status === 429 ||
      (typeof error === 'object' && error !== null && 'message' in error &&
        typeof (error as { message: string }).message === 'string' &&
        (error as { message: string }).message.toLowerCase().includes('rate limit'))
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
 * Validate Resend configuration
 */
export function validateResendConfig(): { isValid: boolean; error?: string } {
  try {
    const apiKey = process.env.RESEND_API_KEY;

    if (!apiKey) {
      return {
        isValid: false,
        error: 'RESEND_API_KEY environment variable is required'
      };
    }

    if (!apiKey.startsWith('re_')) {
      return {
        isValid: false,
        error: 'RESEND_API_KEY must be a valid Resend API key'
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

// Backward compatibility functions during transition
export async function sendEmail(emailData: ResendEmailData): Promise<boolean> {
  return sendResendEmail(emailData);
}