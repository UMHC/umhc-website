import { NextRequest, NextResponse } from 'next/server';
import { CachedFinanceService } from '@/lib/financeServiceCached';
import { requireFinanceAccess } from '@/middleware/auth';
import { validateRequestBody, validateQueryParams, createTransactionSchema, paginationSchema } from '@/lib/validation';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Validate query parameters using Zod schema
    const validationResult = validateQueryParams(searchParams, paginationSchema.partial());
    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error },
        { status: 400 }
      );
    }

    const { page = 1, limit = 20 } = validationResult.data;

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
    // Check authentication and authorization using centralized middleware
    const authResult = await requireFinanceAccess(request);
    if (!authResult.success) {
      return authResult.response;
    }

    const { user } = authResult.data;

    // Validate request body using Zod schema
    const validationResult = await validateRequestBody(request, createTransactionSchema);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error },
        { status: 400 }
      );
    }

    const sanitizedTransaction = validationResult.data;
    
    console.log('Attempting to add transaction:', sanitizedTransaction);
    console.log('User:', user.email);
    
    // Add transaction to finance schema using centralized supabase admin client
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