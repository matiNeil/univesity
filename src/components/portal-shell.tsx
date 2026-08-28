"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { GraduationCap, LogOut, Menu } from "lucide-react";
import { ROLE_LABELS, type Role } from "@/lib/roles";
import { PortalNav } from "@/components/portal-nav";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { logout } from "@/lib/auth-actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export type NavItem = { href: string; label: string; icon: ReactNode };
export type AnnouncementItem = { id: string; title: string; body: string; createdAt: Date };

export function PortalShell({
  title,
  role,
  navItems,
  announcements = [],
  children,
}: {
  title: string;
  role: Role;
  navItems: NavItem[];
  announcements?: AnnouncementItem[];
  children: React.ReactNode;
}) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const sidebarInner = (
    <>
      <div className="flex items-center gap-2 border-b p-4">
        <GraduationCap className="size-5 text-primary" />
        <div>
          <Link href="/" className="font-semibold">
            UniSmart
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
            <form action={logout}>
              <Button type="submit" variant="ghost" size="icon" aria-label="Log out">
                <LogOut className="size-4" />
              </Button>
            </form>
          </div>
        </header>
        <main className="flex-1 overflow-x-auto p-4 sm:p-6">
          {announcements.length > 0 && (
            <Card className="mb-6">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Announcements</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                {announcements.map((a) => (
                  <div key={a.id} className="border-b pb-3 last:border-b-0 last:pb-0">
                    <div className="flex items-baseline justify-between gap-2">
                      <p className="text-sm font-medium">{a.title}</p>
                      <span className="shrink-0 text-xs text-muted-foreground">
                        {a.createdAt.toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{a.body}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
          {children}
        </main>
      </div>
    </div>
  );
}
