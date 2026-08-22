"use client";

import { useActionState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { allocateRoom, type AccommodationActionState } from "./actions";

const initialState: AccommodationActionState = {};

export function AllocateForm({
  rooms,
  students,
}: {
  rooms: { id: string; label: string }[];
  students: { userId: string; label: string }[];
}) {
  const [state, formAction, pending] = useActionState(allocateRoom, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) {
      toast.success("Room allocated.");
      formRef.current?.reset();
    } else if (state.error) {
      toast.error(state.error);
    }
  }, [state]);

  const disabled = rooms.length === 0 || students.length === 0;

  return (
    <form ref={formRef} action={formAction} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="roomId">Room</Label>
        <Select name="roomId" required>
          <SelectTrigger id="roomId" className="w-full"><SelectValue placeholder="Select room" /></SelectTrigger>
          <SelectContent>
            {rooms.map((r) => (
              <SelectItem key={r.id} value={r.id}>{r.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
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
        <Label htmlFor="startDate">Start date</Label>
        <Input id="startDate" name="startDate" type="date" required />
      </div>
      <div className="flex items-end">
        <Button type="submit" disabled={pending || disabled} className="w-full">
          {pending ? "Saving..." : "Allocate Room"}
        </Button>
      </div>
      {state.error && <p className="text-sm text-destructive lg:col-span-4">{state.error}</p>}
      {disabled && (
        <p className="text-xs text-muted-foreground lg:col-span-4">Need at least one room and one student on record to allocate.</p>
      )}
    </form>
  );
}
