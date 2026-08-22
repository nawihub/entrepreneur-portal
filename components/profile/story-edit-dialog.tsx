"use client";

import { useState } from "react";
import { Pencil } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { StoryPayload } from "@/lib/api/entrepreneurs";
import type { EntrepreneurStory } from "@/lib/api/types";

export function StoryEditDialog({
  story,
  onSave,
}: {
  story: EntrepreneurStory | null | undefined;
  onSave: (payload: StoryPayload) => Promise<unknown>;
}) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [aboutMe, setAboutMe] = useState(story?.aboutMe ?? "");
  const [yearStarted, setYearStarted] = useState(story?.yearStarted?.toString() ?? "");
  const [successStory, setSuccessStory] = useState(story?.successStory ?? "");

  function handleOpenChange(next: boolean) {
    if (next) {
      setAboutMe(story?.aboutMe ?? "");
      setYearStarted(story?.yearStarted?.toString() ?? "");
      setSuccessStory(story?.successStory ?? "");
    }
    setOpen(next);
  }

  async function handleSave() {
    setSaving(true);
    try {
      await onSave({
        aboutMe: aboutMe || undefined,
        yearStarted: yearStarted ? Number(yearStarted) : undefined,
        successStory: successStory || undefined,
      });
      toast.success("Story updated");
      setOpen(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't save your story");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Edit story">
          <Pencil className="size-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Your story</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div className="space-y-1.5">
            <Label>About me</Label>
            <Textarea value={aboutMe} onChange={(e) => setAboutMe(e.target.value)} rows={4} />
          </div>
          <div className="space-y-1.5">
            <Label>Year started</Label>
            <Input
              type="number"
              value={yearStarted}
              onChange={(e) => setYearStarted(e.target.value)}
              placeholder="e.g. 2022"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Success story</Label>
            <Textarea value={successStory} onChange={(e) => setSuccessStory(e.target.value)} rows={4} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saving…" : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
