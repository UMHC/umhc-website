import { NextRequest, NextResponse } from 'next/server';
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { BudgetService } from '@/lib/budgetService';
import { ExpenseCategory } from '@/types/finance';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const fiscalYear = searchParams.get('fiscalYear') 
      ? parseInt(searchParams.get('fiscalYear')!) 
      : undefined;
    const type = searchParams.get('type') || 'budgets';

    console.log('Budget API called:', { type, fiscalYear });

    if (type === 'vs-actual') {
      const data = await BudgetService.getBudgetVsActual(fiscalYear);
      return NextResponse.json(data);
    } else if (type === 'summary') {
      const data = await BudgetService.getBudgetSummary(fiscalYear);
      return NextResponse.json(data);
    } else {
      const data = await BudgetService.getCategoryBudgets(fiscalYear);
      return NextResponse.json(data);
    }
  } catch (error) {
    console.error('Error fetching budget data:', error);
    
    // Check if this is a database table not found error
    if (error instanceof Error && (
      error.message.includes('relation') && error.message.includes('does not exist') ||
      error.message.includes('schema') && error.message.includes('does not exist')
    )) {
      return NextResponse.json(
        { 
          error: 'Budget tables not found. Please set up the budget tables by running the budget setup SQL script.', 
          details: error.message,
          setupRequired: true
        },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch budget data', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
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

    // Check if user has treasurer permission - only treasurers can edit budgets
    const permissions = await getPermissions();
    const hasTreasurerPermission = permissions?.permissions?.includes('is-treasurer') ?? false;
    
    if (!hasTreasurerPermission) {
      return NextResponse.json(
        { error: 'Treasurer access required to edit budgets' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { category, budget_amount, fiscal_year, budget_period } = body;

    // Validate required fields
    if (!category || budget_amount === undefined) {
      return NextResponse.json(
        { error: 'Category and budget amount are required' },
        { status: 400 }
      );
    }

    // Validate budget amount
    if (budget_amount < 0) {
      return NextResponse.json(
        { error: 'Budget amount must be non-negative' },
        { status: 400 }
      );
    }

    const result = await BudgetService.updateCategoryBudget(
      category as ExpenseCategory,
      budget_amount,
      fiscal_year,
      budget_period || 'annual'
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error creating/updating budget:', error);
    return NextResponse.json(
      { error: 'Failed to create/update budget' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
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

    // Check if user has treasurer permission - only treasurers can edit budgets
    const permissions = await getPermissions();
    const hasTreasurerPermission = permissions?.permissions?.includes('is-treasurer') ?? false;
    
    if (!hasTreasurerPermission) {
      return NextResponse.json(
        { error: 'Treasurer access required to edit budgets' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') as ExpenseCategory;
    const fiscalYear = searchParams.get('fiscalYear') 
      ? parseInt(searchParams.get('fiscalYear')!) 
      : undefined;
    const budgetPeriod = searchParams.get('budgetPeriod') as 'monthly' | 'quarterly' | 'annual' || 'annual';

    if (!category) {
      return NextResponse.json(
        { error: 'Category is required' },
        { status: 400 }
      );
    }

    await BudgetService.deleteCategoryBudget(category, fiscalYear, budgetPeriod);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting budget:', error);
    return NextResponse.json(
      { error: 'Failed to delete budget' },
      { status: 500 }
    );
  }
}
