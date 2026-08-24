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
import { useCreateBigIdea } from "@/lib/queries/big-ideas";
import { cn } from "@/lib/utils";
import type { CreateBigIdeaPayload } from "@/lib/api/big-ideas";
import type { IdeaApplicant } from "@/lib/api/types";

const STEPS = ["About you", "The idea", "Market & model", "Stage & traction", "Risks & impact"];

const GENDER_OPTIONS: Array<{ value: IdeaApplicant["gender"]; label: string }> = [
  { value: "MALE", label: "Male" },
  { value: "FEMALE", label: "Female" },
  { value: "OTHER", label: "Other" },
  { value: "PREFER_NOT_TO_SAY", label: "Prefer not to say" },
];

const SUBMISSION_TYPE_OPTIONS: Array<{ value: IdeaApplicant["submissionType"]; label: string }> = [
  { value: "INDIVIDUAL", label: "Individual" },
  { value: "TEAM", label: "Team" },
  { value: "EXISTING_BUSINESS", label: "Existing business" },
  { value: "ORGANISATION", label: "Organisation" },
];

const STAGE_OPTIONS: Array<{ value: CreateBigIdeaPayload["stage"]; label: string }> = [
  { value: "CONCEPT_ONLY", label: "Concept only" },
  { value: "RESEARCH_COMPLETED", label: "Research completed" },
  { value: "PROTOTYPE_DEVELOPED", label: "Prototype developed" },
  { value: "TESTING_PILOT", label: "Testing / pilot" },
  { value: "ALREADY_OPERATING", label: "Already operating" },
];

const emptyApplicant: IdeaApplicant = {
  fullName: "",
  gender: "PREFER_NOT_TO_SAY",
  age: 18,
  phone: "",
  email: "",
  location: "",
  occupation: "",
  submissionType: "INDIVIDUAL",
};

const emptyForm: CreateBigIdeaPayload = {
  applicant: emptyApplicant,
  ideaName: "",
  oneLineDescription: "",
  description: "",
  problemStatement: "",
  problemAudience: "",
  currentSolution: "",
  proposedSolution: "",
  innovationDescription: "",
  inspiration: "",
  targetCustomers: "",
  customerLocation: "",
  marketSize: "",
  competitors: "",
  competitiveAdvantage: "",
  revenueModel: "",
  productOrService: "",
  pricingStrategy: "",
  mainCosts: "",
  startupCapitalNeeded: "",
  firstYearRevenueEstimate: "",
  potentialPartners: "",
  stage: "CONCEPT_ONLY",
  testedWithCustomers: false,
  testingLearnings: "",
  existingResources: "",
  challengesAndRisks: "",
  riskMitigationPlan: "",
  socialImpact: "",
  environmentalImpact: "",
  estimatedJobsCreated: "",
  growthPlan: "",
  whySelected: "",
};

