import { getDb } from "@/db";
import { getAppUser } from "@/lib/session";
import { courses, enrollments, programs, students } from "@/db/schema";
import { eq } from "drizzle-orm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EnrollForm } from "./enroll-form";

export default async function StudentCoursesPage() {
  const appUser = await getAppUser();
  const studentId = appUser!.id;
  const db = getDb();

  const [student] = await db
    .select({ programId: students.programId })
    .from(students)
    .where(eq(students.userId, studentId))
    .limit(1);

  const [program] = student
    ? await db.select({ departmentId: programs.departmentId }).from(programs).where(eq(programs.id, student.programId)).limit(1)
    : [null];

  const [departmentCourses, myEnrollments] = await Promise.all([
    program
      ? db.select().from(courses).where(eq(courses.departmentId, program.departmentId))
      : Promise.resolve([]),
    db
      .select({ id: enrollments.id, semester: enrollments.semester, grade: enrollments.grade, code: courses.code, title: courses.title })
      .from(enrollments)
      .leftJoin(courses, eq(enrollments.courseId, courses.id))
      .where(eq(enrollments.studentId, studentId)),
  ]);

  const courseOptions = departmentCourses.map((c) => ({ id: c.id, label: `${c.code} — ${c.title}` }));

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Enroll in a course</CardTitle>
          <p className="text-sm text-muted-foreground">Courses offered by your department.</p>
        </CardHeader>
        <CardContent>
          <EnrollForm courses={courseOptions} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">My enrollments</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Semester</TableHead>
                <TableHead>Grade</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {myEnrollments.map((e) => (
                <TableRow key={e.id}>
                  <TableCell>{e.code}</TableCell>
                  <TableCell>{e.title}</TableCell>
                  <TableCell>{e.semester}</TableCell>
                  <TableCell>{e.grade ?? "—"}</TableCell>
                </TableRow>
              ))}
              {myEnrollments.length === 0 && (
                <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground">No enrollments yet</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
