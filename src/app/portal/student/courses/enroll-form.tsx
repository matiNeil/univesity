"use client";

import { useActionState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { selfEnroll, type SelfEnrollState } from "./actions";

const initialState: SelfEnrollState = {};

export function EnrollForm({ courses }: { courses: { id: string; label: string }[] }) {
  const [state, formAction, pending] = useActionState(selfEnroll, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) {
      toast.success("Enrolled.");
      formRef.current?.reset();
    } else if (state.error) {
      toast.error(state.error);
    }
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="courseId">Course</Label>
        <Select name="courseId" required>
          <SelectTrigger id="courseId" className="w-full"><SelectValue placeholder="Select course" /></SelectTrigger>
          <SelectContent>
            {courses.map((c) => (
              <SelectItem key={c.id} value={c.id}>{c.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="semester">Semester</Label>
        <Input id="semester" name="semester" placeholder="2026-S1" required />
      </div>
      <div className="flex items-end">
        <Button type="submit" disabled={pending || courses.length === 0} className="w-full">
          {pending ? "Enrolling..." : "Enroll"}
        </Button>
      </div>
      {state.error && <p className="text-sm text-destructive sm:col-span-3">{state.error}</p>}
    </form>
  );
}
