import { getDb } from "@/db";
import { invoices, students, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Meter } from "@/components/meter";
import { InvoiceForm } from "./invoice-form";
import { PaymentDialog } from "./payment-dialog";

export default async function FinancePage() {
  const db = getDb();
  const [rows, allStudents] = await Promise.all([
    db
      .select({
        id: invoices.id,
        description: invoices.description,
        amount: invoices.amount,
        dueDate: invoices.dueDate,
        status: invoices.status,
        studentNumber: students.studentNumber,
        firstName: users.firstName,
        lastName: users.lastName,
      })
      .from(invoices)
      .leftJoin(students, eq(invoices.studentId, students.userId))
      .leftJoin(users, eq(students.userId, users.id)),
    db
      .select({ userId: students.userId, studentNumber: students.studentNumber, firstName: users.firstName, lastName: users.lastName })
      .from(students)
      .leftJoin(users, eq(students.userId, users.id)),
  ]);

  const studentOptions = allStudents.map((s) => ({
    userId: s.userId,
    label: `${s.firstName ?? ""} ${s.lastName ?? ""} (${s.studentNumber})`.trim(),
  }));

  const outstanding = rows
    .filter((r) => r.status !== "paid")
    .reduce((sum, r) => sum + Number(r.amount), 0);
  const collected = rows
    .filter((r) => r.status === "paid")
    .reduce((sum, r) => sum + Number(r.amount), 0);

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-normal text-muted-foreground">Invoices</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">{rows.length}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-normal text-muted-foreground">Outstanding</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">${outstanding.toFixed(2)}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-normal text-muted-foreground">Collected</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">${collected.toFixed(2)}</CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Collection progress</CardTitle>
        </CardHeader>
        <CardContent>
          <Meter
            label="Collected"
            value={collected}
            total={collected + outstanding || 1}
            valueLabel={`$${collected.toFixed(2)} of $${(collected + outstanding).toFixed(2)}`}
            tone="good"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">New invoice</CardTitle>
        </CardHeader>
        <CardContent>
          <InvoiceForm students={studentOptions} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Invoices</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Due</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r) => (
                <TableRow key={r.id}>
                  <TableCell>{r.firstName} {r.lastName} ({r.studentNumber})</TableCell>
                  <TableCell>{r.description}</TableCell>
                  <TableCell>${Number(r.amount).toFixed(2)}</TableCell>
                  <TableCell>{new Date(r.dueDate).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Badge variant={r.status === "paid" ? "default" : "destructive"}>{r.status}</Badge>
                  </TableCell>
                  <TableCell>
                    {r.status !== "paid" && <PaymentDialog invoiceId={r.id} description={r.description} />}
                  </TableCell>
                </TableRow>
              ))}
              {rows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground">
                    No invoices yet
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
