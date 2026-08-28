import { QrCode } from "lucide-react";
import { requirePortal } from "@/lib/require-portal";
import { PortalShell, type NavItem } from "@/components/portal-shell";

const NAV: NavItem[] = [{ href: "/portal/scan", label: "Scanner", icon: <QrCode className="size-4 shrink-0" /> }];

export default async function ScanLayout({ children }: { children: React.ReactNode }) {
  const appUser = await requirePortal("scan");
  return (
    <PortalShell title="Graduation Scanner" role={appUser.role} navItems={NAV}>
      {children}
    </PortalShell>
  );
}
