import { desc, eq, isNull, or } from "drizzle-orm";
import { getDb } from "@/db";
import { announcements } from "@/db/schema";
import type { Role } from "@/lib/roles";

export async function getAnnouncementsForRole(role: Role) {
  const db = getDb();
  return db
    .select()
    .from(announcements)
    .where(or(isNull(announcements.audience), eq(announcements.audience, role)))
    .orderBy(desc(announcements.createdAt))
    .limit(5);
}
