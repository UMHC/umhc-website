import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { redirect } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { CalendarDaysIcon, Cog6ToothIcon } from '@heroicons/react/24/outline';

import { LogoutLink } from "@kinde-oss/kinde-auth-nextjs/components";

export default async function DashboardPage() {
  const { getUser, isAuthenticated, getPermission, getRoles } = getKindeServerSession();
  
  if (!(await isAuthenticated())) {
     redirect('/api/auth/login?post_login_redirect_url=/dashboard');
  }
  
  const user = await getUser();
  
  if (!user) {
      redirect('/api/auth/login?post_login_redirect_url=/dashboard');
  }

  const committeePermission = await getPermission('is-committee');
  const roles = await getRoles();
  const hasCommitteeRole = roles?.some((role) => role.key === 'is-committee') ?? false;
  const isCommittee = committeePermission?.isGranted || hasCommitteeRole;

  const memberPermission = await getPermission('is-member');
  const isMember = memberPermission?.isGranted;

  const scheduleManagerPermission = await getPermission('schedule-manager');
  const whatsappGeneralManagerPermission = await getPermission('whatsapp-general-manager');
  const womxnWhatsappPermission = await getPermission('manage-womxn-whatsapp');

  const toolActions = [
    ...(scheduleManagerPermission?.isGranted
      ? [
          {
            label: 'Manage Schedule',
            description: 'Schedule hikes, socials, and manage event details',
            href: '/committee/events',
            icon: CalendarDaysIcon,
            color: 'bg-blue-500 hover:bg-blue-600',
          },
        ]
      : []),
    ...(whatsappGeneralManagerPermission?.isGranted
      ? [
          {
            label: 'Manage General WhatsApp',
            description: 'Manage WhatsApp links and monitor access',
            href: '/committee/whatsapp-console',
            icon: Cog6ToothIcon,
            color: 'bg-green-500 hover:bg-green-600',
          },
        ]
      : []),
    ...(womxnWhatsappPermission?.isGranted
      ? [
          {
            label: 'Manage Womxn WhatsApp',
            description: 'Manage Womxn WhatsApp group links and monitor access',
            href: '/committee/womxn-whatsapp-console',
            icon: Cog6ToothIcon,
            color: 'bg-purple-500 hover:bg-purple-600',
          },
        ]
      : []),
  ];

  return (
    <main className="min-h-screen bg-[#f6f6f4] pt-24 px-4 sm:px-6 lg:px-8 pb-14">
      <div className="max-w-5xl mx-auto">
        {isCommittee ? (
          /* Committee Dashboard View */
          <div className="py-6 sm:py-10 space-y-6">
            <header className="px-2 sm:px-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-umhc-green/80 mb-2">
                    Committee Area
                  </p>
                  <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-deep-black mb-3">
                    Dashboard
                  </h1>
                  <p className="max-w-2xl text-[17px] text-slate-grey leading-relaxed font-medium">
                    Welcome back, {user?.given_name || 'Committee Member'}. Your permitted tools are ready below.
                  </p>
                </div>
                <div className="pt-2">
                   <LogoutLink className="flex items-center justify-center gap-2 whitespace-nowrap bg-red-50 hover:bg-red-100 text-red-600 font-semibold text-sm px-4 py-2 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 border border-red-200">
                    Sign out
                  </LogoutLink>
                </div>
              </div>
            </header>

            <section aria-labelledby="dashboard-tools-heading">
              <div className="bg-cream-white rounded-lg p-6 border border-gray-200">
                <div className="flex justify-between items-center mb-6">
                  <h2 id="dashboard-tools-heading" className="text-xl font-semibold text-deep-black font-sans flex items-center gap-2">
                    Your Tools
                  </h2>
                  <span className="text-xs font-semibold text-slate-grey uppercase tracking-widest bg-gray-100 px-3 py-1.5 rounded-full">
                    {toolActions.length} Assigned
                  </span>
                </div>
                
                <div className="space-y-3">
                  {toolActions.length > 0 ? (
                    toolActions.map((toolAction) => (
                      <Link
                        key={toolAction.href}
                        href={toolAction.href}
                        className="group flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-whellow rounded-lg border border-gray-200 hover:border-umhc-green transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-umhc-green"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <toolAction.icon className="w-5 h-5 text-umhc-green" />
                            <h3 className="font-medium text-deep-black group-hover:text-umhc-green transition-colors">
                              {toolAction.label}
                            </h3>
                          </div>
                          <div className="text-sm text-slate-grey mt-1">
                            {toolAction.description}
                          </div>
                        </div>
                        <div className="mt-4 flex sm:mt-0 sm:ml-4 sm:flex-shrink-0">
                          <div className="flex items-center justify-center gap-2 whitespace-nowrap bg-umhc-green text-cream-white font-semibold text-sm px-4 py-2 rounded-lg transition-colors duration-200 group-hover:bg-stealth-green shadow-sm">
                            Open
                          </div>
                        </div>
                      </Link>
                    ))
                  ) : (
                    <div className="p-8 text-center bg-whellow rounded-lg border border-dashed border-gray-300">
                      <p className="text-base text-slate-grey font-medium">
                        You do not currently have any tools assigned. Contact an admin if you need access.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </section>
          </div>
        ) : isMember ? (
          /* Member Dashboard View */
          <section className="rounded-3xl border border-black/5 bg-white shadow-[0_12px_30px_-22px_rgba(0,0,0,0.4)] py-8 sm:py-10 px-4 sm:px-8 text-center">
             <div className="mb-8 max-w-[280px] sm:max-w-[320px] md:max-w-[400px] mx-auto">
              <Image 
                src="/images/404-hiker-illustration.webp" 
                alt="Single hiker looking at a map in the wilderness"
                width={500}
                height={500}
                className="w-full h-auto object-contain mx-auto"
                priority
              />
            </div>
            
            <h1 className="text-3xl md:text-4xl font-bold text-umhc-green mb-6">
              Member Dashboard
            </h1>
            
            <div className="max-w-2xl mx-auto space-y-4 px-4">
              <p className="text-lg text-slate-grey leading-relaxed">
                Thank you for setting up an account with us! We haven&apos;t currently got anything to offer here at the moment, however we may roll something out in the future that may need an account.
              </p>
              <p className="text-lg text-slate-grey font-medium italic pt-2">
                 Please contact the committee if you have any questions or concerns about your account or membership.
              </p>
            </div>
          </section>
        ) : (
          /* Non-Member / Default Dashboard View */
          <section className="rounded-3xl border border-black/5 bg-white shadow-[0_12px_30px_-22px_rgba(0,0,0,0.4)] py-10 sm:py-12 px-4 sm:px-8 text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-umhc-green mb-6">
              Welcome to UMHC
            </h1>
            
            <div className="max-w-2xl mx-auto space-y-4 px-4">
              <p className="text-lg text-slate-grey leading-relaxed">
                Your account has been created successfully. 
              </p>
              <p className="text-lg text-slate-grey leading-relaxed">
                If you have purchased a membership, please allow some time for your status to be updated, or contact the committee if you believe this is an error.
              </p>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
