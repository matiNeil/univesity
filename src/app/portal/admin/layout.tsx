import { LayoutDashboard, GraduationCap, Megaphone } from "lucide-react";
import { requirePortal } from "@/lib/require-portal";
import { getAnnouncementsForRole } from "@/lib/announcements";
import { PortalShell, type NavItem } from "@/components/portal-shell";

const NAV: NavItem[] = [
  { href: "/portal/admin", label: "Overview", icon: <LayoutDashboard className="size-4 shrink-0" /> },
  { href: "/portal/admin/graduation", label: "Graduation", icon: <GraduationCap className="size-4 shrink-0" /> },
  { href: "/portal/admin/announcements", label: "Announcements", icon: <Megaphone className="size-4 shrink-0" /> },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const appUser = await requirePortal("admin");
  const announcements = await getAnnouncementsForRole(appUser.role);
  return (
    <PortalShell title="Executive Dashboard" role={appUser.role} navItems={NAV} announcements={announcements}>
      {children}
    </PortalShell>
  );
}
