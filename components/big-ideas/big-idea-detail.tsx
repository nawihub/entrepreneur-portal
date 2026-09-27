"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";
import { CheckCircle2, Clock, Download, Loader2, Lock, Paperclip, Lightbulb, MapPin, Send, User } from "lucide-react";
import { useQueryClient, type UseQueryResult } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/empty-state";
import { IdeaStatusBadge } from "@/components/feed/idea-status-badge";
import { STAGE_COVERS } from "@/components/feed/big-idea-card";
import { formatEnumLabel } from "@/lib/utils";
import { bigIdeaKeys, usePublishBigIdea } from "@/lib/queries/big-ideas";
import { bigIdeasApi } from "@/lib/api/big-ideas";
import { fileNameFor, saveBlob } from "@/lib/save-blob";
import type { BigIdea, BigIdeaStatus, MaterialType } from "@/lib/api/types";

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

/** Materials can be added only before moderation starts - big-idea-service enforces the same rule. */
const ACCEPTS_MATERIALS: BigIdeaStatus[] = ["PENDING", "PUBLISHED"];

/**
 * A big idea's detail view.
 *
 * @param owned rendered on the owner's own route (/big-ideas/mine/[id]): shows the lifecycle
 *              panel and lets them attach materials. The public route only ever gets approved ideas.
 */
export function BigIdeaDetail({ query, owned }: { query: UseQueryResult<BigIdea>; owned: boolean }) {
  const { data: idea, isLoading, isError } = query;

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
        <EmptyState
          icon={Lightbulb}
          title="Big Idea not found"
          description={owned ? "It may have been removed, or the link is wrong." : "It may not be approved yet, or the link is wrong."}
        />
      </div>
    );
  }

  return (
    <div className="container-page max-w-3xl py-6">
      {owned && <OwnerStatusPanel idea={idea} />}

      <Card className="animate-fade-in-up overflow-hidden">
        <div className="relative h-32 w-full overflow-hidden">
          <div className={`tile-pattern absolute inset-0 animate-hero-zoom bg-gradient-to-br ${STAGE_COVERS[idea.stage] ?? STAGE_COVERS.CONCEPT_ONLY}`} />
          <div className="absolute inset-0 flex items-center justify-center">
            <Lightbulb className="float-slow size-10 text-white/90 drop-shadow" />
          </div>
        </div>
        <CardHeader className="pb-0">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            {owned && <IdeaStatusBadge status={idea.status} />}
            <Badge variant="outline" className="text-[11px] uppercase tracking-wide">
              {formatEnumLabel(idea.stage)}
            </Badge>
          </div>
          <CardTitle className="text-2xl">{idea.ideaName}</CardTitle>
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
            {DETAIL_SECTIONS.filter(({ key }) => idea[key]).map(({ label, key }, index) => {
              const value = idea[key];
              return (
                <div
                  key={key}
                  className="stagger-in rounded-lg border border-border p-3 transition-colors hover:border-primary-300 dark:hover:border-primary-700"
                  style={{ "--stagger": index + 2 } as React.CSSProperties}
                >
                  <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
                  <p className="text-sm leading-relaxed">{String(value)}</p>
                </div>
              );
            })}
          </div>

          {owned && idea.status === "DECLINED" && idea.declineReason && (
            <div className="rounded-lg bg-error/10 p-3 text-sm text-error">
              <p className="mb-1 font-medium">Decline reason</p>
              <p>{idea.declineReason}</p>
            </div>
          )}

          <SupportingMaterials idea={idea} canAttach={owned && ACCEPTS_MATERIALS.includes(idea.status)} />
        </CardContent>
      </Card>
    </div>
  );
}

/** "Pitch deck", or "Pitch deck 2" when the idea has several materials of that type. */
function materialLabel(idea: BigIdea, index: number) {
  const type = idea.supportingMaterials[index].type;
  const sameType = idea.supportingMaterials.filter((m) => m.type === type);
  const base = formatEnumLabel(type);
  if (sameType.length < 2) return base;
  return `${base} ${sameType.indexOf(idea.supportingMaterials[index]) + 1}`;
}

