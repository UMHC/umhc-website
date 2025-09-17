import { NextRequest, NextResponse } from 'next/server';
import { BudgetService } from '@/lib/budgetService';
import { ExpenseCategory } from '@/types/finance';
import { requireTreasurerAccess } from '@/middleware/auth';
import { validateRequestBody, validateQueryParams, budgetSchema, budgetQuerySchema } from '@/lib/validation';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Validate query parameters using Zod schema
    const validationResult = validateQueryParams(searchParams, budgetQuerySchema);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error },
        { status: 400 }
      );
    }

    const { fiscalYear, type } = validationResult.data;
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
    // Check authentication and authorization using centralized middleware
    const authResult = await requireTreasurerAccess(request);
    if (!authResult.success) {
      return authResult.response;
    }

    // Validate request body using Zod schema
    const validationResult = await validateRequestBody(request, budgetSchema);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error },
        { status: 400 }
      );
    }

    const { category, budget_amount, fiscal_year, budget_period } = validationResult.data;

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
    // Check authentication and authorization using centralized middleware
    const authResult = await requireTreasurerAccess(request);
    if (!authResult.success) {
      return authResult.response;
    }

    const { searchParams } = new URL(request.url);

    // Validate query parameters (partial budget schema for deletion)
    const deleteValidationSchema = budgetSchema.pick({ category: true, fiscal_year: true, budget_period: true }).partial();
    const validationResult = validateQueryParams(searchParams, deleteValidationSchema.extend({
      category: budgetSchema.shape.category // Make category required for deletion
    }));

    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error },
        { status: 400 }
      );
    }

    const { category, fiscal_year: fiscalYear, budget_period: budgetPeriod = 'annual' } = validationResult.data;

    await BudgetService.deleteCategoryBudget(category as ExpenseCategory, fiscalYear, budgetPeriod);

    return NextResponse.json({ success: true, message: 'Budget deleted successfully' });
  } catch (error) {
    console.error('Error deleting budget:', error);
    return NextResponse.json(
      { error: 'Failed to delete budget' },
      { status: 500 }
    );
  }
}
