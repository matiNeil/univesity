import { notFound } from "next/navigation";
import { getAppUser } from "@/lib/session";
import Link from "next/link";
import { getDb } from "@/db";
import { attendanceRecords, courses, enrollments, lecturerCourses, students, users } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft } from "lucide-react";
import { markAttendance, setGrade } from "../actions";

const GRADES = ["A", "B", "C", "D", "F", "I", "W"];
const ATTENDANCE_STATUSES = ["present", "absent", "late"] as const;

export default async function LecturerClassListPage({
  params,
  searchParams,
}: {
  params: Promise<{ courseId: string }>;
  searchParams: Promise<{ date?: string }>;
}) {
  const { courseId } = await params;
  const { date: dateParam } = await searchParams;
  const date = dateParam ?? new Date().toISOString().slice(0, 10);
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

  const dayAttendance = await db
    .select({ enrollmentId: attendanceRecords.enrollmentId, status: attendanceRecords.status })
    .from(attendanceRecords)
    .innerJoin(enrollments, eq(attendanceRecords.enrollmentId, enrollments.id))
    .where(and(eq(attendanceRecords.date, date), eq(enrollments.courseId, courseId)));
  const attendanceMap = new Map(dayAttendance.map((a) => [a.enrollmentId, a.status]));

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

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Attendance</CardTitle>
          <form method="GET" className="flex items-center gap-2 pt-2">
            <Input type="date" name="date" defaultValue={date} className="w-fit" />
            <Button type="submit" size="sm" variant="secondary">Go</Button>
          </form>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {roster.map((r) => (
                <TableRow key={r.id}>
                  <TableCell>{r.firstName} {r.lastName} ({r.studentNumber})</TableCell>
                  <TableCell>{attendanceMap.get(r.id) ?? "not marked"}</TableCell>
                  <TableCell>
                    <form action={markAttendance} className="flex items-center gap-2">
                      <input type="hidden" name="enrollmentId" value={r.id} />
                      <input type="hidden" name="courseId" value={courseId} />
                      <input type="hidden" name="date" value={date} />
                      <select
                        name="status"
                        defaultValue={attendanceMap.get(r.id) ?? "present"}
                        className="h-8 rounded-lg border border-input bg-transparent px-2 text-sm"
                      >
                        {ATTENDANCE_STATUSES.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                      <Button type="submit" size="sm" variant="secondary">Save</Button>
                    </form>
                  </TableCell>
                </TableRow>
              ))}
              {roster.length === 0 && (
                <TableRow><TableCell colSpan={3} className="text-center text-muted-foreground">No students enrolled yet</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
