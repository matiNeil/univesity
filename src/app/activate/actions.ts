"use server";

import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { getDb } from "@/db";
import { lecturerRegistry, lecturers, students, studentRegistry, users } from "@/db/schema";
import { signActivationToken, verifyActivationToken } from "@/lib/activation-token";
import { hashPassword } from "@/lib/password";
import { createSession } from "@/lib/session";
import { newId } from "@/lib/id";
import { defaultPortalForRole } from "@/lib/roles";
import { isRateLimited, recordAttempt, RATE_LIMIT_MESSAGE } from "@/lib/rate-limit";

export type VerifyState = { error?: string; token?: string; name?: string };
export type ActivateState = { error?: string };

const VERIFY_ERROR =
  "We couldn't verify those details. Double-check your registration/staff number, national ID, and university email.";

export async function verifyStudent(_prevState: VerifyState, formData: FormData): Promise<VerifyState> {
  const registrationNumber = (formData.get("registrationNumber") as string)?.trim();
  const nationalId = (formData.get("nationalId") as string)?.trim();
  const universityEmail = (formData.get("universityEmail") as string)?.trim().toLowerCase();

  if (!registrationNumber || !nationalId || !universityEmail) {
    return { error: "Please fill in all fields." };
  }

  if (await isRateLimited(registrationNumber)) {
    return { error: RATE_LIMIT_MESSAGE };
  }

  const db = getDb();
  const [record] = await db
    .select()
    .from(studentRegistry)
    .where(eq(studentRegistry.registrationNumber, registrationNumber))
    .limit(1);

  if (
    !record ||
    record.nationalId !== nationalId ||
    record.universityEmail.toLowerCase() !== universityEmail
  ) {
    await recordAttempt(registrationNumber, false);
    return { error: VERIFY_ERROR };
  }

  if (record.activatedUserId) {
    return { error: "This account has already been activated. Try signing in instead." };
  }

  await recordAttempt(registrationNumber, true);
  const token = signActivationToken({ kind: "student", registryId: record.id });
  return { token, name: `${record.firstName} ${record.lastName}` };
}

export async function verifyLecturer(_prevState: VerifyState, formData: FormData): Promise<VerifyState> {
  const staffNumber = (formData.get("staffNumber") as string)?.trim();
  const nationalId = (formData.get("nationalId") as string)?.trim();
  const universityEmail = (formData.get("universityEmail") as string)?.trim().toLowerCase();

  if (!staffNumber || !nationalId || !universityEmail) {
    return { error: "Please fill in all fields." };
  }

  if (await isRateLimited(staffNumber)) {
    return { error: RATE_LIMIT_MESSAGE };
  }

  const db = getDb();
  const [record] = await db
    .select()
    .from(lecturerRegistry)
    .where(eq(lecturerRegistry.staffNumber, staffNumber))
    .limit(1);

  if (
    !record ||
    record.nationalId !== nationalId ||
    record.universityEmail.toLowerCase() !== universityEmail
  ) {
    await recordAttempt(staffNumber, false);
    return { error: VERIFY_ERROR };
  }

  if (record.activatedUserId) {
    return { error: "This account has already been activated. Try signing in instead." };
  }

  await recordAttempt(staffNumber, true);
  const token = signActivationToken({ kind: "lecturer", registryId: record.id });
  return { token, name: `${record.firstName} ${record.lastName}` };
}

function validatePassword(password: string, confirmPassword: string): string | null {
  if (password.length < 8) return "Password must be at least 8 characters.";
  if (password !== confirmPassword) return "Passwords do not match.";
  return null;
}

export async function activateStudent(_prevState: ActivateState, formData: FormData): Promise<ActivateState> {
  const token = formData.get("token") as string;
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  const payload = token ? verifyActivationToken(token) : null;
  if (!payload || payload.kind !== "student") {
    return { error: "Your verification expired. Please verify your details again." };
  }

  const passwordError = validatePassword(password ?? "", confirmPassword ?? "");
  if (passwordError) return { error: passwordError };

  const db = getDb();
  const [record] = await db
    .select()
    .from(studentRegistry)
    .where(eq(studentRegistry.id, payload.registryId))
    .limit(1);

  if (!record) return { error: "We couldn't find your record. Please verify your details again." };
  if (record.activatedUserId) {
    return { error: "This account has already been activated. Try signing in instead." };
  }

  const passwordHash = await hashPassword(password);
  const userId = newId("usr");

  await db.insert(users).values({
    id: userId,
    email: record.universityEmail.toLowerCase(),
    passwordHash,
    firstName: record.firstName,
    lastName: record.lastName,
    role: "student",
  });

  await db.insert(students).values({
    userId,
    studentNumber: record.registrationNumber,
    programId: record.programId,
    yearOfStudy: record.yearOfStudy,
  });

  await db.update(studentRegistry).set({ activatedUserId: userId }).where(eq(studentRegistry.id, record.id));

  await createSession(userId);
  redirect(defaultPortalForRole("student"));
}

export async function activateLecturer(_prevState: ActivateState, formData: FormData): Promise<ActivateState> {
  const token = formData.get("token") as string;
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  const payload = token ? verifyActivationToken(token) : null;
  if (!payload || payload.kind !== "lecturer") {
    return { error: "Your verification expired. Please verify your details again." };
  }

  const passwordError = validatePassword(password ?? "", confirmPassword ?? "");
  if (passwordError) return { error: passwordError };

  const db = getDb();
  const [record] = await db
    .select()
    .from(lecturerRegistry)
    .where(eq(lecturerRegistry.id, payload.registryId))
    .limit(1);

  if (!record) return { error: "We couldn't find your record. Please verify your details again." };
  if (record.activatedUserId) {
    return { error: "This account has already been activated. Try signing in instead." };
  }

  const passwordHash = await hashPassword(password);
  const userId = newId("usr");

  await db.insert(users).values({
    id: userId,
    email: record.universityEmail.toLowerCase(),
    passwordHash,
    firstName: record.firstName,
    lastName: record.lastName,
    role: "lecturer",
  });

  await db.insert(lecturers).values({
    userId,
    staffNumber: record.staffNumber,
    departmentId: record.departmentId,
    title: record.title,
  });

  await db.update(lecturerRegistry).set({ activatedUserId: userId }).where(eq(lecturerRegistry.id, record.id));

  await createSession(userId);
  redirect(defaultPortalForRole("lecturer"));
}
