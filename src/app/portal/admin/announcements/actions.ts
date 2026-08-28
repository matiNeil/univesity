"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getDb } from "@/db";
import { announcements } from "@/db/schema";
import { newId } from "@/lib/id";
import { requirePortal } from "@/lib/require-portal";
import { ROLES, type Role } from "@/lib/roles";

export type AnnouncementActionState = { error?: string; success?: boolean };

export async function createAnnouncement(
  _prevState: AnnouncementActionState,
  formData: FormData
): Promise<AnnouncementActionState> {
  await requirePortal("admin");

  const title = (formData.get("title") as string)?.trim();
  const body = (formData.get("body") as string)?.trim();
  const audienceRaw = formData.get("audience") as string;
  const audience = ROLES.includes(audienceRaw as Role) ? (audienceRaw as Role) : null;

  if (!title || !body) {
    return { error: "Please fill in a title and body." };
  }

  const db = getDb();
  await db.insert(announcements).values({ id: newId("ann"), title, body, audience });

  revalidatePath("/portal", "layout");
  return { success: true };
}

export async function deleteAnnouncement(id: string) {
  await requirePortal("admin");
  const db = getDb();
  await db.delete(announcements).where(eq(announcements.id, id));
  revalidatePath("/portal", "layout");
}
