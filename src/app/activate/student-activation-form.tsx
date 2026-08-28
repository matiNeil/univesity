"use client";

import { useActionState } from "react";
import { activateStudent, verifyStudent, type ActivateState, type VerifyState } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialVerifyState: VerifyState = {};
const initialActivateState: ActivateState = {};

export function StudentActivationForm() {
  const [verifyState, verifyAction, verifyPending] = useActionState(verifyStudent, initialVerifyState);
  const [activateState, activateAction, activatePending] = useActionState(activateStudent, initialActivateState);

  if (verifyState.token) {
    return (
      <form action={activateAction} className="flex flex-col gap-4">
        <input type="hidden" name="token" value={verifyState.token} />
        <p className="text-sm text-muted-foreground">
          Verified as <span className="font-medium text-foreground">{verifyState.name}</span>. Create your password
          to finish activating your account.
        </p>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="password">Password</Label>
          <Input id="password" name="password" type="password" required minLength={8} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="confirmPassword">Confirm password</Label>
          <Input id="confirmPassword" name="confirmPassword" type="password" required minLength={8} />
        </div>
        {activateState?.error && <p className="text-sm text-destructive">{activateState.error}</p>}
        <Button type="submit" disabled={activatePending} className="mt-2">
          {activatePending ? "Activating…" : "Activate account"}
        </Button>
      </form>
    );
  }

  return (
    <form action={verifyAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="registrationNumber">Registration number</Label>
        <Input id="registrationNumber" name="registrationNumber" required autoFocus />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="nationalId">National ID</Label>
        <Input id="nationalId" name="nationalId" required />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="universityEmail">University email</Label>
        <Input id="universityEmail" name="universityEmail" type="email" required />
      </div>
      {verifyState?.error && <p className="text-sm text-destructive">{verifyState.error}</p>}
      <Button type="submit" disabled={verifyPending} className="mt-2">
        {verifyPending ? "Verifying…" : "Verify identity"}
      </Button>
    </form>
  );
}
