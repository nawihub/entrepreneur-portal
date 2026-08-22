"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Check, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileDropzone } from "@/components/file-dropzone";
import { useRegisterBusiness } from "@/lib/queries/businesses";
import { cn } from "@/lib/utils";
import type { BusinessMeta } from "@/lib/api/types";

const STEPS = ["Business details", "Identity verification", "Review & submit"];

export default function NewBusinessPage() {
  const router = useRouter();
  const registerMutation = useRegisterBusiness();
  const [step, setStep] = useState(0);
  const [meta, setMeta] = useState<BusinessMeta>({ name: "", sector: "", description: "", district: "" });
  const [idScan, setIdScan] = useState<File | null>(null);

  const canProceedFromDetails = meta.name.trim().length > 0;

  async function handleSubmit() {
    if (!idScan) {
      toast.error("Upload your ID scan to continue");
      return;
    }
    try {
      const business = await registerMutation.mutateAsync({ meta, idScan });
      toast.success("Business submitted for review");
      router.replace(`/businesses/${business.id}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't submit your business");
    }
  }

  return (
    <div className="container-page max-w-2xl py-6">
      <div className="mb-6 flex items-center gap-3">
        {STEPS.map((label, i) => (
          <div key={label} className="flex flex-1 items-center gap-2">
            <div
              className={cn(
                "flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
                i < step
                  ? "bg-primary-500 text-white"
                  : i === step
                    ? "bg-primary-100 text-primary-700 ring-2 ring-primary-500 dark:bg-primary-900/50 dark:text-primary-300"
                    : "bg-muted text-muted-foreground",
              )}
            >
              {i < step ? <Check className="size-3.5" /> : i + 1}
            </div>
            <span className={cn("hidden text-xs font-medium sm:inline", i === step ? "text-foreground" : "text-muted-foreground")}>
              {label}
            </span>
            {i < STEPS.length - 1 && <div className="h-px flex-1 bg-border" />}
          </div>
        ))}
      </div>

      <Card className="animate-fade-in-up">
        {step === 0 && (
          <>
            <CardHeader>
              <CardTitle>Business details</CardTitle>
              <CardDescription>Tell us about the business you&apos;re registering.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="name">Business name</Label>
                <Input id="name" value={meta.name} onChange={(e) => setMeta((m) => ({ ...m, name: e.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="sector">Sector</Label>
                  <Input id="sector" value={meta.sector} onChange={(e) => setMeta((m) => ({ ...m, sector: e.target.value }))} placeholder="e.g. Agriculture" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="district">District</Label>
                  <Input id="district" value={meta.district} onChange={(e) => setMeta((m) => ({ ...m, district: e.target.value }))} />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" value={meta.description} onChange={(e) => setMeta((m) => ({ ...m, description: e.target.value }))} rows={3} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="contactPhone">Contact phone</Label>
                  <Input id="contactPhone" value={meta.contactPhone ?? ""} onChange={(e) => setMeta((m) => ({ ...m, contactPhone: e.target.value }))} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="contactEmail">Contact email</Label>
                  <Input id="contactEmail" type="email" value={meta.contactEmail ?? ""} onChange={(e) => setMeta((m) => ({ ...m, contactEmail: e.target.value }))} />
                </div>
              </div>
            </CardContent>
          </>
        )}

        {step === 1 && (
          <>
            <CardHeader>
              <CardTitle>Identity verification</CardTitle>
              <CardDescription>Upload a clear photo or scan of a government-issued ID. This is required for KYC review.</CardDescription>
            </CardHeader>
            <CardContent>
              <FileDropzone
                file={idScan}
                onChange={setIdScan}
                accept={{ "image/*": [".png", ".jpg", ".jpeg"], "application/pdf": [".pdf"] }}
                label="Drop your ID scan here, or click to browse"
                hint="JPG, PNG, or PDF"
              />
            </CardContent>
          </>
        )}

        {step === 2 && (
          <>
            <CardHeader>
              <CardTitle>Review & submit</CardTitle>
              <CardDescription>Double check the details below before submitting.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-2 text-sm">
              <Row label="Name" value={meta.name} />
              <Row label="Sector" value={meta.sector} />
              <Row label="District" value={meta.district} />
              <Row label="Contact" value={[meta.contactPhone, meta.contactEmail].filter(Boolean).join(" · ")} />
              <Row label="ID scan" value={idScan?.name ?? "Not attached"} />
            </CardContent>
          </>
        )}

        <div className="flex justify-between p-5 pt-0">
          <Button variant="outline" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0}>
            <ChevronLeft className="size-4" /> Back
          </Button>
          {step < STEPS.length - 1 ? (
            <Button onClick={() => setStep((s) => s + 1)} disabled={step === 0 && !canProceedFromDetails}>
              Next <ChevronRight className="size-4" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={registerMutation.isPending}>
              {registerMutation.isPending ? "Submitting…" : "Submit for review"}
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}

function Row({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex justify-between border-b border-border py-1.5 last:border-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value || "—"}</span>
    </div>
  );
}
