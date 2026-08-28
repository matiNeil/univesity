import { NextResponse } from "next/server";
import { getAppUser } from "@/lib/session";
import { getDb } from "@/db";
import {
  graduationApplications,
  graduationCeremonies,
  graduationPasses,
  graduationVisitors,
  scanEvents,
  students,
  users,
} from "@/db/schema";
import { eq } from "drizzle-orm";
import { newId } from "@/lib/id";

export async function POST(req: Request) {
  const appUser = await getAppUser();
  if (!appUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = appUser.id;

  const role = appUser.role;
  if (role !== "graduation_staff" && role !== "registrar" && role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const token = body?.token as string | undefined;
  const stationName = (body?.stationName as string | undefined) ?? "Unknown station";
  if (!token) return NextResponse.json({ error: "Missing token" }, { status: 400 });

  const db = getDb();

  const [row] = await db
    .select({
      passId: graduationPasses.id,
      passStatus: graduationPasses.status,
      visitorName: graduationVisitors.fullName,
      relationship: graduationVisitors.relationship,
      seatSection: graduationVisitors.seatSection,
      seatRow: graduationVisitors.seatRow,
      seatNumber: graduationVisitors.seatNumber,
      graduateFirstName: users.firstName,
      graduateLastName: users.lastName,
      ceremonyName: graduationCeremonies.name,
    })
    .from(graduationPasses)
    .innerJoin(graduationVisitors, eq(graduationPasses.visitorId, graduationVisitors.id))
    .innerJoin(graduationApplications, eq(graduationVisitors.graduationApplicationId, graduationApplications.id))
    .innerJoin(students, eq(graduationApplications.studentId, students.userId))
    .innerJoin(users, eq(students.userId, users.id))
    .innerJoin(graduationCeremonies, eq(graduationApplications.ceremonyId, graduationCeremonies.id))
    .where(eq(graduationPasses.token, token))
    .limit(1);

  if (!row) {
    await db.insert(scanEvents).values({
      id: newId("scan"),
      passId: null,
      scannedByUserId: userId,
      result: "invalid",
      stationName,
    });
    return NextResponse.json({ valid: false, reason: "invalid" });
  }

  const payload = {
    visitor: { name: row.visitorName, relationship: row.relationship },
    graduate: { name: `${row.graduateFirstName ?? ""} ${row.graduateLastName ?? ""}`.trim() },
    ceremony: row.ceremonyName,
    seat: { section: row.seatSection, row: row.seatRow, number: row.seatNumber },
  };

  if (row.passStatus === "used") {
    await db.insert(scanEvents).values({
      id: newId("scan"),
      passId: row.passId,
      scannedByUserId: userId,
      result: "already_used",
      stationName,
    });
    return NextResponse.json({ valid: false, reason: "already_used", ...payload });
  }

  if (row.passStatus === "revoked") {
    await db.insert(scanEvents).values({
      id: newId("scan"),
      passId: row.passId,
      scannedByUserId: userId,
      result: "revoked",
      stationName,
    });
    return NextResponse.json({ valid: false, reason: "revoked", ...payload });
  }

  await db
    .update(graduationPasses)
    .set({ status: "used", usedAt: new Date(), scannedByUserId: userId })
    .where(eq(graduationPasses.id, row.passId));

  await db.insert(scanEvents).values({
    id: newId("scan"),
    passId: row.passId,
    scannedByUserId: userId,
    result: "valid",
    stationName,
  });

  return NextResponse.json({ valid: true, ...payload });
}
