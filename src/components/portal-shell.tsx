"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { GraduationCap, Menu } from "lucide-react";
import { ROLE_LABELS, type Role } from "@/lib/roles";
import { PortalNav } from "@/components/portal-nav";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";

export type NavItem = { href: string; label: string; icon: ReactNode };

export function PortalShell({
  title,
  role,
  navItems,
  children,
}: {
  title: string;
  role: Role;
  navItems: NavItem[];
  children: React.ReactNode;
}) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const sidebarInner = (
    <>
      <div className="flex items-center gap-2 border-b p-4">
        <GraduationCap className="size-5 text-primary" />
        <div>
          <Link href="/" className="font-semibold">
            Gopito University
          </Link>
          <p className="text-xs text-muted-foreground">{title}</p>
        </div>
      </div>
      <PortalNav navItems={navItems} onNavigate={() => setMobileNavOpen(false)} />
      <div className="border-t p-3">
        <Link href="/portal" className="text-xs text-muted-foreground hover:underline">
          Switch portal
        </Link>
      </div>
    </>
  );

  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-60 shrink-0 flex-col border-r bg-sidebar sm:flex">{sidebarInner}</aside>

      <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
        <SheetContent side="left" className="w-60 p-0">
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <div className="flex h-full flex-col">{sidebarInner}</div>
        </SheetContent>
      </Sheet>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="sm:hidden"
              aria-label="Open navigation"
              onClick={() => setMobileNavOpen(true)}
            >
              <Menu className="size-5" />
            </Button>
            <h1 className="text-lg font-semibold">{title}</h1>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="hidden text-sm text-muted-foreground sm:inline">{ROLE_LABELS[role]}</span>
            <ThemeToggle />
            <UserButton />
          </div>
        </header>
        <main className="flex-1 overflow-x-auto p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
