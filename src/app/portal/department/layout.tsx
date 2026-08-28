import { Building2, CalendarClock } from "lucide-react";
import { requirePortal } from "@/lib/require-portal";
import { getAnnouncementsForRole } from "@/lib/announcements";
import { PortalShell, type NavItem } from "@/components/portal-shell";

const NAV: NavItem[] = [
  { href: "/portal/department", label: "Overview", icon: <Building2 className="size-4 shrink-0" /> },
  { href: "/portal/department/timetable", label: "Timetable", icon: <CalendarClock className="size-4 shrink-0" /> },
];

export default async function DepartmentLayout({ children }: { children: React.ReactNode }) {
  const appUser = await requirePortal("department");
  const announcements = await getAnnouncementsForRole(appUser.role);
  return (
    <PortalShell title="Department Portal" role={appUser.role} navItems={NAV} announcements={announcements}>
      {children}
    </PortalShell>
  );
}
