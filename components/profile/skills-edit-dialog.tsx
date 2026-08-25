"use client";

import { useMemo, useState } from "react";
import { Pencil, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { SKILL_GROUPS, SKILLS, skillLabel } from "@/lib/data/skills";

interface SkillsEditDialogProps {
  skills: string[];
  onSave: (skills: string[]) => Promise<unknown>;
}

/**
 * Skills are a fixed backend enum (Skill in entrepreneurdata/skill.proto),
 * not free text - EntrepreneurDto.UpdateSkillsDto parses each string against
 * that exact set, so a hand-typed value 400s. A checkbox multi-select
 * (grouped, with a search filter over ~40 options) rather than a tag input.
 */
export function SkillsEditDialog({ skills, onSave }: SkillsEditDialogProps) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<string[]>(skills);
  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState(false);

  function handleOpenChange(next: boolean) {
    if (next) {
      setDraft(skills);
      setSearch("");
    }
    setOpen(next);
  }

  function toggleSkill(value: string) {
    setDraft((prev) => (prev.includes(value) ? prev.filter((s) => s !== value) : [...prev, value]));
  }

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return SKILLS;
    return SKILLS.filter((s) => s.label.toLowerCase().includes(query));
  }, [search]);

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
          <DialogDescription>Pick from NaWeHub&apos;s skill list - these show up in search and matching.</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3">
          {draft.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {draft.map((value) => (
                <Badge key={value} variant="outline" className="gap-1 pr-1.5">
                  {skillLabel(value)}
                  <button
                    type="button"
                    onClick={() => toggleSkill(value)}
                    aria-label={`Remove ${skillLabel(value)}`}
                    className="rounded-full p-0.5 hover:bg-muted"
                  >
                    <X className="size-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}

          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search skills…" />

          <div className="max-h-80 overflow-y-auto rounded-lg border border-border p-1">
            {SKILL_GROUPS.map((group) => {
              const groupSkills = filtered.filter((s) => s.group === group);
              if (groupSkills.length === 0) return null;
              return (
                <div key={group} className="mb-2 last:mb-0">
                  <p className="px-2 py-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{group}</p>
                  {groupSkills.map((skill) => (
                    <label
                      key={skill.value}
                      className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm hover:bg-muted"
                    >
                      <Checkbox checked={draft.includes(skill.value)} onCheckedChange={() => toggleSkill(skill.value)} />
                      {skill.label}
                    </label>
                  ))}
                </div>
              );
            })}
            {filtered.length === 0 && <p className="p-3 text-sm text-muted-foreground">No matching skills.</p>}
          </div>
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
