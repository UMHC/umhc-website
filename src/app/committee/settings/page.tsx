import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { redirect } from 'next/navigation';
import SettingsClient from './SettingsClient';

export default async function SettingsPage() {
  const { getUser, isAuthenticated, getRoles } = getKindeServerSession();
  
  if (!isAuthenticated()) {
    redirect('/api/auth/login?post_login_redirect_url=/committee/settings');
  }
  
  const user = await getUser();
  
  if (!user) {
    redirect('/api/auth/login?post_login_redirect_url=/committee/settings');
  }

  // Check if user has the 'is-committee' role
  const roles = await getRoles();
  const hasCommitteeRole = roles?.some(role => role.key === 'is-committee');
  
  if (!hasCommitteeRole) {
    redirect('/committee/access-denied');
  }
  
  return <SettingsClient user={user} />;
}
