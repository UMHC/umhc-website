import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { redirect } from 'next/navigation';
import CommitteeConsoleClient from './CommitteeConsoleClient';

export default async function CommitteeConsolePage() {
  const { getUser, isAuthenticated, getRoles } = getKindeServerSession();
  
  if (!isAuthenticated()) {
    redirect('/api/auth/login?post_login_redirect_url=/committee');
  }
  
  const user = await getUser();
  
  if (!user) {
    redirect('/api/auth/login?post_login_redirect_url=/committee');
  }

  // Check if user has the 'is-committee' or 'is-treasurer' role
  const roles = await getRoles();
  const hasCommitteeRole = roles?.some(role => role.key === 'is-committee');
  const hasTreasurerRole = roles?.some(role => role.key === 'is-treasurer');
  
  if (!hasCommitteeRole && !hasTreasurerRole) {
    redirect('/committee/access-denied');
  }
  
  return <CommitteeConsoleClient user={user} />;
}
