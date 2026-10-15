import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server';
import { redirect } from 'next/navigation';
import CommitteeEventsClient from './CommitteeEventsClient';

export default async function CommitteeEventsPage() {
  const { getUser, getPermission } = getKindeServerSession();
  const user = await getUser();

  if (!user) {
    redirect('/api/auth/login?post_login_redirect_url=/committee/events');
  }

  const scheduleManagerPermission = await getPermission('schedule-manager');

  if (!scheduleManagerPermission?.isGranted) {
    redirect('/committee/access-denied');
  }

  return (
    <CommitteeEventsClient 
      user={{
        id: user.id,
        email: user.email || null,
        given_name: user.given_name || null,
        family_name: user.family_name || null,
        picture: user.picture || null,
      }}
    />
  );
}
