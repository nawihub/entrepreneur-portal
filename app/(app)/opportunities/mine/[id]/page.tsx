"use client";

import { use, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ArrowLeft, Building2, CheckCircle2, Clock, ExternalLink, Globe2, HandCoins, Hourglass, Loader2, Mail, PencilLine, Phone, Send, Trash2, XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/empty-state";
import { StatusBadge } from "@/components/status-badge";
import { formatEnumLabel, cn } from "@/lib/utils";
import { useDeleteOpportunity, useMyOpportunity, useMyOpportunityFlier, usePublishOpportunity } from "@/lib/queries/opportunities";
import type { Opportunity } from "@/lib/api/types";

const STAGES: Record<string, { icon: typeof Clock; tone: string; title: string; body: string }> = {
  DRAFT: { icon: PencilLine, tone: "border-border bg-muted/50", title: "Draft - only you can see this",
    body: "Check the details, then publish it to send it to the NaWeHub team for review." },
  PENDING: { icon: Hourglass, tone: "border-info/30 bg-info/5", title: "Awaiting review",
    body: "Thanks! The NaWeHub team will review it before it's published." },
  IN_REVIEW: { icon: Hourglass, tone: "border-warning/30 bg-warning/5", title: "In review",
    body: "The NaWeHub team is reviewing it now." },
  APPROVED: { icon: CheckCircle2, tone: "border-success/30 bg-success/5", title: "Live",
    body: "It's published and entrepreneurs can find it on NaWeHub." },
  DECLINED: { icon: XCircle, tone: "border-error/30 bg-error/5", title: "Not approved",
    body: "See the reason below. You're welcome to post an improved version." },
};

function Flier({ opportunity }: { opportunity: Opportunity }) {
  const { data } = useMyOpportunityFlier(opportunity.id, Boolean(opportunity.flierUrl));
  const url = useMemo(() => (data && data.type.startsWith("image/") ? URL.createObjectURL(data) : null), [data]);
  useEffect(() => () => { if (url) URL.revokeObjectURL(url); }, [url]);
  return (
    <div className="tile-pattern relative h-56 w-full overflow-hidden bg-gradient-to-br from-secondary-400 to-secondary-600">
      {url ? (
        // eslint-disable-next-line @next/next/no-img-element -- object URL of an authenticated download
        <img src={url} alt="" className="animate-hero-zoom absolute inset-0 size-full object-cover" />
      ) : (
        <HandCoins className="absolute right-6 top-6 size-16 text-white/30" aria-hidden />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 flex flex-col gap-2 p-5">
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge status={opportunity.status} className="bg-card/95 shadow-sm" />
          {opportunity.categories.map((c) => (
            <span key={c} className="rounded-full bg-white/15 px-2.5 py-0.5 text-xs font-medium text-white backdrop-blur-sm">
              {c === "OTHER" && opportunity.categoryOther ? opportunity.categoryOther : formatEnumLabel(c)}
            </span>
          ))}
        </div>
        <CardTitle className="text-2xl text-white drop-shadow-sm">{opportunity.title}</CardTitle>
      </div>
    </div>
  );
}

/** The owner's view of their own opportunity, in any status - with publish and delete. */
export default function MyOpportunityPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { data: opportunity, isLoading, isError } = useMyOpportunity(id);
  const publish = usePublishOpportunity();
  const remove = useDeleteOpportunity();
  const [confirmDelete, setConfirmDelete] = useState(false);

  if (isLoading) {
    return (
      <div className="container-page max-w-3xl py-6">
        <Skeleton className="h-96" />
      </div>
    );
  }
  if (isError || !opportunity) {
    return (
      <div className="container-page py-16">
        <EmptyState icon={HandCoins} title="Opportunity not found" description="It may have been deleted, or it isn't yours." />
      </div>
    );
  }

  const stage = STAGES[opportunity.status] ?? STAGES.PENDING;
  const scope = opportunity.geographicScope === "OTHER" && opportunity.geographicScopeOther
    ? opportunity.geographicScopeOther
    : opportunity.geographicScope ? formatEnumLabel(opportunity.geographicScope) : null;

  return (
    <div className="container-page max-w-3xl py-6">
      <Link href="/opportunities?view=mine" className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> My opportunities
      </Link>

      <div className={cn("animate-fade-in-up mb-5 flex flex-wrap items-center gap-4 rounded-2xl border p-4", stage.tone)}>
        <stage.icon className="size-6 shrink-0 text-muted-foreground" />
        <div className="min-w-0 flex-1">
          <p className="font-semibold">{stage.title}</p>
          <p className="text-sm text-muted-foreground">{stage.body}</p>
        </div>
        <div className="flex gap-2">
          {opportunity.status === "DRAFT" && (
            <Button
              disabled={publish.isPending}
              onClick={() => publish.mutate(opportunity.id, {
                onSuccess: () => toast.success("Submitted for review", { description: "We'll let you know once it's live." }),
                onError: (err) => toast.error(err instanceof Error ? err.message : "Couldn't publish it"),
              })}
            >
              {publish.isPending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />} Publish
            </Button>
          )}
          {opportunity.status === "APPROVED" && (
            <Button variant="outline" asChild>
              <Link href={`/opportunities/${opportunity.id}`}><ExternalLink className="size-4" /> View public page</Link>
            </Button>
          )}
          <Button variant="ghost" size="icon" aria-label="Delete" onClick={() => setConfirmDelete(true)}>
            <Trash2 className="size-4 text-error" />
          </Button>
        </div>
      </div>

      <Card className="animate-fade-in-up overflow-hidden [animation-delay:60ms] [animation-fill-mode:both]">
        <Flier opportunity={opportunity} />
        <CardHeader className="pb-0">
          {opportunity.organizationName && (
            <p className="flex items-center gap-1.5 text-muted-foreground"><Building2 className="size-4" /> {opportunity.organizationName}</p>
          )}
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-wrap gap-3">
            {opportunity.deadline && (
              <span className="flex items-center gap-1.5 rounded-full bg-muted px-3 py-1.5 text-sm text-muted-foreground">
                <Clock className="size-4" /> Deadline {new Date(opportunity.deadline).toLocaleDateString()}
              </span>
            )}
            {scope && (
              <span className="flex items-center gap-1.5 rounded-full bg-muted px-3 py-1.5 text-sm text-muted-foreground">
                <Globe2 className="size-4" /> {scope}
              </span>
            )}
          </div>
          <p className="whitespace-pre-line text-sm leading-relaxed">{opportunity.description}</p>
          {opportunity.eligibilityCriteria && (
            <div className="rounded-lg border border-border p-3">
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Eligibility</p>
              <p className="text-sm leading-relaxed">{opportunity.eligibilityCriteria}</p>
            </div>
          )}
          <div className="flex flex-wrap items-center gap-4 rounded-lg bg-muted/50 px-3 py-2 text-sm text-muted-foreground">
            {opportunity.contactInfo?.email && <span className="flex items-center gap-1.5"><Mail className="size-3.5" /> {opportunity.contactInfo.email}</span>}
            {opportunity.contactInfo?.phone && <span className="flex items-center gap-1.5"><Phone className="size-3.5" /> {opportunity.contactInfo.phone}</span>}
          </div>
          {opportunity.status === "DECLINED" && opportunity.declineReason && (
            <div className="rounded-lg bg-error/10 p-3 text-sm text-error">
              <p className="mb-1 font-medium">Reason</p>
              <p>{opportunity.declineReason}</p>
            </div>
          )}
          {opportunity.applicationLink && (
            <a href={opportunity.applicationLink} target="_blank" rel="noreferrer" className="inline-flex w-fit items-center gap-1.5 text-sm font-medium text-primary-600 hover:underline dark:text-primary-400">
              <ExternalLink className="size-4" /> {opportunity.applicationLink}
            </a>
          )}
        </CardContent>
      </Card>

      <Dialog open={confirmDelete} onOpenChange={(open) => !remove.isPending && setConfirmDelete(open)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete this opportunity?</DialogTitle>
            <DialogDescription>
              {opportunity.status === "APPROVED" ? "It's removed from NaWeHub for everyone. " : ""}This can&apos;t be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setConfirmDelete(false)}>Cancel</Button>
            <Button
              variant="destructive"
              disabled={remove.isPending}
              onClick={() => remove.mutate(opportunity.id, {
                onSuccess: () => { toast.success("Opportunity deleted"); router.replace("/opportunities?view=mine"); },
                onError: (err) => toast.error(err instanceof Error ? err.message : "Couldn't delete it"),
              })}
            >
              {remove.isPending && <Loader2 className="size-4 animate-spin" />} Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
