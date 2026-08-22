import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { getDb } from "@/db";
import { courses, enrollments, lecturerCourses, lecturers } from "@/db/schema";
import { eq, count } from "drizzle-orm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default async function LecturerPage() {
  const { userId } = await auth();
  const db = getDb();

  const [lecturer] = await db.select().from(lecturers).where(eq(lecturers.userId, userId!)).limit(1);

  const assigned = await db
    .select({
      id: lecturerCourses.id,
      semester: lecturerCourses.semester,
      code: courses.code,
      title: courses.title,
      credits: courses.credits,
      courseId: courses.id,
    })
    .from(lecturerCourses)
    .leftJoin(courses, eq(lecturerCourses.courseId, courses.id))
    .where(eq(lecturerCourses.lecturerId, userId!));

  const enrollmentCounts = new Map<string, number>();
  for (const a of assigned) {
    if (!a.courseId) continue;
    const [{ value }] = await db.select({ value: count() }).from(enrollments).where(eq(enrollments.courseId, a.courseId));
    enrollmentCounts.set(a.courseId, value);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-normal text-muted-foreground">Staff Number</CardTitle></CardHeader>
          <CardContent className="text-lg font-semibold">{lecturer?.staffNumber ?? "—"}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-normal text-muted-foreground">Title</CardTitle></CardHeader>
          <CardContent className="text-lg font-semibold">{lecturer?.title ?? "—"}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-normal text-muted-foreground">Assigned Courses</CardTitle></CardHeader>
          <CardContent className="text-2xl font-semibold">{assigned.length}</CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Assigned Courses</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Semester</TableHead>
                <TableHead>Enrolled</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {assigned.map((a) => (
                <TableRow key={a.id}>
                  <TableCell>{a.code}</TableCell>
                  <TableCell>{a.title}</TableCell>
                  <TableCell><Badge variant="secondary">{a.semester}</Badge></TableCell>
                  <TableCell>{a.courseId ? enrollmentCounts.get(a.courseId) ?? 0 : 0}</TableCell>
                  <TableCell>
                    {a.courseId && (
                      <Link href={`/portal/lecturer/${a.courseId}`} className="text-sm text-primary underline">
                        Class list & grading
                      </Link>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {assigned.length === 0 && (
                <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground">No courses assigned yet</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
