import { Library as LibraryIcon } from "lucide-react";
import { requirePortal } from "@/lib/require-portal";
import { PortalShell, type NavItem } from "@/components/portal-shell";

const NAV: NavItem[] = [
  { href: "/portal/library", label: "Catalogue & Loans", icon: <LibraryIcon className="size-4 shrink-0" /> },
];

export default async function LibraryLayout({ children }: { children: React.ReactNode }) {
  const appUser = await requirePortal("library");
  return (
    <PortalShell title="Library" role={appUser.role!} navItems={NAV}>
      {children}
    </PortalShell>
  );
}
