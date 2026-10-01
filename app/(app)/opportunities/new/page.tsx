"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, Check, ImagePlus, Loader2, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useCreateOpportunity } from "@/lib/queries/opportunities";
import { useAuthStore } from "@/lib/store/auth-store";
import {
  OPPORTUNITY_BENEFICIARIES, OPPORTUNITY_CATEGORIES, OPPORTUNITY_ORG_TYPES, OPPORTUNITY_SCOPES, type FilterOption,
} from "@/lib/data/filter-options";
import { cn } from "@/lib/utils";

const MAX_FLIER_BYTES = 10 * 1024 * 1024;

interface FormState {
  title: string;
  organizationName: string;
  categories: string[];
  categoryOther: string;
  description: string;
  organizationTypes: string[];
  organizationTypeOther: string;
  targetBeneficiaries: string[];
  targetBeneficiaryOther: string;
  geographicScope: string;
  geographicScopeOther: string;
  eligibilityCriteria: string;
  deadline: string;
  applicationLink: string;
  email: string;
  phone: string;
}

const EMPTY: FormState = {
  title: "", organizationName: "", categories: [], categoryOther: "", description: "",
  organizationTypes: [], organizationTypeOther: "", targetBeneficiaries: [], targetBeneficiaryOther: "",
  geographicScope: "", geographicScopeOther: "", eligibilityCriteria: "", deadline: "",
  applicationLink: "", email: "", phone: "",
};

const today = () => new Date().toISOString().slice(0, 10);
const lengthBetween = (v: string, min: number, max: number) => v.trim().length >= min && v.trim().length <= max;

/** The same rules opportunity-service enforces, checked before sending. */
function validate(f: FormState): Partial<Record<keyof FormState, string>> {
  const e: Partial<Record<keyof FormState, string>> = {};
  if (!lengthBetween(f.title, 5, 150)) e.title = "Use 5 to 150 characters";
  if (!lengthBetween(f.organizationName, 1, 120)) e.organizationName = "Required (under 120 characters)";
  if (f.categories.length === 0) e.categories = "Pick at least one";
  if (f.categories.includes("OTHER") && !lengthBetween(f.categoryOther, 2, 100)) e.categoryOther = "Describe the category (2-100 characters)";
  if (!lengthBetween(f.description, 20, 5000)) e.description = "Describe it in 20 to 5,000 characters";
  if (f.organizationTypes.length === 0) e.organizationTypes = "Pick at least one";
  if (f.organizationTypes.includes("OTHER") && !lengthBetween(f.organizationTypeOther, 2, 100)) e.organizationTypeOther = "Describe the organization type";
  if (f.targetBeneficiaries.length === 0) e.targetBeneficiaries = "Pick at least one";
  if (f.targetBeneficiaries.includes("OTHER") && !lengthBetween(f.targetBeneficiaryOther, 2, 100)) e.targetBeneficiaryOther = "Describe who it's for";
  if (!f.geographicScope) e.geographicScope = "Choose where it's open";
  if (f.geographicScope === "OTHER" && !lengthBetween(f.geographicScopeOther, 2, 100)) e.geographicScopeOther = "Describe the location";
  if (f.eligibilityCriteria.length > 2000) e.eligibilityCriteria = "Keep it under 2,000 characters";
  if (!f.deadline) e.deadline = "Required";
  else if (f.deadline < today()) e.deadline = "The deadline can't be in the past";
  if (!/^https?:\/\/\S+\.\S+/.test(f.applicationLink.trim())) e.applicationLink = "A link starting with http:// or https://";
  if (!/^\S+@\S+\.\S+$/.test(f.email.trim())) e.email = "A valid email address";
  const digits = f.phone.replace(/\D/g, "").length;
  if (digits < 7 || digits > 20) e.phone = "7 to 20 digits";
  return e;
}

