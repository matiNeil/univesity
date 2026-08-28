import { getAppUser } from "@/lib/session";
import { getDb } from "@/db";
import { courses, enrollments, programRequirements, programs, students } from "@/db/schema";
import { eq } from "drizzle-orm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { computeDegreeAudit, computeGpa, computeSemesterGpas } from "@/lib/gpa";

export default async function StudentTranscriptPage() {
  const appUser = await getAppUser();
  const userId = appUser!.id;
  const db = getDb();

  const [student] = await db
    .select({
      programId: students.programId,
      studentNumber: students.studentNumber,
      yearOfStudy: students.yearOfStudy,
      programName: programs.name,
      degreeLevel: programs.degreeLevel,
      totalCreditsRequired: programs.totalCreditsRequired,
    })
    .from(students)
    .leftJoin(programs, eq(students.programId, programs.id))
    .where(eq(students.userId, userId!))
    .limit(1);

  const [myEnrollments, requiredCourses] = await Promise.all([
    db
      .select({
        id: enrollments.id,
        semester: enrollments.semester,
        grade: enrollments.grade,
        courseId: enrollments.courseId,
        code: courses.code,
        title: courses.title,
        credits: courses.credits,
      })
      .from(enrollments)
      .leftJoin(courses, eq(enrollments.courseId, courses.id))
      .where(eq(enrollments.studentId, userId!)),
    student
      ? db
          .select({ id: courses.id, code: courses.code, title: courses.title })
          .from(programRequirements)
          .leftJoin(courses, eq(programRequirements.courseId, courses.id))
          .where(eq(programRequirements.programId, student.programId))
      : Promise.resolve([]),
  ]);

  const gradedEnrollments = myEnrollments.map((e) => ({ grade: e.grade, credits: e.credits ?? 0 }));
  const cumulativeGpa = computeGpa(gradedEnrollments);
  const semesterGpas = computeSemesterGpas(
    myEnrollments.map((e) => ({ grade: e.grade, credits: e.credits ?? 0, semester: e.semester }))
  );

  const validRequiredCourses = requiredCourses
    .filter((c) => c.id !== null && c.code !== null && c.title !== null)
    .map((c) => ({ id: c.id as string, code: c.code as string, title: c.title as string }));

  const degreeAudit = student
    ? computeDegreeAudit({
        totalCreditsRequired: student.totalCreditsRequired ?? 0,
        requiredCourses: validRequiredCourses,
        enrollments: myEnrollments.map((e) => ({ courseId: e.courseId, grade: e.grade, credits: e.credits ?? 0 })),
      })
    : null;

  const bySemester = new Map<string, typeof myEnrollments>();
  for (const e of myEnrollments) {
    const list = bySemester.get(e.semester) ?? [];
    list.push(e);
    bySemester.set(e.semester, list);
  }
  const semesters = [...bySemester.keys()].sort();

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{student?.programName ?? "No program assigned"}</CardTitle>
          <p className="text-sm text-muted-foreground">
            {student?.degreeLevel} · Year {student?.yearOfStudy} · {student?.studentNumber}
          </p>
        </CardHeader>
        <CardContent>
          <Badge variant="secondary">
            Cumulative GPA: {cumulativeGpa !== null ? cumulativeGpa.toFixed(2) : "—"}
          </Badge>
        </CardContent>
      </Card>

      {degreeAudit && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Degree Progress</CardTitle>
            <p className="text-sm text-muted-foreground">
              {degreeAudit.creditsCompleted} / {degreeAudit.creditsRequired} credits completed
            </p>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {degreeAudit.requiredCourses.map((c) => (
              <Badge
                key={c.id}
                variant={c.status === "completed" ? "default" : c.status === "in_progress" ? "secondary" : "destructive"}
              >
                {c.status === "completed" ? "🟢" : c.status === "in_progress" ? "🟡" : "🔴"} {c.code}
              </Badge>
            ))}
            {degreeAudit.requiredCourses.length === 0 && (
              <p className="text-sm text-muted-foreground">No required courses on record for your program</p>
            )}
          </CardContent>
        </Card>
      )}

      {semesters.map((semester) => {
        const semesterGpa = semesterGpas.get(semester);
        return (
          <Card key={semester}>
            <CardHeader>
              <div className="flex items-center justify-between gap-2">
                <CardTitle className="text-base">{semester}</CardTitle>
                <span className="text-sm text-muted-foreground">
                  GPA: {semesterGpa !== null && semesterGpa !== undefined ? semesterGpa.toFixed(2) : "—"}
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Credits</TableHead>
                    <TableHead>Grade</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bySemester.get(semester)!.map((e) => (
                    <TableRow key={e.id}>
                      <TableCell>{e.code}</TableCell>
                      <TableCell>{e.title}</TableCell>
                      <TableCell>{e.credits}</TableCell>
                      <TableCell>{e.grade ?? "—"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        );
      })}

      {semesters.length === 0 && (
        <p className="text-sm text-muted-foreground">No academic record yet</p>
      )}
    </div>
  );
}
