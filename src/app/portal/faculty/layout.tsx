import { Landmark } from "lucide-react";
import { requirePortal } from "@/lib/require-portal";
import { PortalShell, type NavItem } from "@/components/portal-shell";

const NAV: NavItem[] = [{ href: "/portal/faculty", label: "Overview", icon: <Landmark className="size-4 shrink-0" /> }];

export default async function FacultyLayout({ children }: { children: React.ReactNode }) {
  const appUser = await requirePortal("faculty");
  return (
    <PortalShell title="Faculty Portal" role={appUser.role} navItems={NAV}>
      {children}
    </PortalShell>
  );
}
