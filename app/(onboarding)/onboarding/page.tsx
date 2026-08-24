"use client";

import { useEffect, useState, type KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Check, ChevronLeft, ChevronRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { entrepreneursApi } from "@/lib/api/entrepreneurs";
import { useOwnEntrepreneurProfile } from "@/lib/queries/entrepreneurs";
import { useAuthStore } from "@/lib/store/auth-store";
import { NATIONALITIES } from "@/lib/data/nationalities";
import { cn } from "@/lib/utils";
import type { CommonGender, EntrepreneurProfile, UserInfo } from "@/lib/api/types";

const STEPS = ["The basics", "Finishing touches"];

const GENDER_OPTIONS: Array<{ value: CommonGender; label: string }> = [
  { value: "MALE", label: "Male" },
  { value: "FEMALE", label: "Female" },
  { value: "PREFER_NOT_SAY", label: "Prefer not to say" },
];

/**
 * LinkedIn-style "finish setting up your profile" step, landed on right
 * after a session is established (see resolvePostAuthDestination) whenever
 * the entrepreneur profile is still PENDING - which is every brand-new
 * registration (email or OAuth): entrepreneur-service auto-creates a
 * minimal PENDING shell via Kafka the instant a user registers, so there's
 * almost always something to finish here, not something to create from
 * scratch.
 */
export default function OnboardingPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const { data: profile, isLoading, isError, refetch } = useOwnEntrepreneurProfile();

  // Already done (e.g. revisiting this URL after activating) - nothing to do here.
  useEffect(() => {
    if (profile && profile.status !== "PENDING") {
      router.replace("/feed");
    }
  }, [profile, router]);

  if (isLoading || !user) {
    return (
      <div className="flex justify-center py-16">
        <div className="size-8 animate-spin-slow rounded-full border-2 border-primary-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <OnboardingForm
      // Remounts (with fresh initial state derived straight from `profile`)
      // once the query settles, instead of syncing via a setState-in-effect.
      key={profile?.id ?? "new"}
      profile={profile}
      isMissingProfile={isError || !profile}
      user={user}
      onDone={() => {
        toast.success("Profile all set up!");
        router.replace("/feed");
      }}
      onFailed={() => refetch()}
    />
  );
}

interface OnboardingFormProps {
  profile: EntrepreneurProfile | undefined;
  isMissingProfile: boolean;
  user: UserInfo;
  onDone: () => void;
  onFailed: () => void;
}

function OnboardingForm({ profile, isMissingProfile, user, onDone, onFailed }: OnboardingFormProps) {
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [gender, setGender] = useState<CommonGender>((profile?.gender as CommonGender) || "PREFER_NOT_SAY");
  const [dateOfBirth, setDateOfBirth] = useState(profile?.dateOfBirth ?? "");
  const [nationality, setNationality] = useState(profile?.nationality ?? "");
  const [district, setDistrict] = useState(profile?.district ?? "");
  const [currentLocation, setCurrentLocation] = useState(profile?.currentLocation ?? "");
  const [chiefdom, setChiefdom] = useState(profile?.chiefdom ?? "");
  const [skills, setSkills] = useState<string[]>(profile?.skills ?? []);
  const [skillInput, setSkillInput] = useState("");

  const canProceedFromBasics = Boolean(gender && dateOfBirth && nationality && district && currentLocation);

  function addSkill() {
    const value = skillInput.trim();
    if (value && !skills.includes(value)) setSkills((prev) => [...prev, value]);
    setSkillInput("");
  }

  function handleSkillKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addSkill();
    }
  }

  async function handleFinish() {
    setSubmitting(true);
    try {
      let entrepreneurId = profile?.id;

      if (isMissingProfile) {
        // No shell profile yet (the Kafka-driven auto-create hasn't landed) -
        // create one directly with everything required.
        const created = await entrepreneursApi.register({
          userId: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          gender,
          dateOfBirth,
          nationality,
          district,
          chiefdom: chiefdom || undefined,
          currentLocation,
          email: user.email,
          phoneNumber: user.phone ?? "",
          skills: skills.length ? skills : undefined,
        });
        entrepreneurId = created.id;
      } else if (profile) {
        await entrepreneursApi.updatePersonalInfo(profile.id, {
          gender,
          dateOfBirth,
          nationality,
          district,
          chiefdom: chiefdom || undefined,
          currentLocation,
          skills,
        });
      }

      if (entrepreneurId) {
        await entrepreneursApi.activate(entrepreneurId);
      }

      onDone();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't finish setting up your profile");
      // The register-fallback branch may have partially succeeded (profile
      // created but activate failed, say) - refetch so a retry sees it.
      onFailed();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
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
              <CardTitle>Welcome to NaWeHub{user.firstName ? `, ${user.firstName}` : ""}</CardTitle>
              <CardDescription>
                A few details to set up your entrepreneur profile - this is what other members and funders see.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>
                    Gender <span className="text-error">*</span>
                  </Label>
                  <Select value={gender} onValueChange={(v) => setGender(v as CommonGender)}>
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
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="dob">
                    Date of birth <span className="text-error">*</span>
                  </Label>
                  <Input id="dob" type="date" value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>
                  Nationality <span className="text-error">*</span>
                </Label>
                <Select value={nationality} onValueChange={setNationality}>
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
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="district">
                    District <span className="text-error">*</span>
                  </Label>
                  <Input id="district" value={district} onChange={(e) => setDistrict(e.target.value)} placeholder="e.g. Western Area Urban" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="currentLocation">
                    Current location <span className="text-error">*</span>
                  </Label>
                  <Input id="currentLocation" value={currentLocation} onChange={(e) => setCurrentLocation(e.target.value)} placeholder="e.g. Freetown" />
                </div>
              </div>
            </CardContent>
          </>
        )}

        {step === 1 && (
          <>
            <CardHeader>
              <CardTitle>Finishing touches</CardTitle>
              <CardDescription>Optional, but it helps people find and understand you faster.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="chiefdom">Chiefdom</Label>
                <Input id="chiefdom" value={chiefdom} onChange={(e) => setChiefdom(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Skills</Label>
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill) => (
                    <Badge key={skill} variant="outline" className="gap-1 pr-1.5">
                      {skill}
                      <button
                        type="button"
                        onClick={() => setSkills((prev) => prev.filter((s) => s !== skill))}
                        aria-label={`Remove ${skill}`}
                        className="rounded-full p-0.5 hover:bg-muted"
                      >
                        <X className="size-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
                <Input
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={handleSkillKeyDown}
                  onBlur={addSkill}
                  placeholder="Type a skill and press Enter"
                />
              </div>
            </CardContent>
          </>
        )}

        <div className="flex justify-between p-5 pt-0">
          <Button variant="outline" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0}>
            <ChevronLeft className="size-4" /> Back
          </Button>
          {step < STEPS.length - 1 ? (
            <Button onClick={() => setStep((s) => s + 1)} disabled={!canProceedFromBasics}>
              Next <ChevronRight className="size-4" />
            </Button>
          ) : (
            <Button onClick={handleFinish} disabled={submitting}>
              {submitting ? "Finishing up…" : "Finish"}
            </Button>
          )}
        </div>
      </Card>
    </>
  );
}
