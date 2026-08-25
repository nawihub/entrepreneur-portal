"use client";

import { use, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Paperclip, Trash2, Lightbulb, Eye, CheckCircle2, XCircle, MapPin, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StatusBadge } from "@/components/status-badge";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/empty-state";
import { formatEnumLabel } from "@/lib/utils";
import { useBigIdea, useBigIdeaModeration, useDeleteBigIdea } from "@/lib/queries/big-ideas";
import { bigIdeasApi } from "@/lib/api/big-ideas";
import { useQueryClient } from "@tanstack/react-query";
import { bigIdeaKeys } from "@/lib/queries/big-ideas";
import type { BigIdea, MaterialType } from "@/lib/api/types";

const MATERIAL_TYPES: MaterialType[] = ["PITCH_DECK", "BUSINESS_PLAN", "PROTOTYPE_PHOTO", "VIDEO", "OTHER"];

const DETAIL_SECTIONS: Array<{ label: string; key: keyof BigIdea }> = [
  { label: "Problem statement", key: "problemStatement" },
  { label: "Who has this problem?", key: "problemAudience" },
  { label: "Proposed solution", key: "proposedSolution" },
  { label: "What's new/innovative about it?", key: "innovationDescription" },
  { label: "Target customers", key: "targetCustomers" },
  { label: "Revenue model", key: "revenueModel" },
  { label: "Main costs", key: "mainCosts" },
  { label: "Startup capital needed", key: "startupCapitalNeeded" },
  { label: "Challenges & risks", key: "challengesAndRisks" },
  { label: "Social impact", key: "socialImpact" },
  { label: "Growth plan", key: "growthPlan" },
];

export default function BigIdeaDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: idea, isLoading, isError } = useBigIdea(id);
  const moderation = useBigIdeaModeration(id);
  const deleteMutation = useDeleteBigIdea();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [materialType, setMaterialType] = useState<MaterialType>("OTHER");

  if (isLoading) {
    return (
      <div className="container-page max-w-3xl py-6">
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (isError || !idea) {
    return (
      <div className="container-page py-16">
        <EmptyState icon={Lightbulb} title="Big Idea not found" />
      </div>
    );
  }

  async function handleUpload(file: File) {
    try {
      await bigIdeasApi.addSupportingMaterial(id, file, materialType);
      await queryClient.invalidateQueries({ queryKey: bigIdeaKeys.detail(id) });
      toast.success("Supporting material uploaded");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    }
  }

  return (
    <div className="container-page max-w-3xl py-6">
      <Card className="animate-fade-in-up overflow-hidden">
        <div className="relative h-32 w-full bg-gradient-to-br from-primary-400 to-primary-600">
          <div className="absolute inset-0 flex items-center justify-center">
            <Lightbulb className="size-10 text-white/90" />
          </div>
        </div>
        <CardHeader className="flex-row items-start justify-between space-y-0 pb-0">
          <div>
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <StatusBadge status={idea.status} />
              <Badge variant="secondary" className="text-[11px] uppercase tracking-wide">
                {formatEnumLabel(idea.stage)}
              </Badge>
            </div>
            <CardTitle className="text-2xl">{idea.ideaName}</CardTitle>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() =>
              deleteMutation.mutate(id, {
                onSuccess: () => {
                  toast.success("Idea deleted");
                  router.replace("/big-ideas");
                },
                onError: () => toast.error("Couldn't delete"),
              })
            }
          >
            <Trash2 className="size-4 text-error" />
          </Button>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-3 rounded-lg bg-muted/50 px-3 py-2 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <User className="size-3.5" /> {idea.applicant.fullName}
            </span>
            {idea.applicant.location && (
              <span className="flex items-center gap-1.5">
                <MapPin className="size-3.5" /> {idea.applicant.location}
              </span>
            )}
            <span className="rounded-full bg-background px-2 py-0.5 text-xs">
              {formatEnumLabel(idea.applicant.submissionType)}
            </span>
          </div>

          <p className="text-base font-medium leading-relaxed">{idea.oneLineDescription}</p>
          <p className="text-sm leading-relaxed text-muted-foreground">{idea.description}</p>

          <div className="grid gap-3 sm:grid-cols-2">
            {DETAIL_SECTIONS.map(({ label, key }) => {
              const value = idea[key];
              if (!value) return null;
              return (
                <div key={key} className="rounded-lg border border-border p-3">
                  <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
                  <p className="text-sm leading-relaxed">{String(value)}</p>
                </div>
              );
            })}
          </div>

          {idea.status === "DECLINED" && idea.declineReason && (
            <div className="rounded-lg bg-error/10 p-3 text-sm text-error">
              <p className="mb-1 font-medium">Decline reason</p>
              <p>{idea.declineReason}</p>
            </div>
          )}

          <div>
            <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Supporting material
            </p>
            {idea.supportingMaterials.length ? (
              <ul className="flex flex-col gap-1">
                {idea.supportingMaterials.map((material) => (
                  <li key={material.url}>
                    <a
                      href={material.url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1.5 text-sm text-primary-600 hover:underline dark:text-primary-400"
                    >
                      <Paperclip className="size-3.5" />
                      {formatEnumLabel(material.type)} — {material.url.split("/").pop()}
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">None attached yet.</p>
            )}
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <Select value={materialType} onValueChange={(v) => setMaterialType(v as MaterialType)}>
                <SelectTrigger className="w-44">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MATERIAL_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {formatEnumLabel(type)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])}
              />
              <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                <Paperclip className="size-4" /> Attach file
              </Button>
            </div>
          </div>

          {/* TODO(backend): UserInfo has no role field in the API catalog, so
              there's no way to check "is this viewer actually a moderator"
              client-side yet. These actions are left visible to any logged-in
              user rather than hidden behind a guess at a role system - gate
              this properly once the gateway exposes roles/permissions. Also
              note: moderation.decline sends { note } but the backend's
              DeclineIdeaDto requires a non-blank `reason` field - this action
              needs a reason-prompt UI + a field-name fix before it'll work. */}
          <div className="flex flex-wrap gap-2 border-t border-border pt-4">
            <Button variant="outline" size="sm" onClick={() => moderation.review.mutate(undefined, { onError: () => toast.error("Failed") })}>
              <Eye className="size-4" /> Mark in review
            </Button>
            <Button size="sm" onClick={() => moderation.approve.mutate(undefined, { onError: () => toast.error("Failed") })}>
              <CheckCircle2 className="size-4" /> Approve
            </Button>
            <Button variant="destructive" size="sm" onClick={() => moderation.decline.mutate(undefined, { onError: () => toast.error("Failed") })}>
              <XCircle className="size-4" /> Decline
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
