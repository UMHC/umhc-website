import { NextRequest, NextResponse } from 'next/server';
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { CachedFinanceService } from '@/lib/financeServiceCached';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    // Check authentication
    const { getUser, isAuthenticated, getPermissions } = getKindeServerSession();
    
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

    // Check if user has treasurer permission - only treasurers can edit transactions
    const permissions = await getPermissions();
    const hasTreasurerPermission = permissions?.permissions?.includes('is-treasurer') ?? false;
    
    if (!hasTreasurerPermission) {
      return NextResponse.json(
        { error: 'Treasurer permission required to edit transactions' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const transaction = await request.json();
    
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

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    // Check authentication
    const { getUser, isAuthenticated, getPermissions } = getKindeServerSession();
    
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

    // Check if user has treasurer permission - only treasurers can delete transactions
    const permissions = await getPermissions();
    const hasTreasurerPermission = permissions?.permissions?.includes('is-treasurer') ?? false;
    
    if (!hasTreasurerPermission) {
      return NextResponse.json(
        { error: 'Treasurer permission required to delete transactions' },
        { status: 403 }
      );
    }

    const { id } = await params;
    
    await CachedFinanceService.deleteTransaction(id);

    // Return success without cache headers (mutations shouldn't be cached)
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting transaction:', error);
    return NextResponse.json(
      { error: 'Failed to delete transaction' },
      { status: 500 }
    );
  }
}

export const runtime = 'edge';