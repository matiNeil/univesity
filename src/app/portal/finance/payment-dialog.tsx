"use client";

import { useActionState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { recordPayment, type FinanceActionState } from "./actions";

const initialState: FinanceActionState = {};

export function PaymentDialog({ invoiceId, description }: { invoiceId: string; description: string }) {
  const [state, formAction, pending] = useActionState(recordPayment, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (state.success) {
      toast.success("Payment recorded.");
      formRef.current?.reset();
      closeRef.current?.click();
    } else if (state.error) {
      toast.error(state.error);
    }
  }, [state]);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="sm" variant="secondary">Record payment</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Record payment</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <form ref={formRef} action={formAction} className="flex flex-col gap-4">
          <input type="hidden" name="invoiceId" value={invoiceId} />
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="amount">Amount</Label>
            <Input id="amount" name="amount" type="number" step="0.01" min="0.01" required />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="method">Method</Label>
            <Input id="method" name="method" placeholder="Cash, card, bank transfer..." required />
          </div>
          {state.error && <p className="text-sm text-destructive">{state.error}</p>}
          <DialogFooter>
            <Button type="submit" disabled={pending}>{pending ? "Recording..." : "Record payment"}</Button>
          </DialogFooter>
        </form>
        <DialogClose ref={closeRef} className="hidden" aria-hidden />
      </DialogContent>
    </Dialog>
  );
}
