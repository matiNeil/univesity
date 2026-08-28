import { Users, GraduationCap } from "lucide-react";
import { requirePortal } from "@/lib/require-portal";
import { getAnnouncementsForRole } from "@/lib/announcements";
import { PortalShell, type NavItem } from "@/components/portal-shell";

const NAV: NavItem[] = [
  { href: "/portal/registrar", label: "Students & Clearance", icon: <Users className="size-4 shrink-0" /> },
  {
    href: "/portal/registrar/graduation",
    label: "Graduation Applications",
    icon: <GraduationCap className="size-4 shrink-0" />,
  },
];

export default async function RegistrarLayout({ children }: { children: React.ReactNode }) {
  const appUser = await requirePortal("registrar");
  const announcements = await getAnnouncementsForRole(appUser.role);
  return (
    <PortalShell title="Registrar" role={appUser.role} navItems={NAV} announcements={announcements}>
      {children}
    </PortalShell>
  );
}
