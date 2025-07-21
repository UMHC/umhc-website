-- Simple table creation script - run this if you just need to create the tables
-- without affecting existing RLS policies

-- Create finance schema
CREATE SCHEMA IF NOT EXISTS finance;

-- Create transactions table
CREATE TABLE IF NOT EXISTS finance.transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    description TEXT,
    amount DECIMAL(10,2) NOT NULL,
    type VARCHAR(7) NOT NULL CHECK (type IN ('income', 'expense')),
    category VARCHAR(20) CHECK (category IN (
        'accommodation', 'training', 'equipment', 'transport', 
        'social_events', 'insurance', 'administration', 'food_catering', 
        'membership', 'other'
    )),
    date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create financial_summary table
CREATE TABLE IF NOT EXISTS finance.financial_summary (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    total_income DECIMAL(10,2) DEFAULT 0,
    total_expenses DECIMAL(10,2) DEFAULT 0,
    current_balance DECIMAL(10,2) DEFAULT 0,
    transaction_count INTEGER DEFAULT 0,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert initial financial summary row
INSERT INTO finance.financial_summary (total_income, total_expenses, current_balance, transaction_count)
VALUES (0, 0, 0, 0)
ON CONFLICT DO NOTHING;

-- Create function to update financial summary
CREATE OR REPLACE FUNCTION finance.update_financial_summary()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE finance.financial_summary
    SET 
        total_income = (
            SELECT COALESCE(SUM(amount), 0) 
            FROM finance.transactions 
            WHERE type = 'income'
        ),
        total_expenses = (
            SELECT COALESCE(SUM(amount), 0) 
            FROM finance.transactions 
            WHERE type = 'expense'
        ),
        transaction_count = (
            SELECT COUNT(*) 
            FROM finance.transactions
        ),
        last_updated = NOW()
    WHERE id = (SELECT id FROM finance.financial_summary LIMIT 1);
    
    -- Update current balance
    UPDATE finance.financial_summary
    SET current_balance = total_income - total_expenses
    WHERE id = (SELECT id FROM finance.financial_summary LIMIT 1);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update financial summary
DROP TRIGGER IF EXISTS update_financial_summary_trigger ON finance.transactions;
CREATE TRIGGER update_financial_summary_trigger
    AFTER INSERT OR UPDATE OR DELETE ON finance.transactions
    FOR EACH ROW
    EXECUTE FUNCTION finance.update_financial_summary();

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION finance.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update updated_at
DROP TRIGGER IF EXISTS update_transactions_updated_at ON finance.transactions;
CREATE TRIGGER update_transactions_updated_at
    BEFORE UPDATE ON finance.transactions
    FOR EACH ROW
    EXECUTE FUNCTION finance.update_updated_at_column();

-- Grant permissions to service role
GRANT USAGE ON SCHEMA finance TO service_role;
GRANT ALL ON finance.transactions TO service_role;
GRANT ALL ON finance.financial_summary TO service_role;
GRANT EXECUTE ON FUNCTION finance.update_financial_summary() TO service_role;
GRANT EXECUTE ON FUNCTION finance.update_updated_at_column() TO service_role;
