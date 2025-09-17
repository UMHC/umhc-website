import { NextRequest, NextResponse } from 'next/server';
import { CachedFinanceService } from '@/lib/financeServiceCached';
import { requireTreasurerAccess } from '@/middleware/auth';
import { validateRequestBody, updateTransactionSchema } from '@/lib/validation';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    // Check authentication and authorization using centralized middleware
    const authResult = await requireTreasurerAccess(request);
    if (!authResult.success) {
      return authResult.response;
    }

    const { id } = await params;

    // Validate request body using Zod schema
    const validationResult = await validateRequestBody(request, updateTransactionSchema);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error },
        { status: 400 }
      );
    }

    const transaction = validationResult.data;
    
    const result = await CachedFinanceService.updateTransaction(id, transaction);

    // Return the updated transaction without cache headers (mutations shouldn't be cached)
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error updating transaction:', error);
    return NextResponse.json(
      { error: 'Failed to update transaction' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    // Check authentication and authorization using centralized middleware
    const authResult = await requireTreasurerAccess(request);
    if (!authResult.success) {
      return authResult.response;
    }

    const { id } = await params;
    
    await CachedFinanceService.deleteTransaction(id);

    // Return success response in standardized format
    return NextResponse.json({ success: true, message: 'Transaction deleted successfully' });
  } catch (error) {
    console.error('Error deleting transaction:', error);
    return NextResponse.json(
      { error: 'Failed to delete transaction' },
      { status: 500 }
    );
  }
}

export const runtime = 'edge';