import { redirect } from 'next/navigation';
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { hasCommitteePermission } from '@/lib/permissions';
import BannerManagement from '@/components/BannerManagement';
import Link from 'next/link';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

export default async function BannerPage() {
  const { getUser, getRoles } = getKindeServerSession();
  const user = await getUser();
  const roles = await getRoles();

  // Check if user is authenticated
  if (!user) {
    redirect('/api/auth/login?post_login_redirect_url=/committee/banner');
  }

  // Check if user has committee permissions
  if (!hasCommitteePermission(roles)) {
    redirect('/committee/access-denied');
  }

  return (
    <div className="min-h-screen bg-whellow">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Link
          href="/committee"
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          Back to Dashboard
        </Link>

        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-deep-black">Banner Management</h1>
          <p className="text-gray-600 mt-2">
            Manage the scrolling banner messages that appear on the homepage
          </p>
        </div>

        {/* Banner Management Component */}
        <BannerManagement />
      </div>
    </div>
  );
}
