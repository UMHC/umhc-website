import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { redirect } from 'next/navigation';
import CommitteeFinanceClient from './CommitteeFinanceClient';

export default async function CommitteeFinancePage() {
  const { getUser, isAuthenticated, getRoles, getPermissions } = getKindeServerSession();
  
  if (!isAuthenticated()) {
    redirect('/api/auth/login?post_login_redirect_url=/committee/finance');
  }
  
  const user = await getUser();
  
  if (!user) {
    redirect('/api/auth/login?post_login_redirect_url=/committee/finance');
  }

  // Check if user has the 'is-committee' role or 'is-treasurer' permission
  const [roles, permissions] = await Promise.all([
    getRoles(),
    getPermissions()
  ]);
  
  const hasCommitteeRole = roles?.some(role => role.key === 'is-committee') ?? false;
  const hasTreasurerPermission = permissions?.permissions?.includes('is-treasurer') ?? false;
  
  if (!hasCommitteeRole && !hasTreasurerPermission) {
    redirect('/committee/access-denied');
  }
  
  return <CommitteeFinanceClient 
    user={user} 
    canEditFinances={hasCommitteeRole || hasTreasurerPermission}
    isTreasurer={hasTreasurerPermission}
  />;
}
