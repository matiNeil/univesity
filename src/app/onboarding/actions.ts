"use server";

import { auth, clerkClient } from "@clerk/nextjs/server";
import { getDb } from "@/db";
import { departments, lecturers, programs, students, users } from "@/db/schema";
import { defaultPortalForRole, ROLES, type Role } from "@/lib/roles";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";

export async function setRole(formData: FormData) {
  const { userId } = await auth();
  if (!userId) throw new Error("Not authenticated");

  const role = formData.get("role") as Role;
  if (!ROLES.includes(role)) throw new Error("Invalid role");

  const client = await clerkClient();
  const clerkUser = await client.users.getUser(userId);

  await client.users.updateUserMetadata(userId, {
    publicMetadata: { role },
  });

  const db = getDb();
  const email = clerkUser.emailAddresses[0]?.emailAddress ?? "";

  await db
    .insert(users)
    .values({
      id: userId,
      email,
      firstName: clerkUser.firstName,
      lastName: clerkUser.lastName,
      role,
    })
    .onConflictDoUpdate({ target: users.id, set: { role, email } });

  if (role === "student") {
    const [existing] = await db.select().from(students).where(eq(students.userId, userId)).limit(1);
    if (!existing) {
      const [program] = await db.select().from(programs).limit(1);
      if (program) {
        await db.insert(students).values({
          userId,
          studentNumber: `S${Date.now().toString().slice(-8)}`,
          programId: program.id,
        });
      }
    }
  }

  if (role === "lecturer") {
    const [existing] = await db.select().from(lecturers).where(eq(lecturers.userId, userId)).limit(1);
    if (!existing) {
      const [department] = await db.select().from(departments).limit(1);
      if (department) {
        await db.insert(lecturers).values({
          userId,
          staffNumber: `L${Date.now().toString().slice(-8)}`,
          departmentId: department.id,
          title: "Lecturer",
        });
      }
    }
  }

  redirect(defaultPortalForRole(role));
}
