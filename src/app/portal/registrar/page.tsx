import { getDb } from "@/db";
import { clearances, courses, enrollments, programs, students, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CLEARANCE_TYPES } from "@/lib/clearance";
import { computeGpa, isPassingGrade } from "@/lib/gpa";
import { toggleClearance } from "./actions";

export default async function RegistrarPage() {
  const db = getDb();

  const [allStudents, allClearances, allEnrollments] = await Promise.all([
    db
      .select({
        userId: students.userId,
        studentNumber: students.studentNumber,
        firstName: users.firstName,
        lastName: users.lastName,
        programName: programs.name,
        totalCreditsRequired: programs.totalCreditsRequired,
      })
      .from(students)
      .leftJoin(users, eq(students.userId, users.id))
      .leftJoin(programs, eq(students.programId, programs.id)),
    db.select().from(clearances),
    db
      .select({
        studentId: enrollments.studentId,
        grade: enrollments.grade,
        credits: courses.credits,
      })
      .from(enrollments)
      .leftJoin(courses, eq(enrollments.courseId, courses.id)),
  ]);

  const enrollmentsByStudent = new Map<string, typeof allEnrollments>();
  for (const e of allEnrollments) {
    const list = enrollmentsByStudent.get(e.studentId) ?? [];
    list.push(e);
    enrollmentsByStudent.set(e.studentId, list);
  }

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Students</CardTitle>
          <p className="text-sm text-muted-foreground">Click a clearance badge to cycle pending → cleared → blocked.</p>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Program</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead>Clearance</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {allStudents.map((s) => {
                const studentEnrollments = enrollmentsByStudent.get(s.userId) ?? [];
                const gpa = computeGpa(studentEnrollments.map((e) => ({ grade: e.grade, credits: e.credits ?? 0 })));
                const creditsCompleted = studentEnrollments
                  .filter((e) => isPassingGrade(e.grade))
                  .reduce((sum, e) => sum + (e.credits ?? 0), 0);
                return (
                <TableRow key={s.userId}>
                  <TableCell>{s.firstName} {s.lastName} ({s.studentNumber})</TableCell>
                  <TableCell>{s.programName}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    GPA {gpa !== null ? gpa.toFixed(2) : "—"} · {creditsCompleted}/{s.totalCreditsRequired ?? "—"} credits
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1.5">
                      {CLEARANCE_TYPES.map((type) => {
                        const status = allClearances.find((c) => c.studentId === s.userId && c.type === type)?.status ?? "pending";
                        const next = status === "pending" ? "cleared" : status === "cleared" ? "blocked" : "pending";
                        return (
                          <form action={toggleClearance} key={type}>
                            <input type="hidden" name="studentId" value={s.userId} />
                            <input type="hidden" name="type" value={type} />
                            <input type="hidden" name="nextStatus" value={next} />
                            <Button
                              type="submit"
                              variant="ghost"
                              size="sm"
                              className="h-auto p-0"
                            >
                              <Badge variant={status === "cleared" ? "default" : status === "blocked" ? "destructive" : "secondary"}>
                                {status === "cleared" ? "🟢" : status === "blocked" ? "🔴" : "🟡"} {type}
                              </Badge>
                            </Button>
                          </form>
                        );
                      })}
                    </div>
                  </TableCell>
                </TableRow>
                );
              })}
              {allStudents.length === 0 && (
                <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground">No students yet</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
