import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { redirect } from "next/navigation";
import { hasCommitteePermission } from "@/lib/permissions";
import WhatsAppRequestsClient from "./WhatsAppRequestsClient";

export default async function WhatsAppRequestsPage() {
  const { getUser, getRoles } = getKindeServerSession();
  const user = await getUser();

  if (!user) {
    redirect("/api/auth/login?post_login_redirect_url=/committee/whatsapp-requests");
  }

  const roles = await getRoles();
  const hasAccess = hasCommitteePermission(roles);
  
  if (!hasAccess) {
    redirect("/committee/access-denied");
  }

  return <WhatsAppRequestsClient user={user} />;
}