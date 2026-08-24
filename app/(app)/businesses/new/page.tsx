"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Check, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileDropzone } from "@/components/file-dropzone";
import { useRegisterBusiness } from "@/lib/queries/businesses";
import { cn, formatEnumLabel } from "@/lib/utils";
import { BUSINESS_ENTITY_TYPES } from "@/lib/data/business-entity-types";
import { NATIONALITIES } from "@/lib/data/nationalities";
import type { BusinessCategory, BusinessMeta } from "@/lib/api/types";

const STEPS = ["Business", "Owner", "Contact & identity", "ID verification", "Review & submit"];

const CATEGORY_OPTIONS: BusinessCategory[] = [
  "AGRICULTURE",
  "TECHNOLOGY",
  "FASHION_TEXTILES",
  "FOOD_BEVERAGE",
  "HEALTHCARE",
  "EDUCATION",
  "CONSTRUCTION",
  "TRANSPORTATION",
  "RETAIL",
  "MANUFACTURING",
  "SERVICES",
  "TOURISM",
  "MINING",
  "ENERGY",
  "OTHER",
];

const emptyMeta: BusinessMeta = {
  businessName: "",
  businessAddress: "",
  ownerName: "",
  ownerAddress: "",
  placeOfBirth: "",
  dateOfBirth: "",
  gender: "PREFER_NOT_SAY",
  nationality: "",
  mothersName: "",
  contactNumber: "",
  email: "",
  businessCategory: "SERVICES",
  businessActivities: "",
  businessEntityType: "",
  // Not asked in the UI (see Contact & identity step) - this flow is only
  // ever reached by an entrepreneur who already has a NaWeHub account, and
  // the business directory is the platform's core discovery feature, so
  // every registered business is public by default.
  isPublicRegister: true,
  createNawehubAccount: false,
  isAlreadyRegistered: false,
  ninPassport: "",
};

