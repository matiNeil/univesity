import { getDb } from "@/db";
import { roomAllocations, rooms, students, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AllocateForm } from "./allocate-form";
import { checkOutAllocation } from "./actions";

export default async function AccommodationPage() {
  const db = getDb();
  const [allRooms, allocations, allStudents] = await Promise.all([
    db.select().from(rooms),
    db
      .select({
        id: roomAllocations.id,
        status: roomAllocations.status,
        startDate: roomAllocations.startDate,
        hall: rooms.hall,
        roomNumber: rooms.roomNumber,
        firstName: users.firstName,
        lastName: users.lastName,
        studentNumber: students.studentNumber,
      })
      .from(roomAllocations)
      .leftJoin(rooms, eq(roomAllocations.roomId, rooms.id))
      .leftJoin(students, eq(roomAllocations.studentId, students.userId))
      .leftJoin(users, eq(students.userId, users.id)),
    db
      .select({ userId: students.userId, studentNumber: students.studentNumber, firstName: users.firstName, lastName: users.lastName })
      .from(students)
      .leftJoin(users, eq(students.userId, users.id)),
  ]);

  const occupied = allocations.filter((a) => a.status === "active").length;
  const totalCapacity = allRooms.reduce((sum, r) => sum + r.capacity, 0);

  const roomOptions = allRooms
    .map((r) => {
      const activeInRoom = allocations.filter((a) => a.hall === r.hall && a.roomNumber === r.roomNumber && a.status === "active").length;
      return { id: r.id, label: `${r.hall} — ${r.roomNumber} (${activeInRoom}/${r.capacity})`, spaceLeft: r.capacity - activeInRoom };
    })
    .filter((r) => r.spaceLeft > 0);
  const studentsWithActive = new Set(allocations.filter((a) => a.status === "active").map((a) => a.studentNumber));
  const studentOptions = allStudents
    .filter((s) => !studentsWithActive.has(s.studentNumber))
    .map((s) => ({ userId: s.userId, label: `${s.firstName ?? ""} ${s.lastName ?? ""} (${s.studentNumber})`.trim() }));

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-normal text-muted-foreground">Rooms</CardTitle></CardHeader>
          <CardContent className="text-2xl font-semibold">{allRooms.length}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-normal text-muted-foreground">Capacity</CardTitle></CardHeader>
          <CardContent className="text-2xl font-semibold">{totalCapacity}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-normal text-muted-foreground">Active Allocations</CardTitle></CardHeader>
          <CardContent className="text-2xl font-semibold">{occupied}</CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Allocate a room</CardTitle></CardHeader>
        <CardContent>
          <AllocateForm rooms={roomOptions} students={studentOptions} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Allocations</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Hall / Room</TableHead>
                <TableHead>Since</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {allocations.map((a) => (
                <TableRow key={a.id}>
                  <TableCell>{a.firstName} {a.lastName} ({a.studentNumber})</TableCell>
                  <TableCell>{a.hall} — {a.roomNumber}</TableCell>
                  <TableCell>{new Date(a.startDate).toLocaleDateString()}</TableCell>
                  <TableCell><Badge variant="secondary">{a.status}</Badge></TableCell>
                  <TableCell>
                    {a.status === "active" && (
                      <form action={checkOutAllocation}>
                        <input type="hidden" name="allocationId" value={a.id} />
                        <Button type="submit" size="sm" variant="secondary">Check out</Button>
                      </form>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {allocations.length === 0 && (
                <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground">No allocations yet</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
