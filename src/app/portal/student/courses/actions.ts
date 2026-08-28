"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getDb } from "@/db";
import { courses, enrollments, programs, students } from "@/db/schema";
import { newId } from "@/lib/id";
import { requirePortal } from "@/lib/require-portal";

export type SelfEnrollState = { error?: string; success?: boolean };

export async function selfEnroll(
  _prevState: SelfEnrollState,
  formData: FormData
): Promise<SelfEnrollState> {
  const appUser = await requirePortal("student");

  const courseId = formData.get("courseId") as string;
  const semester = (formData.get("semester") as string)?.trim();

  if (!courseId || !semester) {
    return { error: "Please select a course and enter a semester." };
  }

  const db = getDb();

  const [student] = await db
    .select({ programId: students.programId })
    .from(students)
    .where(eq(students.userId, appUser.id))
    .limit(1);
  if (!student) return { error: "No student record found for your account." };

  const [program] = await db
    .select({ departmentId: programs.departmentId })
    .from(programs)
    .where(eq(programs.id, student.programId))
    .limit(1);
  if (!program) return { error: "Your program has no department on record." };

  const [course] = await db
    .select()
    .from(courses)
    .where(and(eq(courses.id, courseId), eq(courses.departmentId, program.departmentId)))
    .limit(1);
  if (!course) return { error: "That course isn't offered by your department." };

  const [inserted] = await db
    .insert(enrollments)
    .values({ id: newId("enr"), studentId: appUser.id, courseId, semester })
    .onConflictDoNothing()
    .returning();

  if (!inserted) return { error: "You're already enrolled in this course for this semester." };

  revalidatePath("/portal/student/courses");
  return { success: true };
}
