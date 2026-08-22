import { getDb } from "@/db";
import { courses, departments, faculties, lecturers, programs, students, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { EnrollForm } from "./enroll-form";
import { AssignForm } from "./assign-form";

export default async function DepartmentPage() {
  const db = getDb();

  const [depts, allCourses, allPrograms, allLecturers, allStudents] = await Promise.all([
    db.select({ id: departments.id, name: departments.name, code: departments.code, facultyName: faculties.name })
      .from(departments)
      .leftJoin(faculties, eq(departments.facultyId, faculties.id)),
    db.select({ id: courses.id, code: courses.code, title: courses.title, credits: courses.credits, deptId: courses.departmentId })
      .from(courses),
    db.select({ id: programs.id, name: programs.name, code: programs.code, degreeLevel: programs.degreeLevel, deptId: programs.departmentId })
      .from(programs),
    db.select({ userId: lecturers.userId, staffNumber: lecturers.staffNumber, title: lecturers.title, deptId: lecturers.departmentId, firstName: users.firstName, lastName: users.lastName })
      .from(lecturers)
      .leftJoin(users, eq(lecturers.userId, users.id)),
    db.select({ userId: students.userId, studentNumber: students.studentNumber, firstName: users.firstName, lastName: users.lastName })
      .from(students)
      .leftJoin(users, eq(students.userId, users.id)),
  ]);

  const courseOptions = allCourses.map((c) => ({ id: c.id, label: `${c.code} — ${c.title}` }));
  const lecturerOptions = allLecturers.map((l) => ({
    userId: l.userId,
    label: `${l.firstName ?? ""} ${l.lastName ?? ""} (${l.staffNumber})`.trim(),
  }));
  const studentOptions = allStudents.map((s) => ({
    userId: s.userId,
    label: `${s.firstName ?? ""} ${s.lastName ?? ""} (${s.studentNumber})`.trim(),
  }));

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Departments" value={depts.length} />
        <StatCard label="Programs" value={allPrograms.length} />
        <StatCard label="Courses" value={allCourses.length} />
        <StatCard label="Lecturers" value={allLecturers.length} />
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Enroll a student</CardTitle></CardHeader>
        <CardContent>
          <EnrollForm students={studentOptions} courses={courseOptions} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Assign a lecturer to a course</CardTitle></CardHeader>
        <CardContent>
          <AssignForm lecturers={lecturerOptions} courses={courseOptions} />
        </CardContent>
      </Card>

      {depts.map((dept) => (
        <Card key={dept.id}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              {dept.name} <Badge variant="secondary">{dept.code}</Badge>
            </CardTitle>
            <p className="text-xs text-muted-foreground">Faculty: {dept.facultyName}</p>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div>
              <h3 className="mb-2 text-sm font-medium">Programs</h3>
              <ul className="space-y-1 text-sm text-muted-foreground">
                {allPrograms.filter((p) => p.deptId === dept.id).map((p) => (
                  <li key={p.id}>{p.name} ({p.degreeLevel})</li>
                ))}
                {allPrograms.filter((p) => p.deptId === dept.id).length === 0 && <li>No programs yet</li>}
              </ul>
            </div>
            <div>
              <h3 className="mb-2 text-sm font-medium">Lecturers</h3>
              <ul className="space-y-1 text-sm text-muted-foreground">
                {allLecturers.filter((l) => l.deptId === dept.id).map((l) => (
                  <li key={l.userId}>{l.firstName} {l.lastName} — {l.title}</li>
                ))}
                {allLecturers.filter((l) => l.deptId === dept.id).length === 0 && <li>No lecturers yet</li>}
              </ul>
            </div>
            <div>
              <h3 className="mb-2 text-sm font-medium">Courses</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Credits</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allCourses.filter((c) => c.deptId === dept.id).map((c) => (
                    <TableRow key={c.id}>
                      <TableCell>{c.code}</TableCell>
                      <TableCell>{c.title}</TableCell>
                      <TableCell>{c.credits}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number | string }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-normal text-muted-foreground">{label}</CardTitle>
      </CardHeader>
      <CardContent className="text-2xl font-semibold">{value}</CardContent>
    </Card>
  );
}
