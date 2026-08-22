import { Home } from "lucide-react";
import { requirePortal } from "@/lib/require-portal";
import { PortalShell, type NavItem } from "@/components/portal-shell";

const NAV: NavItem[] = [
  { href: "/portal/accommodation", label: "Rooms & Allocations", icon: <Home className="size-4 shrink-0" /> },
];

export default async function AccommodationLayout({ children }: { children: React.ReactNode }) {
  const appUser = await requirePortal("accommodation");
  return (
    <PortalShell title="Accommodation" role={appUser.role!} navItems={NAV}>
      {children}
    </PortalShell>
  );
}
