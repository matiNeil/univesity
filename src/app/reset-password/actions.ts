"use server";

import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { getDb } from "@/db";
import { passwordResetTokens, sessions, users } from "@/db/schema";
import { hashPassword } from "@/lib/password";
import { createSession } from "@/lib/session";
import { defaultPortalForRole } from "@/lib/roles";

export type ResetPasswordState = { error?: string };

export async function resetPassword(
  _prevState: ResetPasswordState,
  formData: FormData
): Promise<ResetPasswordState> {
  const token = formData.get("token") as string;
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!token) return { error: "Missing or invalid reset link." };
  if (!password || password.length < 8) return { error: "Password must be at least 8 characters." };
  if (password !== confirmPassword) return { error: "Passwords do not match." };

  const db = getDb();
  const [record] = await db
    .select()
    .from(passwordResetTokens)
    .where(eq(passwordResetTokens.id, token))
    .limit(1);

  if (!record || record.usedAt || record.expiresAt.getTime() < Date.now()) {
    return { error: "This reset link is invalid or has expired. Request a new one." };
  }

  const passwordHash = await hashPassword(password);
  await db.update(users).set({ passwordHash }).where(eq(users.id, record.userId));
  await db
    .update(passwordResetTokens)
    .set({ usedAt: new Date() })
    .where(eq(passwordResetTokens.id, record.id));
  await db.delete(sessions).where(eq(sessions.userId, record.userId));

  const [user] = await db.select().from(users).where(eq(users.id, record.userId)).limit(1);
  await createSession(record.userId);
  redirect(defaultPortalForRole(user!.role));
}