export default function NewBigIdeaPage() {
  const router = useRouter();
  const createMutation = useCreateBigIdea();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<CreateBigIdeaPayload>(emptyForm);

  function setApplicant<K extends keyof IdeaApplicant>(key: K, value: IdeaApplicant[K]) {
    setForm((f) => ({ ...f, applicant: { ...f.applicant, [key]: value } }));
  }

  function setField<K extends keyof CreateBigIdeaPayload>(key: K, value: CreateBigIdeaPayload[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  const canProceed = [
    // Step 0: applicant
    Boolean(form.applicant.fullName && form.applicant.phone && form.applicant.email && form.applicant.location && form.applicant.occupation),
    // Step 1: the idea
    Boolean(form.ideaName && form.oneLineDescription && form.description && form.problemStatement && form.proposedSolution),
    // Step 2: market & model
    Boolean(form.targetCustomers && form.revenueModel),
    // Step 3: stage & traction - stage always has a value
    true,
    // Step 4: risks & impact - all optional
    true,
  ];

  async function handleSubmit() {
    try {
      // Trim optional empty strings to undefined so we don't send blank
      // values the backend would otherwise happily store as "".
      const payload: CreateBigIdeaPayload = Object.fromEntries(
        Object.entries(form).map(([k, v]) => [k, typeof v === "string" && v.trim() === "" ? undefined : v]),
      ) as CreateBigIdeaPayload;

      const idea = await createMutation.mutateAsync(payload);
      toast.success("Your idea has been submitted for review");
      router.replace(`/big-ideas/${idea.id}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't submit your idea");
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
              <CardTitle>About you</CardTitle>
              <CardDescription>Who&apos;s submitting this idea?</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <Field label="Full name" required>
                <Input value={form.applicant.fullName} onChange={(e) => setApplicant("fullName", e.target.value)} />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Gender" required>
                  <Select value={form.applicant.gender} onValueChange={(v) => setApplicant("gender", v as IdeaApplicant["gender"])}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {GENDER_OPTIONS.map((o) => (
                        <SelectItem key={o.value} value={o.value}>
                          {o.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Age" required>
                  <Input
                    type="number"
                    min={13}
                    max={120}
                    value={form.applicant.age}
                    onChange={(e) => setApplicant("age", Number(e.target.value))}
                  />
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Phone" required>
                  <Input value={form.applicant.phone} onChange={(e) => setApplicant("phone", e.target.value)} />
                </Field>
                <Field label="Email" required>
                  <Input type="email" value={form.applicant.email} onChange={(e) => setApplicant("email", e.target.value)} />
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Location" required>
                  <Input value={form.applicant.location} onChange={(e) => setApplicant("location", e.target.value)} placeholder="e.g. Freetown" />
                </Field>
                <Field label="Occupation" required>
                  <Input value={form.applicant.occupation} onChange={(e) => setApplicant("occupation", e.target.value)} />
                </Field>
              </div>
              <Field label="Submitting as" required>
                <Select
                  value={form.applicant.submissionType}
                  onValueChange={(v) => setApplicant("submissionType", v as IdeaApplicant["submissionType"])}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SUBMISSION_TYPE_OPTIONS.map((o) => (
                      <SelectItem key={o.value} value={o.value}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            </CardContent>
          </>
        )}

        {step === 1 && (
          <>
            <CardHeader>
              <CardTitle>The idea</CardTitle>
              <CardDescription>What is it, and what problem does it solve?</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <Field label="Idea name" required>
                <Input value={form.ideaName} onChange={(e) => setField("ideaName", e.target.value)} />
              </Field>
              <Field label="One-line description" required>
                <Input value={form.oneLineDescription} onChange={(e) => setField("oneLineDescription", e.target.value)} placeholder="Pitch it in a single sentence" />
              </Field>
              <Field label="Full description" required>
                <Textarea rows={3} value={form.description} onChange={(e) => setField("description", e.target.value)} />
              </Field>
              <Field label="Problem statement" required>
                <Textarea rows={2} value={form.problemStatement} onChange={(e) => setField("problemStatement", e.target.value)} />
              </Field>
              <Field label="Who has this problem?">
                <Input value={form.problemAudience} onChange={(e) => setField("problemAudience", e.target.value)} />
              </Field>
              <Field label="How is it solved today?">
                <Textarea rows={2} value={form.currentSolution} onChange={(e) => setField("currentSolution", e.target.value)} />
              </Field>
              <Field label="Your proposed solution" required>
                <Textarea rows={2} value={form.proposedSolution} onChange={(e) => setField("proposedSolution", e.target.value)} />
              </Field>
              <Field label="What's new or innovative about it?">
                <Textarea rows={2} value={form.innovationDescription} onChange={(e) => setField("innovationDescription", e.target.value)} />
              </Field>
              <Field label="What inspired this idea?">
                <Textarea rows={2} value={form.inspiration} onChange={(e) => setField("inspiration", e.target.value)} />
              </Field>
            </CardContent>
          </>
        )}

        {step === 2 && (
          <>
            <CardHeader>
              <CardTitle>Market & business model</CardTitle>
              <CardDescription>Who pays, and how does this make money?</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <Field label="Target customers" required>
                <Textarea rows={2} value={form.targetCustomers} onChange={(e) => setField("targetCustomers", e.target.value)} />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Customer location">
                  <Input value={form.customerLocation} onChange={(e) => setField("customerLocation", e.target.value)} />
                </Field>
                <Field label="Market size">
                  <Input value={form.marketSize} onChange={(e) => setField("marketSize", e.target.value)} />
                </Field>
              </div>
              <Field label="Competitors">
                <Textarea rows={2} value={form.competitors} onChange={(e) => setField("competitors", e.target.value)} />
              </Field>
              <Field label="Competitive advantage">
                <Textarea rows={2} value={form.competitiveAdvantage} onChange={(e) => setField("competitiveAdvantage", e.target.value)} />
              </Field>
              <Field label="Revenue model" required>
                <Textarea rows={2} value={form.revenueModel} onChange={(e) => setField("revenueModel", e.target.value)} placeholder="How will this make money?" />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Product or service">
                  <Input value={form.productOrService} onChange={(e) => setField("productOrService", e.target.value)} />
                </Field>
                <Field label="Pricing strategy">
                  <Input value={form.pricingStrategy} onChange={(e) => setField("pricingStrategy", e.target.value)} />
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Main costs">
                  <Input value={form.mainCosts} onChange={(e) => setField("mainCosts", e.target.value)} />
                </Field>
                <Field label="Startup capital needed">
                  <Input value={form.startupCapitalNeeded} onChange={(e) => setField("startupCapitalNeeded", e.target.value)} placeholder="e.g. SLE 50,000" />
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Year-1 revenue estimate">
                  <Input value={form.firstYearRevenueEstimate} onChange={(e) => setField("firstYearRevenueEstimate", e.target.value)} />
                </Field>
                <Field label="Potential partners">
                  <Input value={form.potentialPartners} onChange={(e) => setField("potentialPartners", e.target.value)} />
                </Field>
              </div>
            </CardContent>
          </>
        )}

        {step === 3 && (
          <>
            <CardHeader>
              <CardTitle>Stage & traction</CardTitle>
              <CardDescription>How far along is this idea?</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <Field label="Stage" required>
                <Select value={form.stage} onValueChange={(v) => setField("stage", v as CreateBigIdeaPayload["stage"])}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STAGE_OPTIONS.map((o) => (
                      <SelectItem key={o.value} value={o.value}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <label className="flex items-center gap-2.5 text-sm">
                <Checkbox
                  checked={form.testedWithCustomers}
                  onCheckedChange={(checked) => setField("testedWithCustomers", checked === true)}
                />
                Tested with real customers
              </label>
              {form.testedWithCustomers && (
                <Field label="What did you learn?">
                  <Textarea rows={2} value={form.testingLearnings} onChange={(e) => setField("testingLearnings", e.target.value)} />
                </Field>
              )}
              <Field label="Existing resources you already have">
                <Textarea rows={2} value={form.existingResources} onChange={(e) => setField("existingResources", e.target.value)} />
              </Field>
            </CardContent>
          </>
        )}

        {step === 4 && (
          <>
            <CardHeader>
              <CardTitle>Risks & impact</CardTitle>
              <CardDescription>The last stretch, all optional.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <Field label="Challenges & risks">
                <Textarea rows={2} value={form.challengesAndRisks} onChange={(e) => setField("challengesAndRisks", e.target.value)} />
              </Field>
              <Field label="Risk mitigation plan">
                <Textarea rows={2} value={form.riskMitigationPlan} onChange={(e) => setField("riskMitigationPlan", e.target.value)} />
              </Field>
              <Field label="Social impact">
                <Textarea rows={2} value={form.socialImpact} onChange={(e) => setField("socialImpact", e.target.value)} />
              </Field>
              <Field label="Environmental impact">
                <Textarea rows={2} value={form.environmentalImpact} onChange={(e) => setField("environmentalImpact", e.target.value)} />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Estimated jobs created">
                  <Input value={form.estimatedJobsCreated} onChange={(e) => setField("estimatedJobsCreated", e.target.value)} />
                </Field>
                <Field label="Growth plan">
                  <Input value={form.growthPlan} onChange={(e) => setField("growthPlan", e.target.value)} />
                </Field>
              </div>
              <Field label="Why should this idea be selected?">
                <Textarea rows={2} value={form.whySelected} onChange={(e) => setField("whySelected", e.target.value)} />
              </Field>
              <p className="text-xs text-muted-foreground">
                Supporting material (pitch decks, images) can be attached after submission from the idea&apos;s page.
              </p>
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
            <Button onClick={handleSubmit} disabled={createMutation.isPending}>
              {createMutation.isPending ? "Submitting…" : "Submit for review"}
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
