import { NextRequest, NextResponse } from 'next/server';
import { CachedFinanceService } from '@/lib/financeServiceCached';
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server';

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const { getUser, isAuthenticated, getRoles } = getKindeServerSession();
    
    if (!isAuthenticated()) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    
    // Check committee role
    const roles = await getRoles();
    const hasCommitteeRole = roles?.some(role => role.key === 'is-committee');
    
    if (!hasCommitteeRole) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
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