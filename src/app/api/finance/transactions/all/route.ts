import { NextRequest, NextResponse } from 'next/server';
import { CachedFinanceService } from '@/lib/financeServiceCached';
import { requireCommitteeAccess } from '@/middleware/auth';

export async function GET(request: NextRequest) {
  try {
    // Check authentication and authorization using centralized middleware
    const authResult = await requireCommitteeAccess(request);
    if (!authResult.success) {
      return authResult.response;
    }

    const transactions = await CachedFinanceService.getAllTransactions();

    const response = NextResponse.json(transactions);
    
    // Set cache headers for client-side and CDN caching
    response.headers.set('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=150');
    response.headers.set('CDN-Cache-Control', 'public, s-maxage=300');
    response.headers.set('Vercel-CDN-Cache-Control', 'public, s-maxage=300');
    
    return response;
  } catch (error) {
    console.error('Error fetching all transactions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch all transactions' },
      { status: 500 }
    );
  }
}

export const runtime = 'edge';
export const revalidate = 300; // Revalidate every 5 minutes