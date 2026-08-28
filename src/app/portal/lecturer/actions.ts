"use server";

import { getDb } from "@/db";
import { enrollments, lecturerCourses } from "@/db/schema";
import { requirePortal } from "@/lib/require-portal";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

const VALID_GRADES = ["A", "B", "C", "D", "F", "I", "W"];

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
