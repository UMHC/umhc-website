import { z } from 'zod';
import { isValidPhoneNumber } from 'libphonenumber-js';

/**
 * UMHC Website Validation Schemas using Zod
 *
 * This file contains comprehensive validation schemas for all API inputs
 * across the UMHC website project. These schemas ensure data integrity,
 * security, and consistent validation across all endpoints.
 */

// ============================================================================
// COMMON/UTILITY VALIDATORS
// ============================================================================

/**
 * Custom Zod validator for international phone numbers using libphonenumber-js
 */
export const phoneNumberValidator = z.string()
  .min(1, 'Phone number is required')
  .refine(
    (phone) => {
      try {
        return isValidPhoneNumber(phone);
      } catch {
        return false;
      }
    },
    { message: 'Invalid phone number format' }
  );

/**
 * Email validator with proper regex
 */
export const emailValidator = z.string()
  .min(1, 'Email is required')
  .email('Please enter a valid email address')
  .max(254, 'Email address is too long');

/**
 * Positive number validator for financial amounts
 */
export const positiveAmountValidator = z.number()
  .positive('Amount must be greater than 0')
  .finite('Amount must be a valid number')
  .max(1000000, 'Amount cannot exceed £1,000,000');

/**
 * Non-negative number validator for budget amounts (can be 0)
 */
export const nonNegativeAmountValidator = z.number()
  .min(0, 'Amount cannot be negative')
  .finite('Amount must be a valid number')
  .max(1000000, 'Amount cannot exceed £1,000,000');

/**
 * Date validator that ensures date is not in the future (for transactions)
 */
export const pastOrPresentDateValidator = z.string()
  .datetime('Invalid date format')
  .refine(
    (date) => new Date(date) <= new Date(),
    { message: 'Date cannot be in the future' }
  );

/**
 * Future date validator (for events)
 */
export const futureDateValidator = z.string()
  .datetime('Invalid date format')
  .refine(
    (date) => new Date(date) >= new Date(),
    { message: 'Event date must be in the future' }
  );

/**
 * Sanitized string validator with length limits
 */
export const sanitizedStringValidator = (minLength: number, maxLength: number, fieldName: string) =>
  z.string()
    .min(minLength, `${fieldName} must be at least ${minLength} characters`)
    .max(maxLength, `${fieldName} cannot exceed ${maxLength} characters`)
    .transform(str => str.trim())
    .refine(str => str.length > 0, `${fieldName} cannot be empty after trimming`);

/**
 * Optional sanitized string validator
 */
export const optionalSanitizedStringValidator = (maxLength: number) =>
  z.string()
    .max(maxLength, `Text cannot exceed ${maxLength} characters`)
    .transform(str => str.trim() === '' ? undefined : str.trim())
    .optional();

// ============================================================================
// WHATSAPP REQUEST VALIDATION
// ============================================================================

/**
 * User type enum for WhatsApp requests
 */
export const userTypeSchema = z.enum(['alumni', 'public', 'incoming', 'other'], {
  message: 'Please select a valid user type'
});

/**
 * Manual WhatsApp request validation schema
 */
export const manualWhatsAppRequestSchema = z.object({
  firstName: sanitizedStringValidator(1, 50, 'First name'),
  surname: sanitizedStringValidator(1, 50, 'Surname'),
  phone: phoneNumberValidator,
  email: emailValidator,
  userType: userTypeSchema,
  trips: optionalSanitizedStringValidator(500),
  turnstileToken: z.string().min(1, 'Security verification is required'),
  // Honeypot field for bot detection
  website: z.string().optional().default('')
});

/**
 * WhatsApp request review schema (for committee actions)
 */
export const whatsAppRequestReviewSchema = z.object({
  requestId: z.union([
    z.string(),
    z.number()
  ]).transform((val) => String(val)),
  action: z.enum(['approve', 'reject'], {
    message: 'Action must be either approve or reject'
  }),
  reviewedBy: sanitizedStringValidator(1, 100, 'Reviewer name')
});

// ============================================================================
// FINANCE VALIDATION
// ============================================================================

/**
 * Transaction type enum
 */
export const transactionTypeSchema = z.enum(['income', 'expense'], {
  message: 'Transaction type must be either income or expense'
});

/**
 * Expense category enum
 */
export const expenseCategorySchema = z.enum([
  'accommodation',
  'training',
  'equipment',
  'transport',
  'social_events',
  'insurance',
  'administration',
  'food_catering',
  'membership',
  'other'
], {
  message: 'Please select a valid expense category'
});

/**
 * Budget period enum
 */
export const budgetPeriodSchema = z.enum(['monthly', 'quarterly', 'annual'], {
  message: 'Budget period must be monthly, quarterly, or annual'
});

/**
 * Transaction creation schema
 */
export const createTransactionSchema = z.object({
  title: sanitizedStringValidator(1, 100, 'Transaction title'),
  description: optionalSanitizedStringValidator(500),
  amount: positiveAmountValidator,
  type: transactionTypeSchema,
  category: expenseCategorySchema.optional(),
  date: pastOrPresentDateValidator
});

