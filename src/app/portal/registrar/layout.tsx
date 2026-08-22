import { Users, GraduationCap } from "lucide-react";
import { requirePortal } from "@/lib/require-portal";
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
  return (
    <PortalShell title="Registrar" role={appUser.role!} navItems={NAV}>
      {children}
    </PortalShell>
  );
}
