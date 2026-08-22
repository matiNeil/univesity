import { getDb } from "@/db";
import { courses, departments, faculties, programs, students } from "@/db/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function FacultyPage() {
  const db = getDb();
  const [allFaculties, allDepartments, allPrograms, allCourses, allStudents] = await Promise.all([
    db.select().from(faculties),
    db.select().from(departments),
    db.select().from(programs),
    db.select().from(courses),
    db.select({ userId: students.userId, programId: students.programId }).from(students),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Faculties" value={allFaculties.length} />
        <StatCard label="Departments" value={allDepartments.length} />
        <StatCard label="Programs" value={allPrograms.length} />
        <StatCard label="Students" value={allStudents.length} />
      </div>

      {allFaculties.map((fac) => {
        const deptsInFaculty = allDepartments.filter((d) => d.facultyId === fac.id);
        return (
          <Card key={fac.id}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                {fac.name} <Badge variant="secondary">{fac.code}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {deptsInFaculty.map((dept) => {
                const deptPrograms = allPrograms.filter((p) => p.departmentId === dept.id);
                const deptCourses = allCourses.filter((c) => c.departmentId === dept.id);
                const deptStudents = allStudents.filter((s) =>
                  deptPrograms.some((p) => p.id === s.programId)
                );
                return (
                  <div key={dept.id} className="rounded-lg border p-4">
                    <p className="font-medium">{dept.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {deptPrograms.length} programs · {deptCourses.length} courses · {deptStudents.length} students
                    </p>
                  </div>
                );
              })}
              {deptsInFaculty.length === 0 && (
                <p className="text-sm text-muted-foreground">No departments yet</p>
              )}
            </CardContent>
          </Card>
        );
      })}
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