/** Toggleable chips for a multi-choice field. */
function ChipGroup({ options, values, onChange, max, invalid }: {
  options: FilterOption[]; values: string[]; onChange: (v: string[]) => void; max: number; invalid?: boolean;
}) {
  return (
    <div className={cn("flex flex-wrap gap-2 rounded-xl", invalid && "ring-2 ring-error/40 ring-offset-2 ring-offset-card")}>
      {options.map((o) => {
        const on = values.includes(o.value);
        const full = !on && values.length >= max;
        return (
          <button
            key={o.value}
            type="button"
            disabled={full}
            aria-pressed={on}
            onClick={() => onChange(on ? values.filter((v) => v !== o.value) : [...values, o.value])}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-all duration-normal",
              on ? "border-primary-500 bg-primary-50 font-medium text-primary-800 dark:bg-primary-900/40 dark:text-primary-200" : "border-border hover:border-primary-300 hover:bg-muted",
              full && "cursor-not-allowed opacity-40",
            )}
          >
            {on && <Check className="size-3.5" />}
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

function FieldError({ message }: { message?: string }) {
  return message ? <p className="text-xs text-error">{message}</p> : null;
}

export default function NewOpportunityPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const create = useCreateOpportunity();
  const [form, setForm] = useState<FormState>(EMPTY);
  const [flier, setFlier] = useState<File | null>(null);
  const [attempted, setAttempted] = useState(false);
  const errors = useMemo(() => (attempted ? validate(form) : {}), [attempted, form]);
  const flierPreview = useMemo(() => (flier ? URL.createObjectURL(flier) : null), [flier]);
  useEffect(() => () => { if (flierPreview) URL.revokeObjectURL(flierPreview); }, [flierPreview]);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => setForm((f) => ({ ...f, [key]: value }));

  function pickFlier(file: File | undefined) {
    if (!file) return;
    if (!file.type.startsWith("image/")) return toast.error("The flier must be an image");
    if (file.size > MAX_FLIER_BYTES) return toast.error("The flier must be under 10 MB");
    setFlier(file);
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setAttempted(true);
    if (Object.keys(validate(form)).length > 0) {
      toast.error("Please fix the highlighted fields");
      return;
    }
    const opt = (v: string) => (v.trim() ? v.trim() : undefined);
    create.mutate(
      {
        payload: {
          title: form.title.trim(),
          organizationName: form.organizationName.trim(),
          categories: form.categories,
          categoryOther: form.categories.includes("OTHER") ? opt(form.categoryOther) : undefined,
          description: form.description.trim(),
          organizationTypes: form.organizationTypes,
          organizationTypeOther: form.organizationTypes.includes("OTHER") ? opt(form.organizationTypeOther) : undefined,
          targetBeneficiaries: form.targetBeneficiaries,
          targetBeneficiaryOther: form.targetBeneficiaries.includes("OTHER") ? opt(form.targetBeneficiaryOther) : undefined,
          geographicScope: form.geographicScope,
          geographicScopeOther: form.geographicScope === "OTHER" ? opt(form.geographicScopeOther) : undefined,
          eligibilityCriteria: opt(form.eligibilityCriteria),
          deadline: form.deadline,
          applicationLink: form.applicationLink.trim(),
          contactInfo: { email: form.email.trim(), phone: form.phone.trim() },
          submittedBy: user?.displayName || [user?.firstName, user?.lastName].filter(Boolean).join(" ") || "NaWeHub entrepreneur",
        },
        flier,
      },
      {
        onSuccess: (opportunity) => {
          toast.success("Saved as a draft", { description: "Review it, then publish it to submit it for review." });
          router.replace(`/opportunities/mine/${opportunity.id}`);
        },
        onError: (err) => toast.error(err instanceof Error ? err.message : "Couldn't save your opportunity"),
      },
    );
  }

  return (
    <div className="container-page max-w-3xl py-6">
      <Link href="/opportunities?view=mine" className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> My opportunities
      </Link>
      <form onSubmit={submit} noValidate className="space-y-6">
        <Card className="animate-fade-in-up">
          <CardHeader>
            <CardTitle>Post an opportunity</CardTitle>
            <CardDescription>
              Share a grant, competition, program or event with entrepreneurs. It&apos;s saved as your draft first -
              publish it when it&apos;s ready and our team reviews it before it goes live.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="title">Title <span className="text-error">*</span></Label>
              <Input id="title" value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="e.g. Youth Innovation Grant 2026" maxLength={150} />
              <FieldError message={errors.title} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="organizationName">Organization <span className="text-error">*</span></Label>
              <Input id="organizationName" value={form.organizationName} onChange={(e) => set("organizationName", e.target.value)} placeholder="Who's offering it" maxLength={120} />
              <FieldError message={errors.organizationName} />
            </div>
            <div className="space-y-2">
              <Label>Category <span className="text-error">*</span></Label>
              <ChipGroup options={OPPORTUNITY_CATEGORIES} values={form.categories} onChange={(v) => set("categories", v)} max={9} invalid={!!errors.categories} />
              <FieldError message={errors.categories} />
              {form.categories.includes("OTHER") && (
                <div className="animate-fade-in-up space-y-1.5">
                  <Input value={form.categoryOther} onChange={(e) => set("categoryOther", e.target.value)} placeholder="Describe the category" maxLength={100} />
                  <FieldError message={errors.categoryOther} />
                </div>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="description">Description <span className="text-error">*</span></Label>
              <Textarea id="description" rows={6} value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="What it offers, how to apply, and anything applicants should know." maxLength={5000} />
              <div className="flex justify-between gap-2"><FieldError message={errors.description} /><span className="ml-auto text-xs text-muted-foreground">{form.description.trim().length}/5000</span></div>
            </div>
          </CardContent>
        </Card>

        <Card className="animate-fade-in-up [animation-delay:60ms] [animation-fill-mode:both]">
          <CardHeader>
            <CardTitle className="text-lg">Who it&apos;s for and where</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <Label>Organization type <span className="text-error">*</span></Label>
              <ChipGroup options={OPPORTUNITY_ORG_TYPES} values={form.organizationTypes} onChange={(v) => set("organizationTypes", v)} max={6} invalid={!!errors.organizationTypes} />
              <FieldError message={errors.organizationTypes} />
              {form.organizationTypes.includes("OTHER") && (
                <div className="animate-fade-in-up space-y-1.5">
                  <Input value={form.organizationTypeOther} onChange={(e) => set("organizationTypeOther", e.target.value)} placeholder="Describe the organization type" maxLength={100} />
                  <FieldError message={errors.organizationTypeOther} />
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label>Who can apply <span className="text-error">*</span></Label>
              <ChipGroup options={OPPORTUNITY_BENEFICIARIES} values={form.targetBeneficiaries} onChange={(v) => set("targetBeneficiaries", v)} max={7} invalid={!!errors.targetBeneficiaries} />
              <FieldError message={errors.targetBeneficiaries} />
              {form.targetBeneficiaries.includes("OTHER") && (
                <div className="animate-fade-in-up space-y-1.5">
                  <Input value={form.targetBeneficiaryOther} onChange={(e) => set("targetBeneficiaryOther", e.target.value)} placeholder="Describe who it's for" maxLength={100} />
                  <FieldError message={errors.targetBeneficiaryOther} />
                </div>
              )}
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="scope">Open to <span className="text-error">*</span></Label>
                <Select value={form.geographicScope} onValueChange={(v) => set("geographicScope", v)}>
                  <SelectTrigger id="scope" className={cn(errors.geographicScope && "border-error")}>
                    <SelectValue placeholder="Choose where it's open" />
                  </SelectTrigger>
                  <SelectContent>
                    {OPPORTUNITY_SCOPES.map((o) => (
                      <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FieldError message={errors.geographicScope} />
              </div>
              {form.geographicScope === "OTHER" && (
                <div className="animate-fade-in-up space-y-1.5">
                  <Label htmlFor="scopeOther">Where?</Label>
                  <Input id="scopeOther" value={form.geographicScopeOther} onChange={(e) => set("geographicScopeOther", e.target.value)} placeholder="e.g. West Africa" maxLength={100} />
                  <FieldError message={errors.geographicScopeOther} />
                </div>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="eligibility">Eligibility <span className="text-xs font-normal text-muted-foreground">(optional)</span></Label>
              <Textarea id="eligibility" rows={3} value={form.eligibilityCriteria} onChange={(e) => set("eligibilityCriteria", e.target.value)} placeholder="Who qualifies - age, stage, location, sector…" maxLength={2000} />
              <FieldError message={errors.eligibilityCriteria} />
            </div>
          </CardContent>
        </Card>

        <Card className="animate-fade-in-up [animation-delay:120ms] [animation-fill-mode:both]">
          <CardHeader>
            <CardTitle className="text-lg">Deadline, application and contact</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="deadline">Deadline <span className="text-error">*</span></Label>
              <Input id="deadline" type="date" min={today()} value={form.deadline} onChange={(e) => set("deadline", e.target.value)} />
              <FieldError message={errors.deadline} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="link">Application link <span className="text-error">*</span></Label>
              <Input id="link" type="url" value={form.applicationLink} onChange={(e) => set("applicationLink", e.target.value)} placeholder="https://" />
              <FieldError message={errors.applicationLink} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">Contact email <span className="text-error">*</span></Label>
              <Input id="email" type="email" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="programs@organization.org" />
              <FieldError message={errors.email} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="phone">Contact phone <span className="text-error">*</span></Label>
              <Input id="phone" type="tel" value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="+232 76 000 000" />
              <FieldError message={errors.phone} />
            </div>
          </CardContent>
        </Card>

        <Card className="animate-fade-in-up [animation-delay:180ms] [animation-fill-mode:both]">
          <CardHeader>
            <CardTitle className="text-lg">Flier <span className="text-sm font-normal text-muted-foreground">(optional)</span></CardTitle>
            <CardDescription>An image that shows on the opportunity&apos;s card and page.</CardDescription>
          </CardHeader>
          <CardContent>
            {flierPreview ? (
              <div className="relative overflow-hidden rounded-xl border border-border">
                {/* eslint-disable-next-line @next/next/no-img-element -- local object URL preview */}
                <img src={flierPreview} alt="Flier preview" className="max-h-80 w-full object-contain bg-muted" />
                <Button type="button" variant="secondary" size="sm" className="absolute right-3 top-3" onClick={() => setFlier(null)}>
                  <X className="size-4" /> Remove
                </Button>
              </div>
            ) : (
              <label className="flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed border-border p-8 text-center transition-colors hover:border-primary-300 hover:bg-muted/40">
                <ImagePlus className="size-8 text-muted-foreground" />
                <span className="text-sm font-medium">Choose an image</span>
                <span className="text-xs text-muted-foreground">PNG or JPG, up to 10 MB</span>
                <input type="file" accept="image/*" hidden onChange={(e) => pickFlier(e.target.files?.[0])} />
              </label>
            )}
          </CardContent>
        </Card>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="ghost" asChild>
            <Link href="/opportunities?view=mine">Cancel</Link>
          </Button>
          <Button type="submit" disabled={create.isPending}>
            {create.isPending ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
            {create.isPending ? "Saving…" : "Save draft"}
          </Button>
        </div>
      </form>
    </div>
  );
}
