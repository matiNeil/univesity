import { QrCode } from "lucide-react";
import { requirePortal } from "@/lib/require-portal";
import { getAnnouncementsForRole } from "@/lib/announcements";
import { PortalShell, type NavItem } from "@/components/portal-shell";

const NAV: NavItem[] = [{ href: "/portal/scan", label: "Scanner", icon: <QrCode className="size-4 shrink-0" /> }];

export default async function ScanLayout({ children }: { children: React.ReactNode }) {
  const appUser = await requirePortal("scan");
  const announcements = await getAnnouncementsForRole(appUser.role);
  return (
    <PortalShell title="Graduation Scanner" role={appUser.role} navItems={NAV} announcements={announcements}>
      {children}
    </PortalShell>
  );
}
