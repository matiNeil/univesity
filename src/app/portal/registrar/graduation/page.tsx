import { getDb } from "@/db";
import { clearances, graduationApplications, graduationCeremonies, students, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CLEARANCE_TYPES } from "@/lib/clearance";
import { setApplicationStatus } from "../actions";

export default async function RegistrarGraduationPage() {
  const db = getDb();

  const applications = await db
    .select({
      id: graduationApplications.id,
      status: graduationApplications.status,
      appliedAt: graduationApplications.appliedAt,
      studentId: graduationApplications.studentId,
      studentNumber: students.studentNumber,
      firstName: users.firstName,
      lastName: users.lastName,
      ceremonyName: graduationCeremonies.name,
    })
    .from(graduationApplications)
    .leftJoin(students, eq(graduationApplications.studentId, students.userId))
    .leftJoin(users, eq(students.userId, users.id))
    .leftJoin(graduationCeremonies, eq(graduationApplications.ceremonyId, graduationCeremonies.id));

  const allClearances = await db.select().from(clearances);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Graduation applications</CardTitle>
        <p className="text-sm text-muted-foreground">
          Approve only once all clearance types are green. Approving unlocks visitor QR pass registration for the student.
        </p>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student</TableHead>
              <TableHead>Ceremony</TableHead>
              <TableHead>Clearance</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {applications.map((a) => {
              const studentClearances = allClearances.filter((c) => c.studentId === a.studentId);
              const allCleared = CLEARANCE_TYPES.every(
                (t) => studentClearances.find((c) => c.type === t)?.status === "cleared"
              );
              return (
                <TableRow key={a.id}>
                  <TableCell>{a.firstName} {a.lastName} ({a.studentNumber})</TableCell>
                  <TableCell>{a.ceremonyName}</TableCell>
                  <TableCell>{allCleared ? <Badge>🟢 All cleared</Badge> : <Badge variant="secondary">🟡 Pending items</Badge>}</TableCell>
                  <TableCell>
                    <Badge variant={a.status === "approved" ? "default" : a.status === "rejected" ? "destructive" : "secondary"}>
                      {a.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="flex gap-2">
                    <form action={setApplicationStatus}>
                      <input type="hidden" name="applicationId" value={a.id} />
                      <input type="hidden" name="status" value="approved" />
                      <Button type="submit" size="sm" disabled={a.status === "approved"}>Approve</Button>
                    </form>
                    <form action={setApplicationStatus}>
                      <input type="hidden" name="applicationId" value={a.id} />
                      <input type="hidden" name="status" value="rejected" />
                      <Button type="submit" size="sm" variant="destructive" disabled={a.status === "rejected"}>Reject</Button>
                    </form>
                  </TableCell>
                </TableRow>
              );
            })}
            {applications.length === 0 && (
              <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground">No applications yet</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
