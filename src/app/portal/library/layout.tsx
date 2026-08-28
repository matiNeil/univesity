import { Library as LibraryIcon } from "lucide-react";
import { requirePortal } from "@/lib/require-portal";
import { getAnnouncementsForRole } from "@/lib/announcements";
import { PortalShell, type NavItem } from "@/components/portal-shell";

const NAV: NavItem[] = [
  { href: "/portal/library", label: "Catalogue & Loans", icon: <LibraryIcon className="size-4 shrink-0" /> },
];

export default async function LibraryLayout({ children }: { children: React.ReactNode }) {
  const appUser = await requirePortal("library");
  const announcements = await getAnnouncementsForRole(appUser.role);
  return (
    <PortalShell title="Library" role={appUser.role} navItems={NAV} announcements={announcements}>
      {children}
    </PortalShell>
  );
}
