import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { redirect } from 'next/navigation';
import CommitteeConsoleClient from './CommitteeConsoleClient';

export default async function CommitteeConsolePage() {
  const { getUser, isAuthenticated, getRoles, getPermission } = getKindeServerSession();
  
  if (!isAuthenticated()) {
    redirect('/api/auth/login?post_login_redirect_url=/committee');
  }
  
  const user = await getUser();
  
  if (!user) {
    redirect('/api/auth/login?post_login_redirect_url=/committee');
  }

  // Check if user has the 'is-committee' role
  const roles = await getRoles();
  const hasCommitteeRole = roles?.some(role => role.key === 'is-committee');

  const scheduleManagerPermission = await getPermission('schedule-manager');
  const whatsappGeneralManagerPermission = await getPermission('whatsapp-general-manager');
  const womxnWhatsappPermission = await getPermission('manage-womxn-whatsapp');
  
  if (!hasCommitteeRole) {
    redirect('/committee/access-denied');
  }
  
  return (
    <CommitteeConsoleClient
      user={user}
      canManageSchedule={scheduleManagerPermission?.isGranted ?? false}
      canManageGeneralWhatsapp={whatsappGeneralManagerPermission?.isGranted ?? false}
      canManageWomxnWhatsapp={womxnWhatsappPermission?.isGranted ?? false}
    />
  );
}
