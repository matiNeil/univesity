import "server-only";
import { cache } from "react";
import { currentUser } from "@clerk/nextjs/server";
import { getDb } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import type { Role } from "@/lib/roles";

export const getAppUser = cache(async function getAppUser() {
  const clerkUser = await currentUser();
  if (!clerkUser) return null;

  const db = getDb();
  const role = (clerkUser.publicMetadata as { role?: Role } | null)?.role ?? null;
  const email = clerkUser.emailAddresses[0]?.emailAddress ?? "";

  const [existing] = await db.select().from(users).where(eq(users.id, clerkUser.id)).limit(1);

  if (!existing) {
    await db.insert(users).values({
      id: clerkUser.id,
      email,
      firstName: clerkUser.firstName,
      lastName: clerkUser.lastName,
      role,
    });
  } else if (existing.role !== role) {
    await db.update(users).set({ role }).where(eq(users.id, clerkUser.id));
  }

  return {
    id: clerkUser.id,
    email,
    firstName: clerkUser.firstName,
    lastName: clerkUser.lastName,
    role,
  };
});
