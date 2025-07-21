import { NextResponse } from 'next/server';
import { CachedFinanceService } from '@/lib/financeServiceCached';
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server';

export async function GET() {
  try {
    // Check authentication
    const { isAuthenticated, getRoles } = getKindeServerSession();
    
    if (!isAuthenticated()) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    
    // Check committee role
    const roles = await getRoles();
    const hasCommitteeRole = roles?.some(role => role.key === 'is-committee');
    
    if (!hasCommitteeRole) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
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