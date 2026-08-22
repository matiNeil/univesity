import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PORTALS, ROLE_LABELS, ROLES, defaultPortalForRole, type Role } from "@/lib/roles";
import { setRole } from "./actions";

export default async function OnboardingPage() {
  const user = await currentUser();
  if (!user) redirect("/sign-in");

  const existingRole = (user.publicMetadata as { role?: Role } | null)?.role;
  if (existingRole) redirect(defaultPortalForRole(existingRole));

  return (
    <div className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center gap-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold">Welcome, {user.firstName ?? "there"}</h1>
        <p className="text-muted-foreground mt-1">
          Select the portal you should have access to. This picker is a demo stand-in — in
          production, role assignment is done by the registrar/HR, not self-service.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {ROLES.map((role) => {
          const portalSlug = Object.entries(PORTALS).find(([, p]) => p.roles.includes(role))?.[0];
          const portal = portalSlug ? PORTALS[portalSlug] : null;
          return (
            <form action={setRole} key={role}>
              <input type="hidden" name="role" value={role} />
              <Card className="h-full transition hover:border-foreground/30">
                <CardHeader>
                  <CardTitle className="text-base">{ROLE_LABELS[role]}</CardTitle>
                  <CardDescription>{portal?.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button type="submit" variant="secondary" className="w-full">
                    Continue as {ROLE_LABELS[role]}
                  </Button>
                </CardContent>
              </Card>
            </form>
          );
        })}
      </div>
    </div>
  );
}
