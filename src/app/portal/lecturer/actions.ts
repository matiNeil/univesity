"use server";

import { getDb } from "@/db";
import { attendanceRecords, enrollments, lecturerCourses } from "@/db/schema";
import { newId } from "@/lib/id";
import { requirePortal } from "@/lib/require-portal";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

const VALID_GRADES = ["A", "B", "C", "D", "F", "I", "W"];
const VALID_ATTENDANCE_STATUSES = ["present", "absent", "late"] as const;

export async function setGrade(formData: FormData) {
  const appUser = await requirePortal("lecturer");
  const userId = appUser.id;

  const enrollmentId = formData.get("enrollmentId") as string;
  const courseId = formData.get("courseId") as string;
  const grade = formData.get("grade") as string;

  if (!enrollmentId || !courseId || !VALID_GRADES.includes(grade)) return;

  const db = getDb();

  const [assignment] = await db
    .select()
    .from(lecturerCourses)
    .where(and(eq(lecturerCourses.lecturerId, userId), eq(lecturerCourses.courseId, courseId)))
    .limit(1);
  if (!assignment) return;

  const [enrollment] = await db.select().from(enrollments).where(eq(enrollments.id, enrollmentId)).limit(1);
  if (!enrollment || enrollment.courseId !== courseId) return;

  await db.update(enrollments).set({ grade }).where(eq(enrollments.id, enrollmentId));

  revalidatePath(`/portal/lecturer/${courseId}`);
}

export async function markAttendance(formData: FormData) {
  const appUser = await requirePortal("lecturer");
  const userId = appUser.id;

  const enrollmentId = formData.get("enrollmentId") as string;
  const courseId = formData.get("courseId") as string;
  const date = formData.get("date") as string;
  const status = formData.get("status") as string;

  if (
    !enrollmentId ||
    !courseId ||
    !date ||
    !VALID_ATTENDANCE_STATUSES.includes(status as (typeof VALID_ATTENDANCE_STATUSES)[number])
  ) {
    return;
  }

  const db = getDb();

  const [assignment] = await db
    .select()
    .from(lecturerCourses)
    .where(and(eq(lecturerCourses.lecturerId, userId), eq(lecturerCourses.courseId, courseId)))
    .limit(1);
  if (!assignment) return;

  const [enrollment] = await db.select().from(enrollments).where(eq(enrollments.id, enrollmentId)).limit(1);
  if (!enrollment || enrollment.courseId !== courseId) return;

  await db
    .insert(attendanceRecords)
    .values({
      id: newId("att"),
      enrollmentId,
      date,
      status: status as (typeof VALID_ATTENDANCE_STATUSES)[number],
    })
    .onConflictDoUpdate({
      target: [attendanceRecords.enrollmentId, attendanceRecords.date],
      set: { status: status as (typeof VALID_ATTENDANCE_STATUSES)[number], markedAt: new Date() },
    });

  revalidatePath(`/portal/lecturer/${courseId}`);
}
