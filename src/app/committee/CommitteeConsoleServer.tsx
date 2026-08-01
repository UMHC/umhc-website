import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { redirect } from 'next/navigation';
import CommitteeConsoleClient from './CommitteeConsoleClient';

export default async function CommitteeConsolePage() {
  const { getUser, isAuthenticated, getPermission } = getKindeServerSession();
  
  if (!isAuthenticated()) {
    redirect('/api/auth/login?post_login_redirect_url=/committee');
  }
  
  const user = await getUser();
  
  if (!user) {
    redirect('/api/auth/login?post_login_redirect_url=/committee');
  }

  const scheduleManagerPermission = await getPermission('schedule-manager');
  const whatsappGeneralManagerPermission = await getPermission('whatsapp-general-manager');
  const womxnWhatsappPermission = await getPermission('manage-womxn-whatsapp');
  
  return (
    <CommitteeConsoleClient
      user={user}
      canManageSchedule={scheduleManagerPermission?.isGranted ?? false}
      canManageGeneralWhatsapp={whatsappGeneralManagerPermission?.isGranted ?? false}
      canManageWomxnWhatsapp={womxnWhatsappPermission?.isGranted ?? false}
    />
  );
}
