import { getDb } from "@/db";
import { clearances, programs, students, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CLEARANCE_TYPES } from "@/lib/clearance";
import { toggleClearance } from "./actions";

export default async function RegistrarPage() {
  const db = getDb();

  const [allStudents, allClearances] = await Promise.all([
    db
      .select({
        userId: students.userId,
        studentNumber: students.studentNumber,
        firstName: users.firstName,
        lastName: users.lastName,
        programName: programs.name,
      })
      .from(students)
      .leftJoin(users, eq(students.userId, users.id))
      .leftJoin(programs, eq(students.programId, programs.id)),
    db.select().from(clearances),
  ]);

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
                <TableHead>Clearance</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {allStudents.map((s) => (
                <TableRow key={s.userId}>
                  <TableCell>{s.firstName} {s.lastName} ({s.studentNumber})</TableCell>
                  <TableCell>{s.programName}</TableCell>
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
              ))}
              {allStudents.length === 0 && (
                <TableRow><TableCell colSpan={3} className="text-center text-muted-foreground">No students yet</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
