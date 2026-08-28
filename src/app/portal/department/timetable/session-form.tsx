"use client";

import { useActionState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { addClassSession, type TimetableActionState } from "./actions";
import { DAYS_OF_WEEK } from "@/lib/timetable";

const initialState: TimetableActionState = {};

export function SessionForm({ courses }: { courses: { id: string; label: string }[] }) {
  const [state, formAction, pending] = useActionState(addClassSession, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) {
      toast.success("Timetable slot added.");
      formRef.current?.reset();
    } else if (state.error) {
      toast.error(state.error);
    }
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-6">
      <div className="flex flex-col gap-1.5 lg:col-span-2">
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
        <Label htmlFor="dayOfWeek">Day</Label>
        <Select name="dayOfWeek" required>
          <SelectTrigger id="dayOfWeek" className="w-full"><SelectValue placeholder="Day" /></SelectTrigger>
          <SelectContent>
            {DAYS_OF_WEEK.map((d) => (
              <SelectItem key={d.value} value={String(d.value)}>{d.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="startTime">Start</Label>
        <Input id="startTime" name="startTime" type="time" required />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="endTime">End</Label>
        <Input id="endTime" name="endTime" type="time" required />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="venue">Venue</Label>
        <Input id="venue" name="venue" placeholder="Room A1" />
      </div>
      <div className="flex flex-col gap-1.5 lg:col-span-2">
        <Label htmlFor="semester">Semester</Label>
        <Input id="semester" name="semester" placeholder="2026-S1" required />
      </div>
      <div className="flex items-end">
        <Button type="submit" disabled={pending || courses.length === 0} className="w-full">
          {pending ? "Saving..." : "Add slot"}
        </Button>
      </div>
      {state.error && <p className="text-sm text-destructive lg:col-span-6">{state.error}</p>}
    </form>
  );
}
