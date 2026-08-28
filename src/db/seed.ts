import { getDb } from "./index";
import {
  books,
  courses,
  departments,
  faculties,
  graduationCeremonies,
  lecturerRegistry,
  programs,
  rooms,
  studentRegistry,
  users,
} from "./schema";
import { newId } from "../lib/id";
import { hashPassword } from "../lib/password";
import type { Role } from "../lib/roles";

const DEMO_PASSWORD = "Password123!";

async function main() {
  const db = getDb();

  const [fse] = await db
    .insert(faculties)
    .values({ id: newId("fac"), name: "Faculty of Science and Engineering", code: "FSE" })
    .returning();
  const [fh] = await db
    .insert(faculties)
    .values({ id: newId("fac"), name: "Faculty of Humanities", code: "FH" })
    .returning();

  const [cs] = await db
    .insert(departments)
    .values({ id: newId("dept"), name: "Department of Computer Science", code: "CS", facultyId: fse.id })
    .returning();
  const [math] = await db
    .insert(departments)
    .values({ id: newId("dept"), name: "Department of Mathematics", code: "MATH", facultyId: fse.id })
    .returning();
  const [eng] = await db
    .insert(departments)
    .values({ id: newId("dept"), name: "Department of English", code: "ENG", facultyId: fh.id })
    .returning();

  const [bsccs, bscmath] = await db
    .insert(programs)
    .values([
      { id: newId("prog"), name: "BSc Computer Science", code: "BSCCS", degreeLevel: "Bachelor", departmentId: cs.id },
      { id: newId("prog"), name: "BSc Mathematics", code: "BSCMATH", degreeLevel: "Bachelor", departmentId: math.id },
      { id: newId("prog"), name: "BA English", code: "BAENG", degreeLevel: "Bachelor", departmentId: eng.id },
    ])
    .returning();

  await db.insert(courses).values([
    { id: newId("crs"), code: "CS101", title: "Introduction to Programming", credits: 3, departmentId: cs.id },
    { id: newId("crs"), code: "CS201", title: "Data Structures & Algorithms", credits: 4, departmentId: cs.id },
    { id: newId("crs"), code: "CS301", title: "Database Systems", credits: 3, departmentId: cs.id },
    { id: newId("crs"), code: "MATH101", title: "Calculus I", credits: 3, departmentId: math.id },
    { id: newId("crs"), code: "ENG101", title: "Introduction to Literature", credits: 3, departmentId: eng.id },
  ]);

  await db.insert(rooms).values([
    { id: newId("room"), hall: "Hall A", roomNumber: "101", capacity: 4 },
    { id: newId("room"), hall: "Hall A", roomNumber: "102", capacity: 4 },
    { id: newId("room"), hall: "Hall B", roomNumber: "201", capacity: 2 },
  ]);

  await db.insert(books).values([
    { id: newId("book"), title: "Introduction to Algorithms", author: "Cormen et al.", isbn: "9780262033848", totalCopies: 5, availableCopies: 5 },
    { id: newId("book"), title: "Clean Code", author: "Robert C. Martin", isbn: "9780132350884", totalCopies: 3, availableCopies: 3 },
    { id: newId("book"), title: "Calculus", author: "James Stewart", isbn: "9781285740621", totalCopies: 4, availableCopies: 4 },
  ]);

  const ceremonyDate = new Date();
  ceremonyDate.setMonth(ceremonyDate.getMonth() + 3);

  await db.insert(graduationCeremonies).values({
    id: newId("cer"),
    name: "2026 Graduation Ceremony",
    year: 2026,
    ceremonyDate,
    venue: "Main Arena",
  });

  // Pre-provisioned rosters: a real deployment loads these from the
  // registrar/HR system. Students and lecturers activate their accounts at
  // /activate by proving they match a row here, then set their own password.
  const passwordHash = await hashPassword(DEMO_PASSWORD);

  await db.insert(studentRegistry).values([
    {
      id: newId("sreg"),
      registrationNumber: "R230001",
      nationalId: "63-123456A78",
      universityEmail: "r230001@students.unismart.edu",
      firstName: "Tendai",
      lastName: "Moyo",
      programId: bsccs.id,
      yearOfStudy: 2,
    },
    {
      id: newId("sreg"),
      registrationNumber: "R230002",
      nationalId: "63-654321B12",
      universityEmail: "r230002@students.unismart.edu",
      firstName: "Rutendo",
      lastName: "Chikafu",
      programId: bscmath.id,
      yearOfStudy: 1,
    },
  ]);

  await db.insert(lecturerRegistry).values([
    {
      id: newId("lreg"),
      staffNumber: "L100001",
      nationalId: "63-111222C33",
      universityEmail: "l100001@unismart.edu",
      firstName: "Farai",
      lastName: "Ncube",
      departmentId: cs.id,
      title: "Senior Lecturer",
    },
  ]);

  // Staff/admin roles have no self-service activation — accounts are created
  // directly here (in production, by an administrator) and log in with
  // University Email + Password.
  const staffAccounts: { email: string; firstName: string; lastName: string; role: Role }[] = [
    { email: "department.admin@unismart.edu", firstName: "Department", lastName: "Admin", role: "department_admin" },
    { email: "faculty.admin@unismart.edu", firstName: "Faculty", lastName: "Admin", role: "faculty_admin" },
    { email: "registrar@unismart.edu", firstName: "University", lastName: "Registrar", role: "registrar" },
    { email: "finance@unismart.edu", firstName: "Finance", lastName: "Officer", role: "finance" },
    { email: "accommodation@unismart.edu", firstName: "Accommodation", lastName: "Officer", role: "accommodation" },
    { email: "library@unismart.edu", firstName: "University", lastName: "Librarian", role: "library" },
    { email: "graduation.staff@unismart.edu", firstName: "Graduation", lastName: "Staff", role: "graduation_staff" },
    { email: "admin@unismart.edu", firstName: "Executive", lastName: "Admin", role: "admin" },
  ];

  await db.insert(users).values(
    staffAccounts.map((a) => ({
      id: newId("usr"),
      email: a.email,
      passwordHash,
      firstName: a.firstName,
      lastName: a.lastName,
      role: a.role,
    }))
  );

  console.log("Seed complete.");
  console.log(`\nDemo password for all seeded accounts: ${DEMO_PASSWORD}`);
  console.log("Activate at /activate with:");
  console.log("  Student  — reg R230001, national ID 63-123456A78, email r230001@students.unismart.edu");
  console.log("  Lecturer — staff L100001, national ID 63-111222C33, email l100001@unismart.edu");
  console.log("Sign in directly at /sign-in with any staffAccounts email above + the demo password.");
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
