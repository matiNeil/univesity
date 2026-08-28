"use client";

import { useActionState } from "react";
import Link from "next/link";
import { requestPasswordReset, type ForgotPasswordState } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState: ForgotPasswordState = {};

export function RequestForm() {
  const [state, formAction, pending] = useActionState(requestPasswordReset, initialState);

  if (state.message) {
    return (
      <div className="flex flex-col gap-4">
        <p className="text-sm text-muted-foreground">{state.message}</p>
        {state.resetLink && (
          <div className="rounded-lg border bg-muted/30 p-3 text-sm">
            <p className="mb-1 text-xs text-muted-foreground">
              Email sending isn&apos;t configured yet, so here&apos;s your link directly:
            </p>
            <Link href={state.resetLink} className="break-all text-primary underline underline-offset-2">
              {state.resetLink}
            </Link>
          </div>
        )}
        <Link href="/sign-in" className="text-center text-sm text-primary underline underline-offset-2">
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" required autoFocus />
      </div>
      {state?.error && <p className="text-sm text-destructive">{state.error}</p>}
      <Button type="submit" disabled={pending} className="mt-2">
        {pending ? "Sending…" : "Send reset link"}
      </Button>
      <Link href="/sign-in" className="text-center text-sm text-muted-foreground hover:underline">
        Back to sign in
      </Link>
    </form>
  );
}
