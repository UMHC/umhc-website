-- Postgraduate WhatsApp security tables must never be directly client-accessible.
alter table if exists whatsapp_security.postgrad_access_tokens enable row level security;
alter table if exists whatsapp_security.postgrad_access_tokens force row level security;
alter table if exists whatsapp_security.postgrad_access_logs enable row level security;
alter table if exists whatsapp_security.postgrad_access_logs force row level security;
alter table if exists whatsapp_security.postgrad_requests enable row level security;
alter table if exists whatsapp_security.postgrad_requests force row level security;

revoke all on schema whatsapp_security from anon, authenticated;
revoke all on table whatsapp_security.postgrad_access_tokens from anon, authenticated;
revoke all on table whatsapp_security.postgrad_access_logs from anon, authenticated;
revoke all on table whatsapp_security.postgrad_requests from anon, authenticated;