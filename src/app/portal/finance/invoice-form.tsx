"use client";

import { useActionState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createInvoice, type FinanceActionState } from "./actions";

const initialState: FinanceActionState = {};

export function InvoiceForm({ students }: { students: { userId: string; label: string }[] }) {
  const [state, formAction, pending] = useActionState(createInvoice, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) {
      toast.success("Invoice created.");
      formRef.current?.reset();
    } else if (state.error) {
      toast.error(state.error);
    }
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="studentId">Student</Label>
        <Select name="studentId" required>
          <SelectTrigger id="studentId" className="w-full"><SelectValue placeholder="Select student" /></SelectTrigger>
          <SelectContent>
            {students.map((s) => (
              <SelectItem key={s.userId} value={s.userId}>{s.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="description">Description</Label>
        <Input id="description" name="description" placeholder="Tuition, hostel fee..." required />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="amount">Amount</Label>
        <Input id="amount" name="amount" type="number" step="0.01" min="0.01" required />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="dueDate">Due date</Label>
        <Input id="dueDate" name="dueDate" type="date" required />
      </div>
      {state.error && <p className="text-sm text-destructive lg:col-span-4">{state.error}</p>}
      <div className="lg:col-span-4">
        <Button type="submit" disabled={pending || students.length === 0}>
          {pending ? "Creating..." : "Create Invoice"}
        </Button>
        {students.length === 0 && (
          <p className="mt-1 text-xs text-muted-foreground">No students yet — invoices need a student on record.</p>
        )}
      </div>
    </form>
  );
}
