"use server";

import { randomBytes } from "node:crypto";
import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { passwordResetTokens, users } from "@/db/schema";

export type ForgotPasswordState = { message?: string; resetLink?: string; error?: string };

const RESET_TOKEN_TTL_MS = 30 * 60 * 1000;
const GENERIC_MESSAGE = "If that email is registered, a password reset link has been generated.";

export async function requestPasswordReset(
  _prevState: ForgotPasswordState,
  formData: FormData
): Promise<ForgotPasswordState> {
  const email = (formData.get("email") as string)?.trim().toLowerCase();
  if (!email) return { error: "Please enter your email address." };

  const db = getDb();
  const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);

  if (!user) {
    return { message: GENERIC_MESSAGE };
  }

  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + RESET_TOKEN_TTL_MS);
  await db.insert(passwordResetTokens).values({ id: token, userId: user.id, expiresAt });

  // Email delivery isn't wired up yet (Resend integration pending) — show
  // the link directly instead of sending it, so the flow still works.
  return { message: GENERIC_MESSAGE, resetLink: `/reset-password?token=${token}` };
}
