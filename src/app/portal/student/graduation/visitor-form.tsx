"use client";

import { useActionState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { registerVisitor, type RegisterVisitorState } from "./actions";

const initialState: RegisterVisitorState = {};

export function VisitorForm({ applicationId }: { applicationId: string }) {
  const [state, formAction, pending] = useActionState(registerVisitor, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) {
      toast.success("QR pass generated for your visitor.");
      formRef.current?.reset();
    } else if (state.error) {
      toast.error(state.error);
    }
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <input type="hidden" name="applicationId" value={applicationId} />
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="fullName">Full name</Label>
        <Input id="fullName" name="fullName" required />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="phone">Phone number</Label>
        <Input id="phone" name="phone" required />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="idNumber">ID / passport number (optional)</Label>
        <Input id="idNumber" name="idNumber" />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="relationship">Relationship</Label>
        <Input id="relationship" name="relationship" placeholder="Parent, sibling, friend..." required />
      </div>
      {state.error && <p className="text-sm text-destructive sm:col-span-2">{state.error}</p>}
      <div className="sm:col-span-2">
        <Button type="submit" disabled={pending}>
          {pending ? "Generating..." : "Generate QR Pass"}
        </Button>
      </div>
    </form>
  );
}
