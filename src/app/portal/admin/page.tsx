import { getDb } from "@/db";
import {
  courses,
  departments,
  faculties,
  graduationPasses,
  invoices,
  lecturers,
  programs,
  students,
} from "@/db/schema";
import { count, sql } from "drizzle-orm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Meter } from "@/components/meter";

export default async function AdminOverviewPage() {
  const db = getDb();

  const [
    [{ value: studentCount }],
    [{ value: lecturerCount }],
    [{ value: facultyCount }],
    [{ value: departmentCount }],
    [{ value: programCount }],
    [{ value: courseCount }],
    [{ value: passCount }],
    [{ value: usedPassCount }],
    allInvoices,
  ] = await Promise.all([
    db.select({ value: count() }).from(students),
    db.select({ value: count() }).from(lecturers),
    db.select({ value: count() }).from(faculties),
    db.select({ value: count() }).from(departments),
    db.select({ value: count() }).from(programs),
    db.select({ value: count() }).from(courses),
    db.select({ value: count() }).from(graduationPasses),
    db.select({ value: count() }).from(graduationPasses).where(sql`${graduationPasses.status} = 'used'`),
    db.select({ amount: invoices.amount, status: invoices.status }).from(invoices),
  ]);

  const totalBilled = allInvoices.reduce((sum, i) => sum + Number(i.amount), 0);
  const outstanding = allInvoices.filter((i) => i.status !== "paid").reduce((sum, i) => sum + Number(i.amount), 0);
  const collected = totalBilled - outstanding;

  const stats = [
    { label: "Students", value: studentCount },
    { label: "Lecturers", value: lecturerCount },
    { label: "Faculties", value: facultyCount },
    { label: "Departments", value: departmentCount },
    { label: "Programs", value: programCount },
    { label: "Courses", value: courseCount },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-normal text-muted-foreground">{s.label}</CardTitle>
            </CardHeader>
            <CardContent className="text-2xl font-semibold">{s.value}</CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Fee collection</CardTitle>
          </CardHeader>
          <CardContent>
            <Meter
              label="Collected"
              value={collected}
              total={totalBilled || 1}
              valueLabel={`$${collected.toFixed(2)} of $${totalBilled.toFixed(2)}`}
              tone="good"
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Graduation check-in</CardTitle>
          </CardHeader>
          <CardContent>
            <Meter
              label="Checked in"
              value={usedPassCount}
              total={passCount || 1}
              valueLabel={`${usedPassCount} of ${passCount} passes`}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
