"use server";

import { getDb } from "@/db";
import { roomAllocations, rooms } from "@/db/schema";
import { newId } from "@/lib/id";
import { requirePortal } from "@/lib/require-portal";
import { and, count, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export type AccommodationActionState = { error?: string; success?: boolean };

export async function allocateRoom(
  _prevState: AccommodationActionState,
  formData: FormData
): Promise<AccommodationActionState> {
  await requirePortal("accommodation");

  const roomId = formData.get("roomId") as string;
  const studentId = formData.get("studentId") as string;
  const startDate = formData.get("startDate") as string;

  if (!roomId || !studentId || !startDate) {
    return { error: "Please select a room, student, and start date." };
  }

  const db = getDb();

  const [room] = await db.select().from(rooms).where(eq(rooms.id, roomId)).limit(1);
  if (!room) return { error: "Room not found." };

  const [{ value: occupied }] = await db
    .select({ value: count() })
    .from(roomAllocations)
    .where(and(eq(roomAllocations.roomId, roomId), eq(roomAllocations.status, "active")));
  if (occupied >= room.capacity) return { error: "This room is already at full capacity." };

  const [{ value: existingActive }] = await db
    .select({ value: count() })
    .from(roomAllocations)
    .where(and(eq(roomAllocations.studentId, studentId), eq(roomAllocations.status, "active")));
  if (existingActive > 0) return { error: "This student already has an active room allocation." };

  await db.insert(roomAllocations).values({
    id: newId("alloc"),
    studentId,
    roomId,
    startDate: new Date(startDate),
  });

  revalidatePath("/portal/accommodation");
  return { success: true };
}

export async function checkOutAllocation(formData: FormData) {
  await requirePortal("accommodation");

  const allocationId = formData.get("allocationId") as string;
  const db = getDb();

  await db
    .update(roomAllocations)
    .set({ status: "checked_out", endDate: new Date() })
    .where(eq(roomAllocations.id, allocationId));

  revalidatePath("/portal/accommodation");
}
