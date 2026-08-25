"use client";

import { useState, type KeyboardEvent } from "react";
import { Pencil, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface StringListEditDialogProps {
  title: string;
  items: string[];
  placeholder?: string;
  onSave: (items: string[]) => Promise<unknown>;
}

/** Generic editor for a section that's a bare string[] on the wire (public
 * links) - free-form values, unlike skills which look the same shape but are
 * actually a fixed enum (see SkillsEditDialog). */
export function StringListEditDialog({ title, items, placeholder, onSave }: StringListEditDialogProps) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<string[]>(items);
  const [inputValue, setInputValue] = useState("");
  const [saving, setSaving] = useState(false);

  function handleOpenChange(next: boolean) {
    if (next) {
      setDraft(items);
      setInputValue("");
    }
    setOpen(next);
  }

  function addItem() {
    const value = inputValue.trim();
    if (value && !draft.includes(value)) setDraft((prev) => [...prev, value]);
    setInputValue("");
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      addItem();
    }
  }

  async function handleSave() {
    setSaving(true);
    try {
      await onSave(draft);
      toast.success(`${title} updated`);
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
        <Button variant="ghost" size="icon" aria-label={`Edit ${title}`}>
          <Pencil className="size-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit {title}</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-3">
          {draft.length === 0 && <p className="text-sm text-muted-foreground">Nothing added yet.</p>}
          {draft.map((value, i) => (
            <div key={i} className="flex items-center gap-2">
              <Input value={value} readOnly className="flex-1" />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setDraft((prev) => prev.filter((_, idx) => idx !== i))}
                aria-label="Remove"
              >
                <X className="size-4 text-error" />
              </Button>
            </div>
          ))}
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={addItem}
            placeholder={placeholder ?? "Type a value and press Enter"}
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
