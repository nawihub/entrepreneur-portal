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
import type { FundingInfo } from "@/lib/api/types";

export function FundingEditDialog({
  funding,
  onSave,
}: {
  funding: FundingInfo | null | undefined;
  onSave: (payload: FundingInfo) => Promise<unknown>;
}) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [needAmount, setNeedAmount] = useState(funding?.needAmount?.amount ?? "");
  const [currency, setCurrency] = useState(funding?.needAmount?.currency ?? "SLE");
  const [needNote, setNeedNote] = useState(funding?.needNote ?? "");

  function handleOpenChange(next: boolean) {
    if (next) {
      setNeedAmount(funding?.needAmount?.amount ?? "");
      setCurrency(funding?.needAmount?.currency ?? "SLE");
      setNeedNote(funding?.needNote ?? "");
    }
    setOpen(next);
  }

  async function handleSave() {
    setSaving(true);
    try {
      await onSave({
        ...funding,
        needAmount: needAmount ? { currency, amount: needAmount } : null,
        needNote: needNote || undefined,
      });
      toast.success("Funding ask updated");
      setOpen(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't save funding details");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Edit funding ask">
          <Pencil className="size-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Funding ask</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-3 gap-2.5">
            <div className="space-y-1.5">
              <Label>Currency</Label>
              <Input value={currency} onChange={(e) => setCurrency(e.target.value.toUpperCase())} maxLength={3} />
            </div>
            <div className="col-span-2 space-y-1.5">
              <Label>Amount needed</Label>
              <Input value={needAmount} onChange={(e) => setNeedAmount(e.target.value)} placeholder="0.00" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>What would this support?</Label>
            <Textarea value={needNote} onChange={(e) => setNeedNote(e.target.value)} rows={3} />
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
