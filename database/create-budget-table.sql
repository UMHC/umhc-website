-- Create budget table for expense categories
-- Run this in your Supabase SQL editor

-- Create category_budgets table
CREATE TABLE IF NOT EXISTS finance.category_budgets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    category VARCHAR(20) NOT NULL CHECK (category IN (
        'accommodation', 'training', 'equipment', 'transport', 
        'social_events', 'insurance', 'administration', 'food_catering', 
        'membership', 'other'
    )),
    budget_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
    budget_period VARCHAR(20) NOT NULL DEFAULT 'annual' CHECK (budget_period IN ('monthly', 'quarterly', 'annual')),
    fiscal_year INTEGER NOT NULL DEFAULT EXTRACT(YEAR FROM NOW()),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(category, fiscal_year, budget_period)
);

-- Create a view for budget vs actual spending
CREATE OR REPLACE VIEW finance.budget_vs_actual AS
SELECT 
    cb.category,
    cb.budget_amount,
    cb.budget_period,
    cb.fiscal_year,
    COALESCE(spent.total_spent, 0) as total_spent,
    (cb.budget_amount - COALESCE(spent.total_spent, 0)) as remaining_budget,
    CASE 
        WHEN cb.budget_amount > 0 THEN 
            ROUND((COALESCE(spent.total_spent, 0) / cb.budget_amount * 100), 2)
        ELSE 0 
    END as percentage_used,
    CASE 
        WHEN COALESCE(spent.total_spent, 0) > cb.budget_amount THEN true
        ELSE false
    END as is_over_budget
FROM finance.category_budgets cb
LEFT JOIN (
    SELECT 
        category::VARCHAR(20) as category,
        SUM(amount) as total_spent
    FROM finance.transactions 
    WHERE type = 'expense' 
    AND category IS NOT NULL
    AND EXTRACT(YEAR FROM date) = EXTRACT(YEAR FROM NOW())
    GROUP BY category
) spent ON cb.category = spent.category
WHERE cb.fiscal_year = EXTRACT(YEAR FROM NOW());

-- Create function to update budget updated_at
CREATE OR REPLACE FUNCTION finance.update_budget_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for budget updated_at
DROP TRIGGER IF EXISTS update_budget_updated_at ON finance.category_budgets;
CREATE TRIGGER update_budget_updated_at
    BEFORE UPDATE ON finance.category_budgets
    FOR EACH ROW
    EXECUTE FUNCTION finance.update_budget_updated_at();

-- Insert default budgets for all categories (can be modified later)
INSERT INTO finance.category_budgets (category, budget_amount, budget_period, fiscal_year)
VALUES 
    ('accommodation', 5000.00, 'annual', EXTRACT(YEAR FROM NOW())),
    ('training', 2000.00, 'annual', EXTRACT(YEAR FROM NOW())),
    ('equipment', 3000.00, 'annual', EXTRACT(YEAR FROM NOW())),
    ('transport', 1500.00, 'annual', EXTRACT(YEAR FROM NOW())),
    ('social_events', 2500.00, 'annual', EXTRACT(YEAR FROM NOW())),
    ('insurance', 1000.00, 'annual', EXTRACT(YEAR FROM NOW())),
    ('administration', 800.00, 'annual', EXTRACT(YEAR FROM NOW())),
    ('food_catering', 1200.00, 'annual', EXTRACT(YEAR FROM NOW())),
    ('membership', 500.00, 'annual', EXTRACT(YEAR FROM NOW())),
    ('other', 1000.00, 'annual', EXTRACT(YEAR FROM NOW()))
ON CONFLICT (category, fiscal_year, budget_period) DO NOTHING;

-- Enable RLS on category_budgets table
ALTER TABLE finance.category_budgets ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
DROP POLICY IF EXISTS "Anyone can read budgets" ON finance.category_budgets;
DROP POLICY IF EXISTS "Authenticated users can manage budgets" ON finance.category_budgets;

-- Allow all users to read budgets
CREATE POLICY "Anyone can read budgets" 
ON finance.category_budgets
FOR SELECT
TO authenticated, anon
USING (true);

-- Allow authenticated users to manage budgets
CREATE POLICY "Authenticated users can manage budgets"
ON finance.category_budgets
FOR ALL
TO authenticated
USING (true);

-- Grant permissions
GRANT SELECT ON finance.category_budgets TO authenticated, anon;
GRANT ALL ON finance.category_budgets TO authenticated;
GRANT ALL ON finance.category_budgets TO service_role;
GRANT SELECT ON finance.budget_vs_actual TO authenticated, anon;
GRANT EXECUTE ON FUNCTION finance.update_budget_updated_at() TO service_role;
