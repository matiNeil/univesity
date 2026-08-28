import { redirect } from "next/navigation";
import { getAppUser } from "@/lib/session";
import { defaultPortalForRole } from "@/lib/roles";

export default async function PortalIndex() {
  const appUser = await getAppUser();
  if (!appUser) redirect("/sign-in");
  redirect(defaultPortalForRole(appUser.role));
}
