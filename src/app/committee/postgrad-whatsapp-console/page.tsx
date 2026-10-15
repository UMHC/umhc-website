import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server';
import { LogoutLink } from '@kinde-oss/kinde-auth-nextjs/components';
import PostgradWhatsAppConsole from '@/components/PostgradWhatsAppConsole';

export const metadata: Metadata = { title: 'UMHC Committee | Postgraduate WhatsApp Console', robots: 'noindex, nofollow' };
export const dynamic = 'force-dynamic';
export default async function PostgradWhatsAppConsolePage() {
  const { getUser, getPermission } = getKindeServerSession(); const user = await getUser();
  if (!user) redirect('/api/auth/login?post_login_redirect_url=/committee/postgrad-whatsapp-console');
  if (!(await getPermission('manage-postgrad-whatsapp'))?.isGranted) redirect('/committee/access-denied');
  return <main className="min-h-screen bg-[#f6f6f4] px-4 pb-14 pt-24"><div className="mx-auto max-w-5xl space-y-8"><header className="flex items-start justify-between"><div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-umhc-green/80">Tools</p><h1 className="mt-2 text-4xl font-bold text-deep-black">Postgraduate WhatsApp Console</h1><p className="mt-3 text-slate-grey">Manage postgraduate group access and monitor requests.</p></div><div className="flex gap-2"><Link className="rounded bg-gray-200 px-4 py-2 text-sm font-semibold text-gray-700" href="/dashboard">Back</Link><LogoutLink className="rounded border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-600">Sign out</LogoutLink></div></header><PostgradWhatsAppConsole user={{ email: user.email || null, given_name: user.given_name || null, family_name: user.family_name || null }} /></div></main>;
}