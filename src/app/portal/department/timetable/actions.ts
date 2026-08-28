"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getDb } from "@/db";
import { classSessions } from "@/db/schema";
import { newId } from "@/lib/id";
import { requirePortal } from "@/lib/require-portal";

export type TimetableActionState = { error?: string; success?: boolean };

export async function addClassSession(
  _prevState: TimetableActionState,
  formData: FormData
): Promise<TimetableActionState> {
  await requirePortal("department");

  const courseId = formData.get("courseId") as string;
  const semester = (formData.get("semester") as string)?.trim();
  const dayOfWeek = Number(formData.get("dayOfWeek"));
  const startTime = formData.get("startTime") as string;
  const endTime = formData.get("endTime") as string;
  const venue = (formData.get("venue") as string)?.trim() || null;

  if (!courseId || !semester || Number.isNaN(dayOfWeek) || !startTime || !endTime) {
    return { error: "Please fill in course, semester, day, and start/end time." };
  }

  if (startTime >= endTime) {
    return { error: "Start time must be before end time." };
  }

  const db = getDb();
  await db.insert(classSessions).values({
    id: newId("cls"),
    courseId,
    semester,
    dayOfWeek,
    startTime,
    endTime,
    venue,
  });

  revalidatePath("/portal/department/timetable");
  return { success: true };
}

export async function deleteClassSession(id: string) {
  await requirePortal("department");
  const db = getDb();
  await db.delete(classSessions).where(eq(classSessions.id, id));
  revalidatePath("/portal/department/timetable");
}
