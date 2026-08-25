"use client";

import { useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export interface FieldConfig<T> {
  key: keyof T & string;
  label: string;
  type?: "text" | "number" | "select";
  placeholder?: string;
  /** Required when type is "select" - the fixed set of backend enum values. */
  options?: Array<{ value: string; label: string }>;
}

interface EditableListDialogProps<T extends object> {
  title: string;
  description?: string;
  items: T[];
  fields: FieldConfig<T>[];
  emptyItem: T;
  onSave: (items: T[]) => Promise<unknown>;
}

/**
 * One dialog implementation reused for every "PUT the whole array back"
 * section the entrepreneur profile exposes (skills / education /
 * references / memberships / awards / public links) - they're all
 * structurally the same (a small list of flat objects, replaced wholesale
 * on save), so this is the single generic editor rather than six
 * near-duplicate forms.
 *
 * `T` is bounded by `object` rather than `Record<string, unknown>` on
 * purpose: the real entry types (SkillEntry, EducationEntry, ...) have
 * specific required fields with no index signature, so a
 * Record<string, unknown> bound would reject them structurally. Field
 * reads/writes below go through a narrow `Record<string, unknown>` cast at
 * the one point that needs it instead.
 */
export function EditableListDialog<T extends object>({
  title,
  description,
  items,
  fields,
  emptyItem,
  onSave,
}: EditableListDialogProps<T>) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<T[]>(items);
  const [saving, setSaving] = useState(false);

  function handleOpenChange(next: boolean) {
    if (next) setDraft(items);
    setOpen(next);
  }

  function updateField(index: number, field: FieldConfig<T>, value: string) {
    setDraft((prev) => {
      const copy = [...prev];
      const parsedValue: unknown =
        field.type === "number" ? (value === "" ? undefined : Number(value)) : value;
      const updated: Record<string, unknown> = { ...copy[index], [field.key]: parsedValue };
      copy[index] = updated as T;
      return copy;
    });
  }

  function addRow() {
    setDraft((prev) => [...prev, { ...emptyItem }]);
  }

  function removeRow(index: number) {
    setDraft((prev) => prev.filter((_, i) => i !== index));
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
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Edit {title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>

        <div className="flex flex-col gap-4">
          {draft.length === 0 && (
            <p className="text-sm text-muted-foreground">Nothing added yet - use &quot;Add&quot; below.</p>
          )}
          {draft.map((item, index) => (
            <div key={index} className="flex items-start gap-2 rounded-lg border border-border p-3">
              <div className="grid flex-1 grid-cols-2 gap-2.5">
                {fields.map((field) => (
                  <div key={field.key} className={fields.length === 1 ? "col-span-2" : undefined}>
                    <Label className="mb-1 block text-xs text-muted-foreground">{field.label}</Label>
                    {field.type === "select" ? (
                      <Select
                        value={((item as Record<string, unknown>)[field.key] as string | undefined) ?? ""}
                        onValueChange={(value) => updateField(index, field, value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={field.placeholder ?? "Select…"} />
                        </SelectTrigger>
                        <SelectContent>
                          {field.options?.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input
                        type={field.type === "number" ? "number" : "text"}
                        placeholder={field.placeholder}
                        value={((item as Record<string, unknown>)[field.key] as string | number | undefined) ?? ""}
                        onChange={(e) => updateField(index, field, e.target.value)}
                      />
                    )}
                  </div>
                ))}
              </div>
              <Button variant="ghost" size="icon" onClick={() => removeRow(index)} aria-label="Remove">
                <Trash2 className="size-4 text-error" />
              </Button>
            </div>
          ))}

          <Button type="button" variant="outline" onClick={addRow} className="w-fit">
            <Plus className="size-4" /> Add
          </Button>
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
