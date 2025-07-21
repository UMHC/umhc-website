import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { redirect } from 'next/navigation';
import CommitteeConsoleClient from './CommitteeConsoleClient';

export default async function CommitteeConsolePage() {
  const { getUser, isAuthenticated } = getKindeServerSession();
  
  if (!isAuthenticated()) {
    redirect('/api/auth/login?post_login_redirect_url=/committee');
  }
  
  const user = await getUser();
  
  if (!user) {
    redirect('/api/auth/login?post_login_redirect_url=/committee');
  }
  
  return <CommitteeConsoleClient user={user} />;
}
