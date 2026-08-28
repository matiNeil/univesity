import { getDb } from "@/db";
import { announcements } from "@/db/schema";
import { desc } from "drizzle-orm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ROLE_LABELS, type Role } from "@/lib/roles";
import { AnnouncementForm } from "./announcement-form";
import { deleteAnnouncement } from "./actions";

export default async function AdminAnnouncementsPage() {
  const db = getDb();
  const all = await db.select().from(announcements).orderBy(desc(announcements.createdAt));

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader><CardTitle className="text-base">Post an announcement</CardTitle></CardHeader>
        <CardContent>
          <AnnouncementForm />
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">All announcements</CardTitle></CardHeader>
        <CardContent className="flex flex-col gap-4">
          {all.map((a) => (
            <div key={a.id} className="flex items-start justify-between gap-4 border-b pb-4 last:border-b-0 last:pb-0">
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-medium">{a.title}</p>
                  <Badge variant="secondary">{a.audience ? ROLE_LABELS[a.audience as Role] : "Everyone"}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">{a.body}</p>
                <p className="mt-1 text-xs text-muted-foreground">{a.createdAt.toLocaleString()}</p>
              </div>
              <form action={deleteAnnouncement.bind(null, a.id)}>
                <Button type="submit" size="sm" variant="destructive">Delete</Button>
              </form>
            </div>
          ))}
          {all.length === 0 && <p className="text-sm text-muted-foreground">No announcements yet</p>}
        </CardContent>
      </Card>
    </div>
  );
}
