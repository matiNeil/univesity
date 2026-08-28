import { and, eq, gt } from "drizzle-orm";
import { getDb } from "@/db";
import { loginAttempts } from "@/db/schema";
import { newId } from "@/lib/id";

const WINDOW_MS = 15 * 60 * 1000;
const MAX_FAILURES = 5;

export const RATE_LIMIT_MESSAGE = "Too many failed attempts. Please try again in 15 minutes.";

export async function isRateLimited(identifier: string): Promise<boolean> {
  const db = getDb();
  const since = new Date(Date.now() - WINDOW_MS);
  const recentFailures = await db
    .select({ id: loginAttempts.id })
    .from(loginAttempts)
    .where(
      and(
        eq(loginAttempts.identifier, identifier.toLowerCase()),
        eq(loginAttempts.success, false),
        gt(loginAttempts.createdAt, since)
      )
    );
  return recentFailures.length >= MAX_FAILURES;
}

export async function recordAttempt(identifier: string, success: boolean) {
  const db = getDb();
  await db.insert(loginAttempts).values({ id: newId("att"), identifier: identifier.toLowerCase(), success });
}