/**
 * Transaction update schema (allows partial updates)
 */
export const updateTransactionSchema = createTransactionSchema.partial();

/**
 * Pagination parameters schema
 */
export const paginationSchema = z.object({
  page: z.number().int().min(1, 'Page must be at least 1').max(1000, 'Page cannot exceed 1000'),
  limit: z.number().int().min(1, 'Limit must be at least 1').max(100, 'Limit cannot exceed 100')
});

/**
 * Budget creation/update schema
 */
export const budgetSchema = z.object({
  category: expenseCategorySchema,
  budget_amount: nonNegativeAmountValidator,
  fiscal_year: z.number().int().min(2020, 'Fiscal year must be at least 2020').max(2050, 'Fiscal year cannot exceed 2050').optional(),
  budget_period: budgetPeriodSchema.default('annual')
});

/**
 * Budget query parameters schema
 */
export const budgetQuerySchema = z.object({
  fiscalYear: z.number().int().min(2020).max(2050).optional(),
  type: z.enum(['budgets', 'vs-actual', 'summary']).default('budgets')
});

// ============================================================================
// EVENT VALIDATION
// ============================================================================

/**
 * Event type enum
 */
export const eventTypeSchema = z.enum(['hike', 'social', 'residential', 'other'], {
  message: 'Please select a valid event type'
});

/**
 * URL validator for optional links
 */
export const optionalUrlValidator = z.string()
  .url('Please enter a valid URL')
  .optional()
  .or(z.literal(''))
  .transform(url => url === '' ? undefined : url);

/**
 * What3Words validator
 */
export const what3wordsValidator = optionalSanitizedStringValidator(50);

/**
 * Event creation schema
 */
export const createEventSchema = z.object({
  title: sanitizedStringValidator(1, 200, 'Event title'),
  description: optionalSanitizedStringValidator(2000),
  event_type: eventTypeSchema,
  event_date: z.string()
    .refine((date) => {
      // Allow various date formats and ensure it's a valid date
      const parsedDate = new Date(date);
      return !isNaN(parsedDate.getTime()) && parsedDate > new Date('1900-01-01');
    }, 'Invalid event date format'),
  event_time: optionalSanitizedStringValidator(10),
  full_address: optionalSanitizedStringValidator(500),
  what3words: what3wordsValidator,
  su_website_url: optionalUrlValidator,
  dda_compliant_ramp_access: z.boolean().default(false),
  lift_access_within_building: z.boolean().default(false),
  accessible_toilets: z.boolean().default(false),
  gender_neutral_toilets: z.boolean().default(false),
  seating_available: z.boolean().default(false),
  alcohol_served: z.boolean().default(false),
  accessibility_notes: optionalSanitizedStringValidator(1000),
  event_image: optionalSanitizedStringValidator(500)
});

/**
 * Event update schema (includes ID and allows partial updates)
 */
export const updateEventSchema = createEventSchema.partial().extend({
  id: z.number().int().positive('Invalid event ID')
});

/**
 * Event deletion schema
 */
export const deleteEventSchema = z.object({
  id: z.number().int().positive('Invalid event ID')
});

/**
 * Event duplication schema
 */
export const duplicateEventSchema = z.object({
  id: z.number().int().positive('Invalid event ID')
});

// ============================================================================
// AUTHENTICATION & AUTHORIZATION VALIDATION
// ============================================================================

/**
 * User role schema
 */
export const userRoleSchema = z.object({
  key: z.string().min(1, 'Role key is required'),
  name: z.string().min(1, 'Role name is required')
});

/**
 * User permissions schema
 */
export const userPermissionsSchema = z.object({
  permissions: z.array(z.string()).default([])
});

/**
 * Token validation schema
 */
export const tokenSchema = z.string()
  .min(32, 'Token must be at least 32 characters')
  .max(128, 'Token cannot exceed 128 characters')
  .regex(/^[a-f0-9]+$/i, 'Token must be a valid hexadecimal string');

// ============================================================================
// QUERY PARAMETER VALIDATION
// ============================================================================

/**
 * Generic search parameters schema
 */
export const searchParamsSchema = z.object({
  q: z.string().max(100, 'Search query too long').optional(),
  sort: z.enum(['asc', 'desc']).default('desc'),
  sortBy: z.string().max(50, 'Sort field name too long').optional()
});

/**
 * Date range filter schema
 */
export const dateRangeSchema = z.object({
  startDate: z.string().datetime('Invalid start date format').optional(),
  endDate: z.string().datetime('Invalid end date format').optional()
}).refine(
  (data) => {
    if (data.startDate && data.endDate) {
      return new Date(data.startDate) <= new Date(data.endDate);
    }
    return true;
  },
  { message: 'Start date must be before or equal to end date' }
);

// ============================================================================
// API RESPONSE VALIDATION
// ============================================================================

/**
 * Standard API success response schema
 */
export const successResponseSchema = z.object({
  success: z.literal(true),
  message: z.string().optional(),
  data: z.any().optional()
});

/**
 * Standard API error response schema
 */
export const errorResponseSchema = z.object({
  error: z.string().min(1, 'Error message is required'),
  details: z.string().optional(),
  code: z.string().optional()
});

