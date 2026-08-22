export const ROLES = [
  "student",
  "lecturer",
  "department_admin",
  "faculty_admin",
  "registrar",
  "finance",
  "accommodation",
  "library",
  "graduation_staff",
  "admin",
] as const;

export type Role = (typeof ROLES)[number];

export const PORTALS: Record<
  string,
  { label: string; roles: Role[]; description: string }
> = {
  student: {
    label: "Student Portal",
    roles: ["student"],
    description: "Courses, results, fees, graduation & visitor passes",
  },
  lecturer: {
    label: "Lecturer Portal",
    roles: ["lecturer"],
    description: "Assigned courses, class lists, grading",
  },
  department: {
    label: "Department Portal",
    roles: ["department_admin"],
    description: "Programs, courses, lecturers, student progression",
  },
  faculty: {
    label: "Faculty Portal",
    roles: ["faculty_admin"],
    description: "Faculty-wide oversight across departments",
  },
  registrar: {
    label: "Registrar",
    roles: ["registrar"],
    description: "Admissions, records, clearance, graduation management",
  },
  finance: {
    label: "Finance",
    roles: ["finance"],
    description: "Invoices, payments, outstanding balances",
  },
  accommodation: {
    label: "Accommodation",
    roles: ["accommodation"],
    description: "Rooms, allocations, check-in/out",
  },
  library: {
    label: "Library",
    roles: ["library"],
    description: "Catalogue, loans, fines",
  },
  scan: {
    label: "Graduation Scanner",
    roles: ["graduation_staff"],
    description: "Scan visitor QR passes at the arena entrance",
  },
  admin: {
    label: "Executive Dashboard",
    roles: ["admin"],
    description: "University-wide overview and analytics",
  },
};

export const ROLE_LABELS: Record<Role, string> = {
  student: "Student",
  lecturer: "Lecturer",
  department_admin: "Department Admin",
  faculty_admin: "Faculty Admin",
  registrar: "Registrar",
  finance: "Finance Officer",
  accommodation: "Accommodation Officer",
  library: "Librarian",
  graduation_staff: "Graduation Staff",
  admin: "Executive / Admin",
};

export function defaultPortalForRole(role: Role): string {
  const entry = Object.entries(PORTALS).find(([, p]) => p.roles.includes(role));
  return entry ? `/portal/${entry[0]}` : "/portal";
}

export function canAccessPortal(role: Role | null | undefined, slug: string): boolean {
  if (!role) return false;
  if (role === "admin") return true;
  const portal = PORTALS[slug];
  return !!portal && portal.roles.includes(role);
}
