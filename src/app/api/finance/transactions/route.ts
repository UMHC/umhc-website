import { NextRequest, NextResponse } from 'next/server';
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { createClient } from '@supabase/supabase-js';
import { CachedFinanceService } from '@/lib/financeServiceCached';

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
    // Check authentication
    const { getUser, isAuthenticated, getRoles, getPermissions } = getKindeServerSession();
    
    if (!isAuthenticated()) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    const user = await getUser();
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 401 }
      );
    }
    
    // Check authorization - only committee members or treasurers can add transactions
    const [roles, permissions] = await Promise.all([
      getRoles(), 
      getPermissions()
    ]);
    const hasCommitteeRole = roles?.some(role => role.key === 'is-committee');
    const hasTreasurerPermission = permissions?.permissions?.includes('is-treasurer') ?? false;
    
    if (!hasCommitteeRole && !hasTreasurerPermission) {
      return NextResponse.json(
        { error: 'Insufficient permissions. Committee or treasurer access required.' },
        { status: 403 }
      );
    }
    
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
    
    console.log('Service role key available:', !!supabaseServiceRoleKey);
    console.log('Service role key length:', supabaseServiceRoleKey?.length);
    
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
    
    // First test if we can access the transactions table in finance schema
    console.log('Testing table access in finance schema...');
    try {
      const { error: testError } = await supabaseAdmin
        .schema('finance')
        .from('transactions')
        .select('id')
        .limit(1);
      
      if (testError) {
        console.error('Finance schema table access test failed:', {
          message: testError.message,
          details: testError.details,
          hint: testError.hint,
          code: testError.code,
          fullError: testError
        });
      } else {
        console.log('Finance schema table access test successful');
      }
    } catch (testErr) {
      console.error('Finance schema table access test exception:', testErr);
    }
    
    // Add transaction to finance schema (consistent with other services)
    console.log('Attempting to add transaction to finance.transactions...');
    const { data, error } = await supabaseAdmin
      .schema('finance')
      .from('transactions')
      .insert([sanitizedTransaction])
      .select()
      .single();
    
    if (error) {
      console.error('Database error details:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
        fullError: error
      });
      throw error;
    }
    
    console.log('Transaction added successfully:', data);
    
    // Invalidate cache
    // You might want to implement cache invalidation here
    
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Error adding transaction:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      fullError: error,
      errorType: typeof error,
      errorConstructor: error?.constructor?.name
    });
    
    // Provide more detailed error information
    if (error && typeof error === 'object' && 'code' in error) {
      const dbError = error as { code: string; message: string };
      
      if (dbError.code === '42501') {
        return NextResponse.json(
          { 
            error: 'Database permission denied. Please contact an administrator.',
            details: 'The system does not have permission to add transactions.'
          },
          { status: 403 }
        );
      }
      
      if (dbError.code === '23505') {
        return NextResponse.json(
          { 
            error: 'Duplicate transaction detected.',
            details: 'A transaction with these details already exists.'
          },
          { status: 409 }
        );
      }
    }
    
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