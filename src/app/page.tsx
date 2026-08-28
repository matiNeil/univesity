import Link from "next/link";
import { getAppUser } from "@/lib/session";
import {
  GraduationCap,
  Users2,
  Landmark,
  QrCode,
  BookOpen,
  Building2,
  Wallet,
  Home as HomeIcon,
  Library as LibraryIcon,
  ScanLine,
  LayoutDashboard,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ThemeToggle } from "@/components/theme-toggle";
import { PORTALS, defaultPortalForRole } from "@/lib/roles";

const FEATURES = [
  {
    icon: Users2,
    title: "Student & Lecturer Portals",
    body: "Registration, timetables, results, grading, and communication in one place.",
  },
  {
    icon: Landmark,
    title: "Registrar, Finance & Faculty",
    body: "Academic records, clearance, fees, and multi-department approvals.",
  },
  {
    icon: QrCode,
    title: "Graduation QR Passes",
    body: "Students issue digital visitor passes; staff scan and validate entry in real time.",
  },
];

const PORTAL_ICONS: Record<string, typeof GraduationCap> = {
  student: LayoutDashboard,
  lecturer: BookOpen,
  department: Building2,
  faculty: Landmark,
  registrar: Users2,
  finance: Wallet,
  accommodation: HomeIcon,
  library: LibraryIcon,
  scan: ScanLine,
  admin: LayoutDashboard,
};

export default async function Home() {
  const user = await getAppUser();
  const primaryHref = user ? defaultPortalForRole(user.role) : "/sign-in";

  return (
    <div className="flex flex-1 flex-col bg-background">
      <header className="border-b">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <span className="flex items-center gap-2 text-lg font-semibold">
            <GraduationCap className="size-5 text-primary" />
            UniSmart
          </span>
          <nav className="flex items-center gap-2 sm:gap-3">
            <ThemeToggle />
            <Button asChild variant="ghost">
              <Link href={primaryHref}>{user ? "Go to my portal" : "Sign in"}</Link>
            </Button>
            {!user && (
              <Button asChild>
                <Link href="/activate">Activate account</Link>
              </Button>
            )}
          </nav>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-20 px-6 py-16 sm:py-20">
        <section className="relative flex flex-col gap-6 overflow-hidden">
          <div
            aria-hidden
            className="pointer-events-none absolute -top-24 -right-24 -z-10 size-96 rounded-full bg-primary/10 blur-3xl"
          />
          <span className="inline-flex w-fit items-center gap-1.5 rounded-full border bg-accent px-3 py-1 text-xs font-medium text-accent-foreground">
            <QrCode className="size-3.5" />
            Now with QR graduation check-in
          </span>
          <h1 className="max-w-2xl text-4xl font-semibold tracking-tight sm:text-5xl">
            One system for the whole university.
          </h1>
          <p className="max-w-xl text-lg text-muted-foreground">
            Student, lecturer, department, faculty, registrar, finance, accommodation, library
            and executive portals — plus a QR-based graduation visitor system that replaces
            physical queues at the arena gate.
          </p>
          <div className="flex gap-3">
            <Button asChild size="lg">
              <Link href={primaryHref}>
                {user ? "Go to my portal" : "Get started"}
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {FEATURES.map((f) => (
            <Card key={f.title} className="border-t-2 border-t-primary">
              <CardHeader>
                <f.icon className="mb-1 size-5 text-primary" />
                <CardTitle className="text-base">{f.title}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">{f.body}</CardContent>
            </Card>
          ))}
        </section>

        <section>
          <h2 className="mb-4 text-xl font-semibold">Portals</h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {Object.entries(PORTALS).map(([slug, portal]) => {
              const Icon = PORTAL_ICONS[slug] ?? LayoutDashboard;
              return (
                <Card key={slug} className="transition hover:border-primary/40">
                  <CardHeader className="flex flex-row items-center gap-3 space-y-0">
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-accent">
                      <Icon className="size-4.5 text-accent-foreground" />
                    </div>
                    <CardTitle className="text-sm">{portal.label}</CardTitle>
                  </CardHeader>
                  <CardContent className="text-xs text-muted-foreground">{portal.description}</CardContent>
                </Card>
              );
            })}
          </div>
        </section>
      </main>

      <footer className="border-t">
        <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-2 px-6 py-6 text-xs text-muted-foreground sm:grid-cols-3 sm:gap-0">
          <span>© {new Date().getFullYear()} UniSmart</span>
          <span className="text-center">
            Powered by{" "}
            <span className="font-semibold">
              <span className="text-primary">Forge</span>
              <span className="text-red-600 dark:text-red-500">StackX</span>
            </span>
          </span>
          <span className="sm:text-right">Built on Next.js & Neon</span>
        </div>
      </footer>
    </div>
  );
}
