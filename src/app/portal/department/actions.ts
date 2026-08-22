"use server";

import { getDb } from "@/db";
import { enrollments, lecturerCourses } from "@/db/schema";
import { newId } from "@/lib/id";
import { requirePortal } from "@/lib/require-portal";
import { revalidatePath } from "next/cache";

export type DepartmentActionState = { error?: string; success?: boolean };

export async function enrollStudent(
  _prevState: DepartmentActionState,
  formData: FormData
): Promise<DepartmentActionState> {
  await requirePortal("department");

  const studentId = formData.get("studentId") as string;
  const courseId = formData.get("courseId") as string;
  const semester = (formData.get("semester") as string)?.trim();

  if (!studentId || !courseId || !semester) {
    return { error: "Please select a student, course, and semester." };
  }

  const db = getDb();
  const [inserted] = await db
    .insert(enrollments)
    .values({ id: newId("enr"), studentId, courseId, semester })
    .onConflictDoNothing()
    .returning();

  if (!inserted) return { error: "That student is already enrolled in this course for this semester." };

  revalidatePath("/portal/department");
  return { success: true };
}

export async function assignLecturer(
  _prevState: DepartmentActionState,
  formData: FormData
): Promise<DepartmentActionState> {
  await requirePortal("department");

  const lecturerId = formData.get("lecturerId") as string;
  const courseId = formData.get("courseId") as string;
  const semester = (formData.get("semester") as string)?.trim();

  if (!lecturerId || !courseId || !semester) {
    return { error: "Please select a lecturer, course, and semester." };
  }

  const db = getDb();
  const [inserted] = await db
    .insert(lecturerCourses)
    .values({ id: newId("lc"), lecturerId, courseId, semester })
    .onConflictDoNothing()
    .returning();

  if (!inserted) return { error: "That lecturer is already assigned to this course for this semester." };

  revalidatePath("/portal/department");
  return { success: true };
}
