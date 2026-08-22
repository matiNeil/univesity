"use client";

import { useActionState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { enrollStudent, type DepartmentActionState } from "./actions";

const initialState: DepartmentActionState = {};

export function EnrollForm({
  students,
  courses,
}: {
  students: { userId: string; label: string }[];
  courses: { id: string; label: string }[];
}) {
  const [state, formAction, pending] = useActionState(enrollStudent, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) {
      toast.success("Student enrolled.");
      formRef.current?.reset();
    } else if (state.error) {
      toast.error(state.error);
    }
  }, [state]);

  const disabled = students.length === 0 || courses.length === 0;

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
          {pending ? "Saving..." : "Enroll Student"}
        </Button>
      </div>
      {state.error && <p className="text-sm text-destructive lg:col-span-4">{state.error}</p>}
    </form>
  );
}
