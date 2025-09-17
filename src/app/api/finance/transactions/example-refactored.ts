/**
 * Example: Refactored finance transactions API route using the new auth middleware
 * This demonstrates how to use the centralized authorization middleware
 */
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { CachedFinanceService } from '@/lib/financeServiceCached';
import { requireFinanceAccess, logSecurityEvent } from '@/middleware/auth';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);

    // Validate parameters
    if (page < 1 || limit < 1 || limit > 100) {
      return NextResponse.json(
        { error: 'Invalid page or limit parameters' },
        { status: 400 }
      );
    }

    const result = await CachedFinanceService.getTransactions(page, limit);

    const response = NextResponse.json(result);

    // Set cache headers for client-side and CDN caching
    response.headers.set('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=150');
    response.headers.set('CDN-Cache-Control', 'public, s-maxage=300');
    response.headers.set('Vercel-CDN-Cache-Control', 'public, s-maxage=300');

    return response;
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch transactions' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Use centralized auth middleware - single line replaces ~30 lines of auth code!
    const authResult = await requireFinanceAccess(request);
    if (!authResult.success) {
      return authResult.response; // Standardized error response
    }

    // Extract user and permission data from auth result
    const { user } = authResult.data;

    // Log security event for audit trail
    logSecurityEvent('finance_transaction_create_attempt', {
      userId: user.id,
      userEmail: user.email,
      hasCommitteeAccess: authResult.data.hasCommitteeAccess,
      hasTreasurerAccess: authResult.data.hasTreasurerAccess
    }, request);

    const transaction = await request.json();

    // Validate required fields
    if (!transaction.title || !transaction.amount || !transaction.type || !transaction.date) {
      return NextResponse.json(
        { error: 'Missing required fields: title, amount, type, date' },
        { status: 400 }
      );
    }

    // Validate transaction type
    if (!['income', 'expense'].includes(transaction.type)) {
      return NextResponse.json(
        { error: 'Invalid transaction type. Must be "income" or "expense"' },
        { status: 400 }
      );
    }

    // Validate amount
    if (typeof transaction.amount !== 'number' || transaction.amount <= 0) {
      return NextResponse.json(
        { error: 'Amount must be a positive number' },
        { status: 400 }
      );
    }

    // Validate date
    const transactionDate = new Date(transaction.date);
    if (isNaN(transactionDate.getTime()) || transactionDate > new Date()) {
      return NextResponse.json(
        { error: 'Invalid date or future date not allowed' },
        { status: 400 }
      );
    }

    // Validate category if provided
    const validCategories = [
      'accommodation', 'training', 'equipment', 'transport',
      'social_events', 'insurance', 'administration', 'food_catering',
      'membership', 'other'
    ];

    if (transaction.category && !validCategories.includes(transaction.category)) {
      return NextResponse.json(
        { error: 'Invalid category' },
        { status: 400 }
      );
    }

    // Sanitize inputs
    const sanitizedTransaction = {
      title: transaction.title.trim().substring(0, 100),
      description: transaction.description ? transaction.description.trim().substring(0, 500) : '',
      amount: Math.round(transaction.amount * 100) / 100, // Round to 2 decimal places
      type: transaction.type,
      category: transaction.category || null,
      date: transaction.date
    };

    console.log('Attempting to add transaction:', sanitizedTransaction);
    console.log('User:', user.email);

    // Create a Supabase client with service role key for admin operations
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseServiceRoleKey) {
      return NextResponse.json(
        { error: 'Server configuration error. Service role key not configured.' },
        { status: 500 }
      );
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // Add transaction to finance schema
    const { data, error } = await supabaseAdmin
      .schema('finance')
      .from('transactions')
      .insert([sanitizedTransaction])
      .select()
      .single();

    if (error) {
      console.error('Database error details:', error);

      // Handle specific database errors
      if (error.code === '42501') {
        return NextResponse.json(
          {
            error: 'Database permission denied. Please contact an administrator.',
            details: 'The system does not have permission to add transactions.'
          },
          { status: 403 }
        );
      }

      if (error.code === '23505') {
        return NextResponse.json(
          {
            error: 'Duplicate transaction detected.',
            details: 'A transaction with these details already exists.'
          },
          { status: 409 }
        );
      }

      throw error;
    }

    console.log('Transaction added successfully:', data);

    // Log successful transaction creation
    logSecurityEvent('finance_transaction_created', {
      userId: user.id,
      userEmail: user.email,
      transactionId: data.id,
      transactionTitle: data.title,
      transactionAmount: data.amount,
      transactionType: data.type
    }, request);

    return NextResponse.json(data, { status: 201 });

  } catch (error) {
    console.error('Error adding transaction:', error);

    // Log the error for security monitoring
    logSecurityEvent('finance_transaction_create_error', {
      error: error instanceof Error ? error.message : 'Unknown error',
      errorType: typeof error,
      errorConstructor: error?.constructor?.name
    }, request);

    return NextResponse.json(
      {
        error: 'Failed to add transaction',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export const runtime = 'edge';
export const revalidate = 300; // Revalidate every 5 minutes