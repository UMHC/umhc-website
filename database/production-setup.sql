-- Production-ready database setup for finance schema
-- Run these commands in your Supabase SQL editor

-- Enable RLS on the transactions table
ALTER TABLE finance.transactions ENABLE ROW LEVEL SECURITY;

-- For now, allow all authenticated users to manage transactions
-- You can restrict this further based on your specific needs
CREATE POLICY "Authenticated users can insert transactions"
ON finance.transactions
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update transactions"
ON finance.transactions
FOR UPDATE
TO authenticated
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete transactions"
ON finance.transactions
FOR DELETE
TO authenticated
USING (auth.uid() IS NOT NULL);

-- Allow anyone to read transactions (for public finance page)
CREATE POLICY "Anyone can read transactions"
ON finance.transactions
FOR SELECT
TO anon, authenticated
USING (true);

-- Enable RLS on financial_summary table
ALTER TABLE finance.financial_summary ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read financial summary
CREATE POLICY "Anyone can read financial summary"
ON finance.financial_summary
FOR SELECT
TO anon, authenticated
USING (true);

-- Authenticated users can update financial summary
CREATE POLICY "Authenticated users can update financial summary"
ON finance.financial_summary
FOR ALL
TO authenticated
USING (auth.uid() IS NOT NULL);

-- Add audit columns to transactions table (optional but recommended)
ALTER TABLE finance.transactions 
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES auth.users(id);

-- Create trigger to automatically set created_by and updated_by
CREATE OR REPLACE FUNCTION finance.set_user_id()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    NEW.created_by = auth.uid();
    NEW.updated_by = auth.uid();
  ELSIF TG_OP = 'UPDATE' THEN
    NEW.updated_by = auth.uid();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER set_transaction_user_id
  BEFORE INSERT OR UPDATE ON finance.transactions
  FOR EACH ROW
  EXECUTE FUNCTION finance.set_user_id();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA finance TO authenticated, anon;
GRANT SELECT ON finance.transactions TO authenticated, anon;
GRANT SELECT ON finance.financial_summary TO authenticated, anon;
GRANT INSERT, UPDATE, DELETE ON finance.transactions TO authenticated;
GRANT ALL ON finance.financial_summary TO authenticated;
