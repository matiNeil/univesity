import Link from "next/link";
import { getAppUser } from "@/lib/session";
import { getDb } from "@/db";
import { clearances, courses, enrollments, invoices, lecturers, programs, students, tutorAssignments, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CLEARANCE_TYPES } from "@/lib/clearance";
import { computeGpa } from "@/lib/gpa";

export default async function StudentOverviewPage() {
  const appUser = await getAppUser();
  const userId = appUser!.id;
  const db = getDb();

  const [student] = await db
    .select({
      studentNumber: students.studentNumber,
      yearOfStudy: students.yearOfStudy,
      programName: programs.name,
      degreeLevel: programs.degreeLevel,
    })
    .from(students)
    .leftJoin(programs, eq(students.programId, programs.id))
    .where(eq(students.userId, userId!))
    .limit(1);

  const [studentClearances, myEnrollments, myInvoices, [tutor]] = await Promise.all([
    db.select().from(clearances).where(eq(clearances.studentId, userId!)),
    db
      .select({
        id: enrollments.id,
        semester: enrollments.semester,
        grade: enrollments.grade,
        title: courses.title,
        code: courses.code,
        credits: courses.credits,
      })
      .from(enrollments)
      .leftJoin(courses, eq(enrollments.courseId, courses.id))
      .where(eq(enrollments.studentId, userId!)),
    db.select().from(invoices).where(eq(invoices.studentId, userId!)),
    db
      .select({ firstName: users.firstName, lastName: users.lastName, email: users.email })
      .from(tutorAssignments)
      .leftJoin(lecturers, eq(tutorAssignments.lecturerId, lecturers.userId))
      .leftJoin(users, eq(lecturers.userId, users.id))
      .where(eq(tutorAssignments.studentId, userId!))
      .limit(1),
  ]);

  const outstanding = myInvoices.filter((i) => i.status !== "paid").reduce((s, i) => s + Number(i.amount), 0);
  const cumulativeGpa = computeGpa(myEnrollments.map((e) => ({ grade: e.grade, credits: e.credits ?? 0 })));

  const clearanceMap = new Map(studentClearances.map((c) => [c.type, c.status]));

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{student?.programName ?? "No program assigned"}</CardTitle>
          <p className="text-sm text-muted-foreground">
            {student?.degreeLevel} · Year {student?.yearOfStudy} · {student?.studentNumber}
          </p>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-normal text-muted-foreground">Enrolled Courses</CardTitle></CardHeader>
          <CardContent className="text-2xl font-semibold">{myEnrollments.length}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-normal text-muted-foreground">Cumulative GPA</CardTitle></CardHeader>
          <CardContent className="text-2xl font-semibold">{cumulativeGpa !== null ? cumulativeGpa.toFixed(2) : "—"}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-normal text-muted-foreground">Outstanding Fees</CardTitle></CardHeader>
          <CardContent className="text-2xl font-semibold">${outstanding.toFixed(2)}</CardContent>
        </Card>
        <Card className="flex flex-col justify-between">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-normal text-muted-foreground">Graduation</CardTitle></CardHeader>
          <CardContent>
            <Button asChild size="sm"><Link href="/portal/student/graduation">Go to Graduation</Link></Button>
          </CardContent>
        </Card>
      </div>

      {tutor && (
        <Card>
          <CardHeader><CardTitle className="text-base">My Tutor</CardTitle></CardHeader>
          <CardContent className="text-sm">
            <p className="font-medium">{tutor.firstName} {tutor.lastName}</p>
            <p className="text-muted-foreground">{tutor.email}</p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle className="text-base">Clearance Status</CardTitle></CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          {CLEARANCE_TYPES.map((type) => {
            const status = clearanceMap.get(type) ?? "pending";
            return (
              <Badge key={type} variant={status === "cleared" ? "default" : status === "blocked" ? "destructive" : "secondary"}>
                {status === "cleared" ? "🟢" : status === "blocked" ? "🔴" : "🟡"} {type}
              </Badge>
            );
          })}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Courses</CardTitle></CardHeader>
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
