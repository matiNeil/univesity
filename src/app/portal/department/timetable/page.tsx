import { getDb } from "@/db";
import { classSessions, courses } from "@/db/schema";
import { eq } from "drizzle-orm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { dayLabel } from "@/lib/timetable";
import { SessionForm } from "./session-form";
import { deleteClassSession } from "./actions";

export default async function DepartmentTimetablePage() {
  const db = getDb();

  const [allCourses, sessions] = await Promise.all([
    db.select({ id: courses.id, code: courses.code, title: courses.title }).from(courses),
    db
      .select({
        id: classSessions.id,
        semester: classSessions.semester,
        dayOfWeek: classSessions.dayOfWeek,
        startTime: classSessions.startTime,
        endTime: classSessions.endTime,
        venue: classSessions.venue,
        code: courses.code,
        title: courses.title,
      })
      .from(classSessions)
      .leftJoin(courses, eq(classSessions.courseId, courses.id)),
  ]);

  const courseOptions = allCourses.map((c) => ({ id: c.id, label: `${c.code} — ${c.title}` }));

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader><CardTitle className="text-base">Add a timetable slot</CardTitle></CardHeader>
        <CardContent>
          <SessionForm courses={courseOptions} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Weekly timetable</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Course</TableHead>
                <TableHead>Day</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Venue</TableHead>
                <TableHead>Semester</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sessions.map((s) => (
                <TableRow key={s.id}>
                  <TableCell>{s.code} — {s.title}</TableCell>
                  <TableCell>{dayLabel(s.dayOfWeek)}</TableCell>
                  <TableCell>{s.startTime}–{s.endTime}</TableCell>
                  <TableCell>{s.venue ?? "—"}</TableCell>
                  <TableCell>{s.semester}</TableCell>
                  <TableCell>
                    <form action={deleteClassSession.bind(null, s.id)}>
                      <Button type="submit" size="sm" variant="destructive">Remove</Button>
                    </form>
                  </TableCell>
                </TableRow>
              ))}
              {sessions.length === 0 && (
                <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground">No timetable slots yet</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
