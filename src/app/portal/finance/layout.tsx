import { Wallet } from "lucide-react";
import { requirePortal } from "@/lib/require-portal";
import { getAnnouncementsForRole } from "@/lib/announcements";
import { PortalShell, type NavItem } from "@/components/portal-shell";

const NAV: NavItem[] = [
  { href: "/portal/finance", label: "Invoices & Payments", icon: <Wallet className="size-4 shrink-0" /> },
];

export default async function FinanceLayout({ children }: { children: React.ReactNode }) {
  const appUser = await requirePortal("finance");
  const announcements = await getAnnouncementsForRole(appUser.role);
  return (
    <PortalShell title="Finance" role={appUser.role} navItems={NAV} announcements={announcements}>
      {children}
    </PortalShell>
  );
}
