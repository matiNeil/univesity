"use server";

import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { getDb } from "@/db";
import { lecturers, students, users } from "@/db/schema";
import { createSession } from "@/lib/session";
import { verifyPassword } from "@/lib/password";
import { defaultPortalForRole } from "@/lib/roles";

export type LoginState = { error?: string };

const GENERIC_ERROR = "Incorrect registration/staff number, email, or password.";

async function findUserByIdentifier(db: ReturnType<typeof getDb>, identifier: string) {
  const [byStudent] = await db
    .select({ user: users })
    .from(students)
    .innerJoin(users, eq(students.userId, users.id))
    .where(eq(students.studentNumber, identifier))
    .limit(1);
  if (byStudent) return byStudent.user;

  const [byLecturer] = await db
    .select({ user: users })
    .from(lecturers)
    .innerJoin(users, eq(lecturers.userId, users.id))
    .where(eq(lecturers.staffNumber, identifier))
    .limit(1);
  if (byLecturer) return byLecturer.user;

  const [byEmail] = await db
    .select()
    .from(users)
    .where(eq(users.email, identifier.toLowerCase()))
    .limit(1);
  return byEmail ?? null;
}

export async function login(_prevState: LoginState, formData: FormData): Promise<LoginState> {
  const identifier = (formData.get("identifier") as string)?.trim();
  const password = formData.get("password") as string;

  if (!identifier || !password) {
    return { error: "Please fill in both fields." };
  }

  const db = getDb();
  const user = await findUserByIdentifier(db, identifier);
  if (!user) return { error: GENERIC_ERROR };

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) return { error: GENERIC_ERROR };

  await createSession(user.id);
  redirect(defaultPortalForRole(user.role));
}
