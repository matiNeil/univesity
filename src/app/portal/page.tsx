import { redirect } from "next/navigation";
import { getAppUser } from "@/lib/current-user";
import { defaultPortalForRole } from "@/lib/roles";

export default async function PortalIndex() {
  const appUser = await getAppUser();
  if (!appUser) redirect("/sign-in");
  if (!appUser.role) redirect("/onboarding");
  redirect(defaultPortalForRole(appUser.role));
}
