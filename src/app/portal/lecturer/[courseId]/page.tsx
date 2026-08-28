import { notFound } from "next/navigation";
import { getAppUser } from "@/lib/session";
import Link from "next/link";
import { getDb } from "@/db";
import { courses, enrollments, lecturerCourses, students, users } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { setGrade } from "../actions";

const GRADES = ["A", "B", "C", "D", "F", "I", "W"];

export default async function LecturerClassListPage({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = await params;
  const appUser = await getAppUser();
  const userId = appUser!.id;
  const db = getDb();

  const [assignment] = await db
    .select({ courseId: lecturerCourses.courseId, code: courses.code, title: courses.title })
    .from(lecturerCourses)
    .leftJoin(courses, eq(lecturerCourses.courseId, courses.id))
    .where(and(eq(lecturerCourses.lecturerId, userId!), eq(lecturerCourses.courseId, courseId)))
    .limit(1);

  if (!assignment) notFound();

  const roster = await db
    .select({
      id: enrollments.id,
      semester: enrollments.semester,
      grade: enrollments.grade,
      studentNumber: students.studentNumber,
      firstName: users.firstName,
      lastName: users.lastName,
    })
    .from(enrollments)
    .leftJoin(students, eq(enrollments.studentId, students.userId))
    .leftJoin(users, eq(students.userId, users.id))
    .where(eq(enrollments.courseId, courseId));

  return (
    <div className="flex flex-col gap-6">
      <Link href="/portal/lecturer" className="inline-flex w-fit items-center gap-1.5 text-sm text-muted-foreground hover:underline">
        <ArrowLeft className="size-4" /> Back to my courses
      </Link>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{assignment.code} — {assignment.title}</CardTitle>
          <p className="text-sm text-muted-foreground">Class list & grading</p>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Semester</TableHead>
                <TableHead>Grade</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {roster.map((r) => (
                <TableRow key={r.id}>
                  <TableCell>{r.firstName} {r.lastName} ({r.studentNumber})</TableCell>
                  <TableCell>{r.semester}</TableCell>
                  <TableCell>{r.grade ?? "—"}</TableCell>
                  <TableCell>
                    <form action={setGrade} className="flex items-center gap-2">
                      <input type="hidden" name="enrollmentId" value={r.id} />
                      <input type="hidden" name="courseId" value={courseId} />
                      <select
                        name="grade"
                        defaultValue={r.grade ?? ""}
                        className="h-8 rounded-lg border border-input bg-transparent px-2 text-sm"
                      >
                        <option value="" disabled>Grade</option>
                        {GRADES.map((g) => (
                          <option key={g} value={g}>{g}</option>
                        ))}
                      </select>
                      <Button type="submit" size="sm" variant="secondary">Save</Button>
                    </form>
                  </TableCell>
                </TableRow>
              ))}
              {roster.length === 0 && (
                <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground">No students enrolled yet</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
