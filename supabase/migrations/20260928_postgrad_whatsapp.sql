create schema if not exists whatsapp_security;

create table if not exists whatsapp_security.postgrad_access_tokens (
  id uuid primary key default gen_random_uuid(),
  token text unique not null,
  email text not null,
  phone text,
  verification_method text not null check (verification_method in ('ac_uk_email', 'manual_approval')),
  status text not null default 'active' check (status in ('active', 'used', 'expired')),
  created_at timestamptz not null default now(),
  expires_at timestamptz not null,
  used_at timestamptz
);

create table if not exists whatsapp_security.postgrad_access_logs (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  phone text,
  verification_method text not null,
  token text not null,
  status text not null,
  created_at timestamptz not null default now()
);

create table if not exists whatsapp_security.postgrad_requests (
  id uuid primary key default gen_random_uuid(),
  first_name text not null,
  surname text not null,
  email text not null,
  phone text not null,
  user_type text not null,
  trips text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  reviewed_by text,
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists postgrad_access_tokens_token_idx on whatsapp_security.postgrad_access_tokens(token);
create index if not exists postgrad_access_logs_created_at_idx on whatsapp_security.postgrad_access_logs(created_at desc);
create index if not exists postgrad_requests_created_at_idx on whatsapp_security.postgrad_requests(created_at desc);

-- These tables contain private contact details and one-time access credentials.
-- The application uses the Supabase service role, so clients need no direct access.
alter table whatsapp_security.postgrad_access_tokens enable row level security;
alter table whatsapp_security.postgrad_access_tokens force row level security;
alter table whatsapp_security.postgrad_access_logs enable row level security;
alter table whatsapp_security.postgrad_access_logs force row level security;
alter table whatsapp_security.postgrad_requests enable row level security;
alter table whatsapp_security.postgrad_requests force row level security;

revoke all on schema whatsapp_security from anon, authenticated;
revoke all on whatsapp_security.postgrad_access_tokens from anon, authenticated;
revoke all on whatsapp_security.postgrad_access_logs from anon, authenticated;
revoke all on whatsapp_security.postgrad_requests from anon, authenticated;