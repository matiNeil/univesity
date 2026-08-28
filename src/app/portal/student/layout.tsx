import { LayoutDashboard, GraduationCap } from "lucide-react";
import { requirePortal } from "@/lib/require-portal";
import { PortalShell, type NavItem } from "@/components/portal-shell";

const NAV: NavItem[] = [
  { href: "/portal/student", label: "Overview", icon: <LayoutDashboard className="size-4 shrink-0" /> },
  { href: "/portal/student/graduation", label: "Graduation", icon: <GraduationCap className="size-4 shrink-0" /> },
];

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  const appUser = await requirePortal("student");
  return (
    <PortalShell title="Student Portal" role={appUser.role} navItems={NAV}>
      {children}
    </PortalShell>
  );
}
