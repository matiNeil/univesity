import { getAppUser } from "@/lib/session";
import { getDb } from "@/db";
import {
  clearances,
  graduationApplications,
  graduationCeremonies,
  graduationPasses,
  graduationVisitors,
} from "@/db/schema";
import { asc, eq } from "drizzle-orm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { newId } from "@/lib/id";
import { passQrDataUrl } from "@/lib/qr";
import { CLEARANCE_TYPES } from "@/lib/clearance";
import { VisitorForm } from "./visitor-form";

export default async function StudentGraduationPage() {
  const appUser = await getAppUser();
  const userId = appUser!.id;
  const db = getDb();

  const [ceremony] = await db.select().from(graduationCeremonies).orderBy(asc(graduationCeremonies.ceremonyDate)).limit(1);

  const studentClearances = await db.select().from(clearances).where(eq(clearances.studentId, userId!));
  const allCleared =
    CLEARANCE_TYPES.length > 0 &&
    CLEARANCE_TYPES.every((type) => studentClearances.find((c) => c.type === type)?.status === "cleared");

  if (!ceremony) {
    return <p className="text-muted-foreground">No graduation ceremony has been scheduled yet.</p>;
  }

  let [application] = await db
    .select()
    .from(graduationApplications)
    .where(eq(graduationApplications.studentId, userId!))
    .limit(1);

  if (!application) {
    const id = newId("gapp");
    await db
      .insert(graduationApplications)
      .values({ id, studentId: userId!, ceremonyId: ceremony.id })
      .onConflictDoNothing();
    [application] = await db.select().from(graduationApplications).where(eq(graduationApplications.id, id)).limit(1);
  }

  const visitors = application
    ? await db
        .select({
          id: graduationVisitors.id,
          fullName: graduationVisitors.fullName,
          relationship: graduationVisitors.relationship,
          seatSection: graduationVisitors.seatSection,
          seatRow: graduationVisitors.seatRow,
          seatNumber: graduationVisitors.seatNumber,
          passStatus: graduationPasses.status,
          token: graduationPasses.token,
        })
        .from(graduationVisitors)
        .leftJoin(graduationPasses, eq(graduationPasses.visitorId, graduationVisitors.id))
        .where(eq(graduationVisitors.graduationApplicationId, application.id))
    : [];

  const visitorsWithQr = await Promise.all(
    visitors.map(async (v) => ({ ...v, qr: v.token ? await passQrDataUrl(v.token) : null }))
  );

  const isApproved = application?.status === "approved";

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{ceremony.name} — {ceremony.year}</CardTitle>
          <p className="text-sm text-muted-foreground">{ceremony.venue} · {new Date(ceremony.ceremonyDate).toLocaleDateString()}</p>
        </CardHeader>
        <CardContent>
          {isApproved ? (
            <Badge>🟢 Cleared for graduation</Badge>
          ) : application?.status === "rejected" ? (
            <Badge variant="destructive">Graduation application rejected — contact the registrar</Badge>
          ) : (
            <Badge variant="secondary">🟡 Graduation application pending registrar approval</Badge>
          )}
        </CardContent>
      </Card>

      {!allCleared && (
        <Card>
          <CardHeader><CardTitle className="text-base">Outstanding clearance</CardTitle></CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {CLEARANCE_TYPES.map((type) => {
              const status = studentClearances.find((c) => c.type === type)?.status ?? "pending";
              return (
                <Badge key={type} variant={status === "cleared" ? "default" : "secondary"}>
                  {status === "cleared" ? "🟢" : "🟡"} {type}
                </Badge>
              );
            })}
          </CardContent>
        </Card>
      )}

      {isApproved && (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Register a graduation visitor</CardTitle>
              <p className="text-sm text-muted-foreground">
                Each visitor gets their own QR pass, sent as a digital pass here. They present the QR
                at the arena gate for scanning.
              </p>
            </CardHeader>
            <CardContent>
              <VisitorForm applicationId={application!.id} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Your visitors</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {visitorsWithQr.map((v) => (
                <div key={v.id} className="flex flex-col items-center gap-2 rounded-lg border p-4 text-center">
                  {v.qr && <img src={v.qr} alt={`QR pass for ${v.fullName}`} className="h-40 w-40" />}
                  <p className="font-medium">{v.fullName}</p>
                  <p className="text-xs text-muted-foreground">{v.relationship}</p>
                  <p className="text-xs text-muted-foreground">
                    Section {v.seatSection} · Row {v.seatRow} · Seat {v.seatNumber}
                  </p>
                  <Badge variant={v.passStatus === "used" ? "default" : v.passStatus === "revoked" ? "destructive" : "secondary"}>
                    {v.passStatus === "used" ? "✅ Checked in" : v.passStatus === "revoked" ? "Revoked" : "Not used"}
                  </Badge>
                  {v.qr && (
                    <a href={v.qr} download={`pass-${v.fullName.replace(/\s+/g, "-")}.png`} className="text-xs text-primary underline">
                      Download pass
                    </a>
                  )}
                </div>
              ))}
              {visitorsWithQr.length === 0 && (
                <p className="text-sm text-muted-foreground">No visitors registered yet</p>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
