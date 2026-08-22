"use server";

import { getDb } from "@/db";
import { clearances, graduationApplications } from "@/db/schema";
import { newId } from "@/lib/id";
import type { ClearanceType } from "@/lib/clearance";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { requirePortal } from "@/lib/require-portal";

export async function toggleClearance(formData: FormData) {
  await requirePortal("registrar");

  const studentId = formData.get("studentId") as string;
  const type = formData.get("type") as ClearanceType;
  const nextStatus = formData.get("nextStatus") as "cleared" | "pending" | "blocked";

  const db = getDb();
  const [existing] = await db
    .select()
    .from(clearances)
    .where(and(eq(clearances.studentId, studentId), eq(clearances.type, type)))
    .limit(1);

  if (existing) {
    await db.update(clearances).set({ status: nextStatus, updatedAt: new Date() }).where(eq(clearances.id, existing.id));
  } else {
    await db.insert(clearances).values({ id: newId("clr"), studentId, type, status: nextStatus });
  }

  revalidatePath("/portal/registrar");
}

export async function setApplicationStatus(formData: FormData) {
  await requirePortal("registrar");

  const applicationId = formData.get("applicationId") as string;
  const status = formData.get("status") as "approved" | "rejected" | "pending";

  const db = getDb();
  await db.update(graduationApplications).set({ status }).where(eq(graduationApplications.id, applicationId));

  revalidatePath("/portal/registrar/graduation");
}
