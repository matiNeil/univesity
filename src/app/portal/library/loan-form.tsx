"use client";

import { useActionState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { loanBook, type LibraryActionState } from "./actions";

const initialState: LibraryActionState = {};

export function LoanForm({
  books,
  students,
}: {
  books: { id: string; label: string }[];
  students: { userId: string; label: string }[];
}) {
  const [state, formAction, pending] = useActionState(loanBook, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) {
      toast.success("Book loaned out.");
      formRef.current?.reset();
    } else if (state.error) {
      toast.error(state.error);
    }
  }, [state]);

  const disabled = books.length === 0 || students.length === 0;

  return (
    <form ref={formRef} action={formAction} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="bookId">Book</Label>
        <Select name="bookId" required>
          <SelectTrigger id="bookId" className="w-full"><SelectValue placeholder="Select book" /></SelectTrigger>
          <SelectContent>
            {books.map((b) => (
              <SelectItem key={b.id} value={b.id}>{b.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="studentId">Borrower</Label>
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
        <Label htmlFor="dueAt">Due date</Label>
        <Input id="dueAt" name="dueAt" type="date" required />
      </div>
      <div className="flex items-end">
        <Button type="submit" disabled={pending || disabled} className="w-full">
          {pending ? "Saving..." : "Loan Book"}
        </Button>
      </div>
      {state.error && <p className="text-sm text-destructive lg:col-span-4">{state.error}</p>}
      {disabled && (
        <p className="text-xs text-muted-foreground lg:col-span-4">Need at least one book and one student on record to issue a loan.</p>
      )}
    </form>
  );
}