// ============================================================================
// RATE LIMITING VALIDATION
// ============================================================================

/**
 * Rate limit configuration schema
 */
export const rateLimitConfigSchema = z.object({
  windowMs: z.number().int().min(1000, 'Window must be at least 1 second').max(3600000, 'Window cannot exceed 1 hour'),
  maxAttempts: z.number().int().min(1, 'Max attempts must be at least 1').max(1000, 'Max attempts cannot exceed 1000')
});

// ============================================================================
// UTILITY FUNCTIONS FOR VALIDATION
// ============================================================================

/**
 * Validate and sanitize request body using a Zod schema
 */
export async function validateRequestBody<T>(
  request: Request,
  schema: z.ZodSchema<T>
): Promise<{ success: true; data: T } | { success: false; error: string }> {
  try {
    const body = await request.json();
    const validatedData = schema.parse(body);
    return { success: true, data: validatedData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessage = error.issues && Array.isArray(error.issues)
        ? error.issues.map((err: z.ZodIssue) => `${err.path.join('.')}: ${err.message}`).join(', ')
        : error.message || 'Validation failed';
      return { success: false, error: errorMessage };
    }
    return { success: false, error: 'Invalid request body format' };
  }
}

/**
 * Validate query parameters using a Zod schema
 */
export function validateQueryParams<T>(
  searchParams: URLSearchParams,
  schema: z.ZodSchema<T>
): { success: true; data: T } | { success: false; error: string } {
  try {
    const params: Record<string, unknown> = {};

    // Convert URLSearchParams to object with proper type conversion
    for (const [key, value] of searchParams.entries()) {
      // Try to convert numeric strings to numbers
      if (/^\d+$/.test(value)) {
        params[key] = parseInt(value, 10);
      } else if (/^\d*\.\d+$/.test(value)) {
        params[key] = parseFloat(value);
      } else if (value === 'true') {
        params[key] = true;
      } else if (value === 'false') {
        params[key] = false;
      } else {
        params[key] = value;
      }
    }

    const validatedData = schema.parse(params);
    return { success: true, data: validatedData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessage = error.issues && Array.isArray(error.issues)
        ? error.issues.map((err: z.ZodIssue) => `${err.path.join('.')}: ${err.message}`).join(', ')
        : error.message || 'Validation failed';
      return { success: false, error: errorMessage };
    }
    return { success: false, error: 'Invalid query parameters' };
  }
}

/**
 * Validate file upload parameters
 */
export const fileUploadSchema = z.object({
  filename: z.string().min(1, 'Filename is required').max(255, 'Filename too long'),
  size: z.number().int().min(1, 'File size must be greater than 0').max(10485760, 'File size cannot exceed 10MB'), // 10MB limit
  type: z.string().min(1, 'File type is required'),
  lastModified: z.number().int().min(0, 'Invalid last modified timestamp')
});

/**
 * Environment variable validation
 */
export const envVariablesSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url('Invalid Supabase URL'),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1, 'Supabase service role key is required'),
  TURNSTILE_SECRET_KEY: z.string().min(1, 'Turnstile secret key is required'),

  // NEW: Resend environment variables (switched back from Mailgun)
  RESEND_API_KEY: z.string().min(1, 'Resend API key is required'),
  RESEND_FROM_EMAIL: z.string().email('Invalid from email address'),

  // DEPRECATED: Mailgun environment variables - keeping for rollback compatibility
  // MAILGUN_API_KEY: z.string().min(1, 'Mailgun API key is required'),
  // MAILGUN_FROM_EMAIL: z.string().email('Invalid Mailgun from email address').optional(),

  NEXT_PUBLIC_BASE_URL: z.string().url('Invalid base URL')
});

// ============================================================================
// TYPE EXPORTS FOR TYPESCRIPT INTEGRATION
// ============================================================================

// Export TypeScript types from schemas for use in components and services
export type ManualWhatsAppRequest = z.infer<typeof manualWhatsAppRequestSchema>;
export type WhatsAppRequestReview = z.infer<typeof whatsAppRequestReviewSchema>;
export type CreateTransaction = z.infer<typeof createTransactionSchema>;
export type UpdateTransaction = z.infer<typeof updateTransactionSchema>;
export type Budget = z.infer<typeof budgetSchema>;
export type BudgetQuery = z.infer<typeof budgetQuerySchema>;
export type CreateEvent = z.infer<typeof createEventSchema>;
export type UpdateEvent = z.infer<typeof updateEventSchema>;
export type Pagination = z.infer<typeof paginationSchema>;
export type SearchParams = z.infer<typeof searchParamsSchema>;
export type DateRange = z.infer<typeof dateRangeSchema>;
export type FileUpload = z.infer<typeof fileUploadSchema>;
export type EnvVariables = z.infer<typeof envVariablesSchema>;

// Export commonly used enums
export { userTypeSchema as UserType };
export { transactionTypeSchema as TransactionType };
export { expenseCategorySchema as ExpenseCategory };
export { budgetPeriodSchema as BudgetPeriod };
export { eventTypeSchema as EventType };