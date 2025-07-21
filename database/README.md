# Database Setup for UMHC Finance System

## Overview
This directory contains SQL files to set up the database for the UMHC website finance system.

## Files

### `complete-setup.sql`
**Use this file for a fresh database setup.** Contains everything needed:
- Creates the `finance` schema
- Creates `transactions` and `financial_summary` tables
- Sets up triggers for automatic summary updates
- Configures Row Level Security (RLS) policies (drops existing ones first)
- Grants permissions to service role

### `tables-only.sql`
**Use this file if you already have RLS policies set up.** Contains:
- Creates the `finance` schema
- Creates `transactions` and `financial_summary` tables
- Sets up triggers for automatic summary updates
- Grants permissions to service role
- Does NOT create or modify RLS policies

### `create-tables.sql`
Table creation and functions only (no RLS policies, no service role grants).

### `production-setup.sql`
RLS policies only (assumes tables already exist).

## Setup Instructions

### Option 1: Fresh Setup (Recommended)
1. Open your Supabase project dashboard
2. Go to the SQL Editor
3. Copy and paste the contents of `complete-setup.sql`
4. Run the script (this will drop existing policies and recreate them)

### Option 2: If RLS Policies Already Exist
1. Open your Supabase project dashboard
2. Go to the SQL Editor
3. Copy and paste the contents of `tables-only.sql`
4. Run the script

### Option 3: Troubleshooting Policy Errors
If you get errors about existing policies:
1. First run `tables-only.sql` to create the tables
2. Then manually review and update policies as needed

### For Production
1. Review the RLS policies in `complete-setup.sql`
2. Adjust permissions as needed for your security requirements
3. Run the appropriate setup script

## Table Structure

### finance.transactions
- `id` (UUID): Primary key
- `title` (VARCHAR): Transaction title
- `description` (TEXT): Optional description
- `amount` (DECIMAL): Transaction amount
- `type` (VARCHAR): 'income' or 'expense'
- `category` (VARCHAR): Transaction category
- `date` (DATE): Transaction date
- `created_at` (TIMESTAMP): Record creation time
- `updated_at` (TIMESTAMP): Last update time

### finance.financial_summary
- `id` (UUID): Primary key
- `total_income` (DECIMAL): Sum of all income transactions
- `total_expenses` (DECIMAL): Sum of all expense transactions
- `current_balance` (DECIMAL): Income minus expenses
- `transaction_count` (INTEGER): Total number of transactions
- `last_updated` (TIMESTAMP): Last update time

## Security
- Row Level Security (RLS) is enabled on both tables
- Authenticated users can manage transactions
- Public can read transactions and financial summary
- Service role has full access for administrative operations

## Environment Variables Required
Make sure these are set in your `.env.local`:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

## Testing
After setup, you can test by:
1. Starting the development server: `npm run dev`
2. Navigating to `/committee/finance`
3. Logging in with committee credentials
4. Adding a test transaction
