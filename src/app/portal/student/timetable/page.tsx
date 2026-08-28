import { getDb } from "@/db";
import { getAppUser } from "@/lib/session";
import { classSessions, courses, enrollments } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DAYS_OF_WEEK } from "@/lib/timetable";

export default async function StudentTimetablePage() {
  const appUser = await getAppUser();
  const studentId = appUser!.id;
  const db = getDb();

  const rows = await db
    .select({
      id: classSessions.id,
      dayOfWeek: classSessions.dayOfWeek,
      startTime: classSessions.startTime,
      endTime: classSessions.endTime,
      venue: classSessions.venue,
      semester: classSessions.semester,
      code: courses.code,
      title: courses.title,
    })
    .from(enrollments)
    .innerJoin(
      classSessions,
      and(eq(classSessions.courseId, enrollments.courseId), eq(classSessions.semester, enrollments.semester))
    )
    .leftJoin(courses, eq(classSessions.courseId, courses.id))
    .where(eq(enrollments.studentId, studentId));

  return (
    <div className="flex flex-col gap-4">
      {DAYS_OF_WEEK.map((day) => {
        const daySessions = rows
          .filter((r) => r.dayOfWeek === day.value)
          .sort((a, b) => a.startTime.localeCompare(b.startTime));
        return (
          <Card key={day.value}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">{day.label}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              {daySessions.map((s) => (
                <div key={s.id} className="flex items-center justify-between rounded-lg border p-3 text-sm">
                  <div>
                    <p className="font-medium">{s.code} — {s.title}</p>
                    <p className="text-xs text-muted-foreground">{s.venue ?? "Venue TBC"} · {s.semester}</p>
                  </div>
                  <span className="text-muted-foreground">{s.startTime}–{s.endTime}</span>
                </div>
              ))}
              {daySessions.length === 0 && <p className="text-sm text-muted-foreground">No classes</p>}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
