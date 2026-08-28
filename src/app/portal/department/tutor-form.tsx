"use client";

import { useActionState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { assignTutor, type DepartmentActionState } from "./actions";

const initialState: DepartmentActionState = {};

export function TutorForm({
  students,
  lecturers,
}: {
  students: { userId: string; label: string }[];
  lecturers: { userId: string; label: string }[];
}) {
  const [state, formAction, pending] = useActionState(assignTutor, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) {
      toast.success("Tutor assigned.");
      formRef.current?.reset();
    } else if (state.error) {
      toast.error(state.error);
    }
  }, [state]);

  const disabled = students.length === 0 || lecturers.length === 0;

  return (
    <form ref={formRef} action={formAction} className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="tutorStudentId">Student</Label>
        <Select name="studentId" required>
          <SelectTrigger id="tutorStudentId" className="w-full"><SelectValue placeholder="Select student" /></SelectTrigger>
          <SelectContent>
            {students.map((s) => (
              <SelectItem key={s.userId} value={s.userId}>{s.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="tutorLecturerId">Tutor</Label>
        <Select name="lecturerId" required>
          <SelectTrigger id="tutorLecturerId" className="w-full"><SelectValue placeholder="Select lecturer" /></SelectTrigger>
          <SelectContent>
            {lecturers.map((l) => (
              <SelectItem key={l.userId} value={l.userId}>{l.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-end">
        <Button type="submit" disabled={pending || disabled} className="w-full">
          {pending ? "Saving..." : "Assign tutor"}
        </Button>
      </div>
      {state.error && <p className="text-sm text-destructive sm:col-span-3">{state.error}</p>}
    </form>
  );
}
