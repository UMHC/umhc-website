import crypto from 'crypto';
import { supabaseAdmin } from './supabase-admin';

export type PostgradVerificationMethod = 'ac_uk_email' | 'manual_approval';

export interface PostgradAccessToken {
  id: string;
  token: string;
  email: string;
  phone?: string;
  verification_method: PostgradVerificationMethod;
  status: 'active' | 'used' | 'expired';
  expires_at: string;
}

const schema = () => supabaseAdmin.schema('whatsapp_security');

export async function createPostgradAccessToken(email: string, verificationMethod: PostgradVerificationMethod, phone?: string) {
  const token = crypto.randomBytes(32).toString('hex');
  const now = new Date();
  const { error } = await schema().from('postgrad_access_tokens').insert({
    token, email, phone: phone || null, verification_method: verificationMethod, status: 'active',
    created_at: now.toISOString(), expires_at: new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString(),
  });
  if (error) return { token: null, errorCode: error.code, errorMessage: error.message };
  return { token };
}

export async function getPostgradAccessToken(token: string): Promise<PostgradAccessToken | null> {
  const { data, error } = await schema().from('postgrad_access_tokens').select('*').eq('token', token).eq('status', 'active').single();
  if (error || !data) return null;
  if (new Date() > new Date(data.expires_at)) {
    await schema().from('postgrad_access_tokens').update({ status: 'expired' }).eq('token', token);
    return null;
  }
  return data as PostgradAccessToken;
}

export async function markPostgradTokenAsUsed(token: string) {
  const { error } = await schema().from('postgrad_access_tokens').update({ status: 'used', used_at: new Date().toISOString() }).eq('token', token);
  return !error;
}

export async function deletePostgradAccessToken(token: string) {
  const { error } = await schema().from('postgrad_access_tokens').delete().eq('token', token);
  return !error;
}

export async function logPostgradEvent(email: string, verificationMethod: PostgradVerificationMethod, token: string, status: string, phone?: string) {
  const { error } = await schema().from('postgrad_access_logs').insert({ email, phone: phone || null, verification_method: verificationMethod, token, status, created_at: new Date().toISOString() });
  return !error;
}

export async function getPostgradAccessLogs(limit = 100) {
  const { data } = await schema().from('postgrad_access_logs').select('*').order('created_at', { ascending: false }).limit(limit);
  return data || [];
}

export async function cleanupExpiredPostgradTokens() {
  const { count } = await schema().from('postgrad_access_tokens').update({ status: 'expired' }, { count: 'exact' }).eq('status', 'active').lt('expires_at', new Date().toISOString());
  return count || 0;
}

export async function checkPostgradForDuplicates(email: string, phone?: string) {
  const since = new Date();
  since.setDate(since.getDate() - 90);
  const logs = await schema().from('postgrad_access_logs').select('email, phone').gte('created_at', since.toISOString()).eq('status', 'successful_join');
  const requests = await schema().from('postgrad_requests').select('email, phone').gte('created_at', since.toISOString()).in('status', ['approved', 'pending']);
  const rows = [...(logs.data || []), ...(requests.data || [])];
  return {
    emailUsed: rows.some((row) => row.email.toLowerCase() === email.toLowerCase()),
    phoneUsed: !!phone && rows.some((row) => row.phone === phone && row.email.toLowerCase() !== email.toLowerCase()),
  };
}

export function formatPostgradDuplicateError() {
  return 'One of the inputs you provided has already been used to request access. If you believe this is an error, please contact whatsapp@umhc.org.uk.';
}