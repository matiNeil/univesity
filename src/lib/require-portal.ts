import "server-only";
import { redirect } from "next/navigation";
import { getAppUser } from "@/lib/current-user";
import { canAccessPortal } from "@/lib/roles";

export async function requirePortal(slug: string) {
  const appUser = await getAppUser();
  if (!appUser) redirect("/sign-in");
  if (!appUser.role) redirect("/onboarding");
  if (!canAccessPortal(appUser.role, slug)) redirect("/portal");
  return appUser;
}
