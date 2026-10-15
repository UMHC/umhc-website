import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { LogoutLink } from '@kinde-oss/kinde-auth-nextjs/components';
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server';
import { redirect } from 'next/navigation';
import WomxnWhatsAppConsole from '@/components/WomxnWhatsAppConsole';

export const metadata: Metadata = {
  title: 'UMHC Committee | Womxn WhatsApp Console',
  description: 'Manage Womxn WhatsApp group access and monitor usage',
  robots: 'noindex, nofollow, noarchive, nosnippet, noimageindex',
};

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function WomxnWhatsAppConsolePage() {
  const { getUser, getPermission } = getKindeServerSession();
  const user = await getUser();

  if (!user) {
    redirect('/api/auth/login?post_login_redirect_url=/committee/womxn-whatsapp-console');
  }

  const womxnWhatsappPermission = await getPermission('manage-womxn-whatsapp');

  if (!womxnWhatsappPermission?.isGranted) {
    redirect('/committee/access-denied');
  }

  return (
    <main className="min-h-screen bg-[#f6f6f4] pt-24 px-4 sm:px-6 lg:px-8 pb-14">
      <div className="max-w-5xl mx-auto">
        <div className="py-6 sm:py-10 space-y-6">
          <header className="px-2 sm:px-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-umhc-green/80 mb-2">
                  Tools
                </p>
                <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-deep-black mb-3">
                  Womxn WhatsApp Console
                </h1>
                <p className="max-w-2xl text-[17px] text-slate-grey leading-relaxed font-medium">
                  Manage Womxn WhatsApp group access and monitor usage
                </p>
              </div>
              <div className="pt-2 flex items-center gap-2">
                <Link
                  href="/dashboard"
                  className="flex items-center justify-center gap-2 whitespace-nowrap bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold text-sm px-4 py-2 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300"
                >
                  <ArrowLeftIcon className="w-4 h-4" />
                  Back to Dashboard
                </Link>
                <LogoutLink className="flex items-center justify-center gap-2 whitespace-nowrap bg-red-50 hover:bg-red-100 text-red-600 font-semibold text-sm px-4 py-2 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 border border-red-200">
                  Sign out
                </LogoutLink>
              </div>
            </div>
          </header>

          <section aria-labelledby="womxn-whatsapp-console">
            <WomxnWhatsAppConsole
              user={{
                id: user.id || '',
                email: user.email || null,
                given_name: user.given_name || null,
                family_name: user.family_name || null,
              }}
            />
          </section>
        </div>
      </div>
    </main>
  );
}
