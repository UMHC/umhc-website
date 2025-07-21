import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server';
import CommitteeEventsClient from './CommitteeEventsClient';

export default async function CommitteeEventsPage() {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  return (
    <CommitteeEventsClient 
      user={{
        id: user?.id || '',
        email: user?.email || null,
        given_name: user?.given_name || null,
        family_name: user?.family_name || null,
        picture: user?.picture || null,
      }}
    />
  );
}
