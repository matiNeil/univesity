"use client";

import { useActionState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { assignLecturer, type DepartmentActionState } from "./actions";

const initialState: DepartmentActionState = {};

export function AssignForm({
  lecturers,
  courses,
}: {
  lecturers: { userId: string; label: string }[];
  courses: { id: string; label: string }[];
}) {
  const [state, formAction, pending] = useActionState(assignLecturer, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) {
      toast.success("Lecturer assigned to course.");
      formRef.current?.reset();
    } else if (state.error) {
      toast.error(state.error);
    }
  }, [state]);

  const disabled = lecturers.length === 0 || courses.length === 0;

  return (
    <form ref={formRef} action={formAction} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="lecturerId">Lecturer</Label>
        <Select name="lecturerId" required>
          <SelectTrigger id="lecturerId" className="w-full"><SelectValue placeholder="Select lecturer" /></SelectTrigger>
          <SelectContent>
            {lecturers.map((l) => (
              <SelectItem key={l.userId} value={l.userId}>{l.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
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
        <Button type="submit" disabled={pending || disabled} className="w-full">
          {pending ? "Saving..." : "Assign Lecturer"}
        </Button>
      </div>
      {state.error && <p className="text-sm text-destructive lg:col-span-4">{state.error}</p>}
      {disabled && (
        <p className="text-xs text-muted-foreground lg:col-span-4">Need at least one lecturer on record to assign courses.</p>
      )}
    </form>
  );
}
