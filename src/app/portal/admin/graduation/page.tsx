import { getDb } from "@/db";
import { graduationCeremonies, graduationPasses, graduationVisitors, scanEvents } from "@/db/schema";
import { count, sql } from "drizzle-orm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Meter } from "@/components/meter";

export default async function AdminGraduationPage() {
  const db = getDb();

  const [ceremonies, [{ value: totalVisitors }], [{ value: totalPasses }], [{ value: checkedIn }], stationRows] =
    await Promise.all([
      db.select().from(graduationCeremonies),
      db.select({ value: count() }).from(graduationVisitors),
      db.select({ value: count() }).from(graduationPasses),
      db.select({ value: count() }).from(graduationPasses).where(sql`${graduationPasses.status} = 'used'`),
      db
        .select({ stationName: scanEvents.stationName, result: scanEvents.result, value: count() })
        .from(scanEvents)
        .groupBy(scanEvents.stationName, scanEvents.result),
    ]);

  const remaining = totalPasses - checkedIn;

  const stationSummary = new Map<string, { valid: number; rejected: number }>();
  for (const row of stationRows) {
    const key = row.stationName ?? "Unknown station";
    const entry = stationSummary.get(key) ?? { valid: 0, rejected: 0 };
    if (row.result === "valid") entry.valid += row.value;
    else entry.rejected += row.value;
    stationSummary.set(key, entry);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-normal text-muted-foreground">Ceremonies</CardTitle></CardHeader>
          <CardContent className="text-2xl font-semibold">{ceremonies.length}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-normal text-muted-foreground">Visitors Registered</CardTitle></CardHeader>
          <CardContent className="text-2xl font-semibold">{totalVisitors}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-normal text-muted-foreground">Checked In</CardTitle></CardHeader>
          <CardContent className="text-2xl font-semibold">{checkedIn}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-normal text-muted-foreground">Remaining</CardTitle></CardHeader>
          <CardContent className="text-2xl font-semibold">{remaining}</CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Check-in progress</CardTitle></CardHeader>
        <CardContent>
          <Meter
            label="Checked in"
            value={checkedIn}
            total={totalPasses || 1}
            valueLabel={`${checkedIn} of ${totalPasses} passes`}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Entry station performance</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Station</TableHead>
                <TableHead>Valid scans</TableHead>
                <TableHead>Rejected scans</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...stationSummary.entries()].map(([station, s]) => (
                <TableRow key={station}>
                  <TableCell>{station}</TableCell>
                  <TableCell>{s.valid}</TableCell>
                  <TableCell>{s.rejected}</TableCell>
                </TableRow>
              ))}
              {stationSummary.size === 0 && (
                <TableRow><TableCell colSpan={3} className="text-center text-muted-foreground">No scans yet</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
