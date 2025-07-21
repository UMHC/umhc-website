-- Grant permissions to service role for existing finance tables
-- Run this in your Supabase SQL editor

-- Grant usage on schema
GRANT USAGE ON SCHEMA finance TO service_role;

-- Grant all privileges on tables to service role
GRANT ALL ON finance.transactions TO service_role;
GRANT ALL ON finance.financial_summary TO service_role;

-- Grant execute on functions to service role
GRANT EXECUTE ON FUNCTION finance.update_financial_summary() TO service_role;
GRANT EXECUTE ON FUNCTION finance.update_updated_at_column() TO service_role;

-- Also grant sequence permissions if they exist
GRANT ALL ON ALL SEQUENCES IN SCHEMA finance TO service_role;

-- Enable service role to bypass RLS for administrative operations
ALTER TABLE finance.transactions FORCE ROW LEVEL SECURITY;
ALTER TABLE finance.financial_summary FORCE ROW LEVEL SECURITY;
