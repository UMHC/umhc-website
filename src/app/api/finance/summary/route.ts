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

    const summary = await CachedFinanceService.getFinancialSummary();

    const response = NextResponse.json(summary);
    
    // Set cache headers for client-side and CDN caching
    response.headers.set('Cache-Control', 'public, s-maxage=600, stale-while-revalidate=300');
    response.headers.set('CDN-Cache-Control', 'public, s-maxage=600');
    response.headers.set('Vercel-CDN-Cache-Control', 'public, s-maxage=600');
    
    return response;
  } catch (error) {
    console.error('Error fetching financial summary:', error);
    return NextResponse.json(
      { error: 'Failed to fetch financial summary' },
      { status: 500 }
    );
  }
}

export const runtime = 'edge';
export const revalidate = 600; // Revalidate every 10 minutes