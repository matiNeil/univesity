import { getDb } from "./index";
import { books, courses, departments, faculties, graduationCeremonies, programs, rooms } from "./schema";
import { newId } from "../lib/id";

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

  await db.insert(programs).values([
    { id: newId("prog"), name: "BSc Computer Science", code: "BSCCS", degreeLevel: "Bachelor", departmentId: cs.id },
    { id: newId("prog"), name: "BSc Mathematics", code: "BSCMATH", degreeLevel: "Bachelor", departmentId: math.id },
    { id: newId("prog"), name: "BA English", code: "BAENG", degreeLevel: "Bachelor", departmentId: eng.id },
  ]);

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

  console.log("Seed complete.");
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
