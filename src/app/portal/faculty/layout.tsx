import { Landmark } from "lucide-react";
import { requirePortal } from "@/lib/require-portal";
import { getAnnouncementsForRole } from "@/lib/announcements";
import { PortalShell, type NavItem } from "@/components/portal-shell";

const NAV: NavItem[] = [{ href: "/portal/faculty", label: "Overview", icon: <Landmark className="size-4 shrink-0" /> }];

export default async function FacultyLayout({ children }: { children: React.ReactNode }) {
  const appUser = await requirePortal("faculty");
  const announcements = await getAnnouncementsForRole(appUser.role);
  return (
    <PortalShell title="Faculty Portal" role={appUser.role} navItems={NAV} announcements={announcements}>
      {children}
    </PortalShell>
  );
}
