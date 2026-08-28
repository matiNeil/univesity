import { LayoutDashboard, GraduationCap, CalendarClock, BookOpen, FileBadge } from "lucide-react";
import { requirePortal } from "@/lib/require-portal";
import { getAnnouncementsForRole } from "@/lib/announcements";
import { PortalShell, type NavItem } from "@/components/portal-shell";

const NAV: NavItem[] = [
  { href: "/portal/student", label: "Overview", icon: <LayoutDashboard className="size-4 shrink-0" /> },
  { href: "/portal/student/courses", label: "Courses", icon: <BookOpen className="size-4 shrink-0" /> },
  { href: "/portal/student/timetable", label: "Timetable", icon: <CalendarClock className="size-4 shrink-0" /> },
  { href: "/portal/student/transcript", label: "Transcript", icon: <FileBadge className="size-4 shrink-0" /> },
  { href: "/portal/student/graduation", label: "Graduation", icon: <GraduationCap className="size-4 shrink-0" /> },
];

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  const appUser = await requirePortal("student");
  const announcements = await getAnnouncementsForRole(appUser.role);
  return (
    <PortalShell title="Student Portal" role={appUser.role} navItems={NAV} announcements={announcements}>
      {children}
    </PortalShell>
  );
}
