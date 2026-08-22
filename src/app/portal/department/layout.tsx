import { Building2 } from "lucide-react";
import { requirePortal } from "@/lib/require-portal";
import { PortalShell, type NavItem } from "@/components/portal-shell";

const NAV: NavItem[] = [
  { href: "/portal/department", label: "Overview", icon: <Building2 className="size-4 shrink-0" /> },
];

export default async function DepartmentLayout({ children }: { children: React.ReactNode }) {
  const appUser = await requirePortal("department");
  return (
    <PortalShell title="Department Portal" role={appUser.role!} navItems={NAV}>
      {children}
    </PortalShell>
  );
}
