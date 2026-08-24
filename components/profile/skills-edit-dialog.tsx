"use client";

import { useState, type KeyboardEvent } from "react";
import { Pencil, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface SkillsEditDialogProps {
  skills: string[];
  onSave: (skills: string[]) => Promise<unknown>;
}

/** Skills are a plain string[] on the wire (EntrepreneurDto.UpdateSkillsDto),
 * not a list of objects - a simple tag input, not the generic
 * EditableListDialog used for education/references/memberships/awards. */
export function SkillsEditDialog({ skills, onSave }: SkillsEditDialogProps) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<string[]>(skills);
  const [inputValue, setInputValue] = useState("");
  const [saving, setSaving] = useState(false);

  function handleOpenChange(next: boolean) {
    if (next) {
      setDraft(skills);
      setInputValue("");
    }
    setOpen(next);
  }

  function addSkill() {
    const value = inputValue.trim();
    if (value && !draft.includes(value)) {
      setDraft((prev) => [...prev, value]);
    }
    setInputValue("");
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addSkill();
    }
  }

  async function handleSave() {
    setSaving(true);
    try {
      await onSave(draft);
      toast.success("Skills updated");
      setOpen(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't save changes");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Edit skills">
          <Pencil className="size-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit skills</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap gap-2">
            {draft.length === 0 && <p className="text-sm text-muted-foreground">No skills added yet.</p>}
            {draft.map((skill) => (
              <Badge key={skill} variant="outline" className="gap-1 pr-1.5">
                {skill}
                <button
                  type="button"
                  onClick={() => setDraft((prev) => prev.filter((s) => s !== skill))}
                  aria-label={`Remove ${skill}`}
                  className="rounded-full p-0.5 hover:bg-muted"
                >
                  <X className="size-3" />
                </button>
              </Badge>
            ))}
          </div>
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={addSkill}
            placeholder="Type a skill and press Enter"
          />
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saving…" : "Save changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
