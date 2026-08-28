"use client";

import { useActionState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createAnnouncement, type AnnouncementActionState } from "./actions";
import { ROLES, ROLE_LABELS } from "@/lib/roles";

const initialState: AnnouncementActionState = {};

export function AnnouncementForm() {
  const [state, formAction, pending] = useActionState(createAnnouncement, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) {
      toast.success("Announcement posted.");
      formRef.current?.reset();
    } else if (state.error) {
      toast.error(state.error);
    }
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="title">Title</Label>
        <Input id="title" name="title" required />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="body">Message</Label>
        <textarea
          id="body"
          name="body"
          required
          rows={3}
          className="rounded-lg border border-input bg-transparent px-2.5 py-1.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="audience">Audience</Label>
        <Select name="audience" defaultValue="everyone">
          <SelectTrigger id="audience" className="w-full sm:w-64"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="everyone">Everyone</SelectItem>
            {ROLES.map((r) => (
              <SelectItem key={r} value={r}>{ROLE_LABELS[r]} only</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Button type="submit" disabled={pending} className="w-fit">
        {pending ? "Posting..." : "Post announcement"}
      </Button>
    </form>
  );
}
