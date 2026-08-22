"use server";

import { auth } from "@clerk/nextjs/server";
import { getDb } from "@/db";
import { graduationApplications, graduationPasses, graduationVisitors } from "@/db/schema";
import { newId } from "@/lib/id";
import { newPassToken } from "@/lib/qr";
import { eq, count } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export type RegisterVisitorState = { error?: string; success?: boolean };

export async function registerVisitor(
  _prevState: RegisterVisitorState,
  formData: FormData
): Promise<RegisterVisitorState> {
  const { userId } = await auth();
  if (!userId) return { error: "Not authenticated" };

  const applicationId = formData.get("applicationId") as string;
  const fullName = (formData.get("fullName") as string)?.trim();
  const phone = (formData.get("phone") as string)?.trim();
  const idNumber = (formData.get("idNumber") as string)?.trim() || null;
  const relationship = (formData.get("relationship") as string)?.trim();

  if (!applicationId || !fullName || !phone || !relationship) {
    return { error: "Please fill in all required fields." };
  }

  const db = getDb();

  const [application] = await db
    .select()
    .from(graduationApplications)
    .where(eq(graduationApplications.id, applicationId))
    .limit(1);

  if (!application || application.studentId !== userId || application.status !== "approved") {
    return { error: "Your graduation application must be approved before registering visitors." };
  }

  const [{ value: existingCount }] = await db
    .select({ value: count() })
    .from(graduationVisitors)
    .where(eq(graduationVisitors.graduationApplicationId, applicationId));

  const seatSection = "A";
  const seatRow = String(Math.floor(existingCount / 10) + 1);
  const seatNumber = String((existingCount % 10) + 1);

  const visitorId = newId("vis");
  await db.insert(graduationVisitors).values({
    id: visitorId,
    graduationApplicationId: applicationId,
    fullName,
    phone,
    idNumber,
    relationship,
    seatSection,
    seatRow,
    seatNumber,
  });

  await db.insert(graduationPasses).values({
    id: newId("pass"),
    visitorId,
    token: newPassToken(),
  });

  revalidatePath("/portal/student/graduation");
  return { success: true };
}
