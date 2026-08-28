import { BookOpen } from "lucide-react";
import { requirePortal } from "@/lib/require-portal";
import { getAnnouncementsForRole } from "@/lib/announcements";
import { PortalShell, type NavItem } from "@/components/portal-shell";

const NAV: NavItem[] = [{ href: "/portal/lecturer", label: "My Courses", icon: <BookOpen className="size-4 shrink-0" /> }];

export default async function LecturerLayout({ children }: { children: React.ReactNode }) {
  const appUser = await requirePortal("lecturer");
  const announcements = await getAnnouncementsForRole(appUser.role);
  return (
    <PortalShell title="Lecturer Portal" role={appUser.role} navItems={NAV} announcements={announcements}>
      {children}
    </PortalShell>
  );
}