export default function NewBusinessPage() {
  const router = useRouter();
  const registerMutation = useRegisterBusiness();
  const [step, setStep] = useState(0);
  const [meta, setMeta] = useState<BusinessMeta>(emptyMeta);
  const [idScan, setIdScan] = useState<File | null>(null);

  const selectedEntityType = BUSINESS_ENTITY_TYPES.find((t) => t.name === meta.businessEntityType);

  function setField<K extends keyof BusinessMeta>(key: K, value: BusinessMeta[K]) {
    setMeta((m) => ({ ...m, [key]: value }));
  }

  const canProceed = [
    Boolean(meta.businessName && meta.businessAddress && meta.businessEntityType && meta.businessActivities),
    Boolean(meta.ownerName && meta.ownerAddress && meta.placeOfBirth && meta.dateOfBirth && meta.nationality && meta.mothersName),
    Boolean(meta.contactNumber && meta.email && meta.ninPassport),
    Boolean(idScan),
    true,
  ];

  async function handleSubmit() {
    if (!idScan) {
      toast.error("Upload an ID scan to continue");
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
      <div className="mb-6 flex items-center gap-2">
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
              <Field label="Business name" required>
                <Input value={meta.businessName} onChange={(e) => setField("businessName", e.target.value)} />
              </Field>
              <Field label="Business address" required>
                <Input value={meta.businessAddress} onChange={(e) => setField("businessAddress", e.target.value)} />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Category" required>
                  <Select value={meta.businessCategory} onValueChange={(v) => setField("businessCategory", v as BusinessCategory)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORY_OPTIONS.map((c) => (
                        <SelectItem key={c} value={c}>
                          {formatEnumLabel(c)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Entity type" required>
                  <Select value={meta.businessEntityType} onValueChange={(v) => setField("businessEntityType", v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select an entity type" />
                    </SelectTrigger>
                    <SelectContent>
                      {BUSINESS_ENTITY_TYPES.map((t) => (
                        <SelectItem key={t.name} value={t.name}>
                          {t.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              </div>
              {selectedEntityType && (
                <div className="rounded-lg bg-muted p-3">
                  {selectedEntityType.hints.map((hint, i) => (
                    <p key={i} className="text-xs text-muted-foreground">
                      {hint}
                    </p>
                  ))}
                </div>
              )}
              <Field label="What does the business do?" required>
                <Textarea rows={3} value={meta.businessActivities} onChange={(e) => setField("businessActivities", e.target.value)} />
              </Field>
            </CardContent>
          </>
        )}

        {step === 1 && (
          <>
            <CardHeader>
              <CardTitle>Owner details</CardTitle>
              <CardDescription>Required for KYC verification.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <Field label="Owner full name" required>
                <Input value={meta.ownerName} onChange={(e) => setField("ownerName", e.target.value)} />
              </Field>
              <Field label="Owner address" required>
                <Input value={meta.ownerAddress} onChange={(e) => setField("ownerAddress", e.target.value)} />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Place of birth" required>
                  <Input value={meta.placeOfBirth} onChange={(e) => setField("placeOfBirth", e.target.value)} />
                </Field>
                <Field label="Date of birth" required>
                  <Input type="date" value={meta.dateOfBirth} onChange={(e) => setField("dateOfBirth", e.target.value)} />
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Gender" required>
                  <Select value={meta.gender} onValueChange={(v) => setField("gender", v as BusinessMeta["gender"])}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MALE">Male</SelectItem>
                      <SelectItem value="FEMALE">Female</SelectItem>
                      <SelectItem value="PREFER_NOT_SAY">Prefer not to say</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Nationality" required>
                  <Select value={meta.nationality} onValueChange={(v) => setField("nationality", v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a nationality" />
                    </SelectTrigger>
                    <SelectContent className="max-h-72">
                      {NATIONALITIES.map((n) => (
                        <SelectItem key={n} value={n}>
                          {n}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Mother's name" required>
                  <Input value={meta.mothersName} onChange={(e) => setField("mothersName", e.target.value)} />
                </Field>
                <Field label="Occupation">
                  <Input value={meta.occupation ?? ""} onChange={(e) => setField("occupation", e.target.value)} />
                </Field>
              </div>
            </CardContent>
          </>
        )}

        {step === 2 && (
          <>
            <CardHeader>
              <CardTitle>Contact & identity</CardTitle>
              <CardDescription>How we reach you, and proof of identity.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-3">
                <Field label="Contact number" required>
                  <Input value={meta.contactNumber} onChange={(e) => setField("contactNumber", e.target.value)} />
                </Field>
                <Field label="Email" required>
                  <Input type="email" value={meta.email} onChange={(e) => setField("email", e.target.value)} />
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Document type">
                  <Select
                    value={meta.docType ?? ""}
                    onValueChange={(v) => setField("docType", v as BusinessMeta["docType"])}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a document" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="NATIONAL_ID">National ID</SelectItem>
                      <SelectItem value="PASSPORT">Passport</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="NIN / passport number" required>
                  <Input value={meta.ninPassport} onChange={(e) => setField("ninPassport", e.target.value)} />
                </Field>
              </div>

              <div className="flex flex-col gap-3 border-t border-border pt-4">
                <label className="flex items-center gap-2.5 text-sm">
                  <Checkbox
                    checked={meta.isAlreadyRegistered}
                    onCheckedChange={(checked) => setField("isAlreadyRegistered", checked === true)}
                  />
                  This business is already formally registered
                </label>
                {meta.isAlreadyRegistered && (
                  <div className="grid grid-cols-2 gap-3 pl-6">
                    <Field label="Registration number">
                      <Input value={meta.registrationNumber ?? ""} onChange={(e) => setField("registrationNumber", e.target.value)} />
                    </Field>
                    <Field label="Registration date">
                      <Input type="date" value={meta.registerDate ?? ""} onChange={(e) => setField("registerDate", e.target.value)} />
                    </Field>
                  </div>
                )}
              </div>
            </CardContent>
          </>
        )}

        {step === 3 && (
          <>
            <CardHeader>
              <CardTitle>Identity verification</CardTitle>
              <CardDescription>Upload a clear photo or scan of the document selected above. Required for KYC review.</CardDescription>
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

        {step === 4 && (
          <>
            <CardHeader>
              <CardTitle>Review & submit</CardTitle>
              <CardDescription>Double check the details below before submitting.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-2 text-sm">
              <Row label="Name" value={meta.businessName} />
              <Row label="Category" value={formatEnumLabel(meta.businessCategory)} />
              <Row label="Entity type" value={meta.businessEntityType} />
              <Row label="Owner" value={meta.ownerName} />
              <Row label="Contact" value={[meta.contactNumber, meta.email].filter(Boolean).join(" · ")} />
              <Row label="ID scan" value={idScan?.name ?? "Not attached"} />
            </CardContent>
          </>
        )}

        <div className="flex justify-between p-5 pt-0">
          <Button variant="outline" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0}>
            <ChevronLeft className="size-4" /> Back
          </Button>
          {step < STEPS.length - 1 ? (
            <Button onClick={() => setStep((s) => s + 1)} disabled={!canProceed[step]}>
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

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label>
        {label} {required && <span className="text-error">*</span>}
      </Label>
      {children}
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
