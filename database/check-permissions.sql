-- Check current permissions on finance schema
-- Run this in your Supabase SQL editor to diagnose permission issues

-- Check schema permissions
SELECT 
    nspname as schema_name,
    r.rolname as role_name,
    has_schema_privilege(r.rolname, nspname, 'USAGE') as has_usage,
    has_schema_privilege(r.rolname, nspname, 'CREATE') as has_create
FROM pg_namespace n
CROSS JOIN pg_roles r
WHERE nspname = 'finance' 
  AND r.rolname IN ('service_role', 'authenticated', 'anon')
ORDER BY schema_name, role_name;

-- Check table permissions
SELECT 
    schemaname,
    tablename,
    tableowner,
    has_table_privilege('service_role', schemaname||'.'||tablename, 'SELECT') as service_select,
    has_table_privilege('service_role', schemaname||'.'||tablename, 'INSERT') as service_insert,
    has_table_privilege('service_role', schemaname||'.'||tablename, 'UPDATE') as service_update,
    has_table_privilege('service_role', schemaname||'.'||tablename, 'DELETE') as service_delete
FROM pg_tables 
WHERE schemaname = 'finance';

-- Check RLS policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE schemaname = 'finance'
ORDER BY tablename, policyname;

-- Check if tables have RLS enabled
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'finance';

-- Check existing functions
SELECT 
    n.nspname as schema_name,
    p.proname as function_name,
    has_function_privilege('service_role', p.oid, 'EXECUTE') as service_can_execute
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'finance';