/** Where the owner's idea is in its lifecycle, and what they can do next. */
function OwnerStatusPanel({ idea }: { idea: BigIdea }) {
  const publish = usePublishBigIdea();

  const content: Record<BigIdeaStatus, { icon: React.ElementType; title: string; body: string; tone: string }> = {
    PENDING: {
      icon: Lightbulb,
      title: "Draft — only you can see this",
      body: "Add your pitch deck, business plan or photos below, then publish it to submit it for review.",
      tone: "border-primary-200 bg-primary-50 dark:border-primary-800 dark:bg-primary-900/30",
    },
    PUBLISHED: {
      icon: Send,
      title: "Submitted for review",
      body: "Our team will pick it up soon. You can still add supporting materials until the review starts.",
      tone: "border-info/30 bg-info/10",
    },
    IN_REVIEW: {
      icon: Clock,
      title: "In review",
      body: "Supporting materials are locked while your idea is being reviewed.",
      tone: "border-warning/30 bg-warning/10",
    },
    APPROVED: {
      icon: CheckCircle2,
      title: "Approved",
      body: "Your idea is now visible to everyone on NaWeHub.",
      tone: "border-success/30 bg-success/10",
    },
    DECLINED: {
      icon: Lock,
      title: "Declined",
      body: "See the reason below. You're welcome to pitch an improved version as a new idea.",
      tone: "border-error/30 bg-error/10",
    },
  };
  const { icon: Icon, title, body, tone } = content[idea.status];

  return (
    <div className={`mb-4 flex flex-col gap-3 rounded-xl border p-4 sm:flex-row sm:items-center ${tone}`}>
      <Icon className="size-5 shrink-0" />
      <div className="flex-1">
        <p className="font-display font-semibold">{title}</p>
        <p className="text-sm text-muted-foreground">{body}</p>
      </div>
      {idea.status === "PENDING" && (
        <Button
          disabled={publish.isPending}
          onClick={() =>
            publish.mutate(idea.id, {
              onSuccess: () => toast.success("Published - your idea has been submitted for review"),
              onError: (err) => toast.error(err instanceof Error ? err.message : "Couldn't publish your idea"),
            })
          }
        >
          {publish.isPending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
          Publish for review
        </Button>
      )}
    </div>
  );
}

function SupportingMaterials({ idea, canAttach }: { idea: BigIdea; canAttach: boolean }) {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [materialType, setMaterialType] = useState<MaterialType>("PITCH_DECK");
  const [uploading, setUploading] = useState(false);
  const [downloading, setDownloading] = useState<string | null>(null);

  async function handleDownload(materialId: string, url: string, label: string) {
    setDownloading(materialId);
    try {
      const blob = await bigIdeasApi.downloadSupportingMaterial(url);
      saveBlob(blob, fileNameFor(label, blob));
    } catch {
      toast.error("Couldn't download this file. Try again in a moment.");
    } finally {
      setDownloading(null);
    }
  }

  async function handleUpload(file: File) {
    setUploading(true);
    try {
      await bigIdeasApi.addSupportingMaterial(idea.id, file, materialType);
      await queryClient.invalidateQueries({ queryKey: bigIdeaKeys.all });
      toast.success("Supporting material uploaded");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  return (
    <div>
      <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Supporting material</p>
      {idea.supportingMaterials.length ? (
        <ul className="flex flex-col gap-1.5">
          {idea.supportingMaterials.map((material, index) => {
            const label = materialLabel(idea, index);
            return (
              <li key={material.id} className="flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-2 text-sm">
                <span className="flex min-w-0 items-center gap-2">
                  <Paperclip className="size-3.5 shrink-0 text-muted-foreground" />
                  <span className="truncate">{label}</span>
                  <span className="hidden shrink-0 text-xs text-muted-foreground sm:inline">
                    {new Date(material.uploadedAt).toLocaleDateString(undefined, { dateStyle: "medium" })}
                  </span>
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={downloading === material.id}
                  onClick={() => handleDownload(material.id, material.url, label)}
                  aria-label={`Download ${label}`}
                >
                  {downloading === material.id ? <Loader2 className="size-4 animate-spin" /> : <Download className="size-4" />}
                  <span className="hidden sm:inline">Download</span>
                </Button>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="text-sm text-muted-foreground">None attached yet.</p>
      )}
      {canAttach && (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <Select value={materialType} onValueChange={(v) => setMaterialType(v as MaterialType)}>
            <SelectTrigger className="w-44" aria-label="Material type">
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
          <Button variant="outline" size="sm" disabled={uploading} onClick={() => fileInputRef.current?.click()}>
            {uploading ? <Loader2 className="size-4 animate-spin" /> : <Paperclip className="size-4" />} Attach file
          </Button>
        </div>
      )}
    </div>
  );
}
