"use client";

import { use } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { HandCoins, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/status-badge";
import { EmptyState } from "@/components/empty-state";
import { formatMoney } from "@/lib/format-money";
import { useOpportunity, useOpportunityModeration } from "@/lib/queries/opportunities";

export default function OpportunityDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: opportunity, isLoading, isError } = useOpportunity(id);
  const moderation = useOpportunityModeration(id);

  if (isLoading) {
    return (
      <div className="container-page max-w-3xl py-6">
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (isError || !opportunity) {
    return (
      <div className="container-page py-16">
        <EmptyState icon={HandCoins} title="Opportunity not found" />
      </div>
    );
  }

  return (
    <div className="container-page max-w-3xl py-6">
      <Card className="animate-fade-in-up overflow-hidden">
        {opportunity.flierUrl && (
          <div className="relative h-56 w-full bg-muted">
            <Image src={opportunity.flierUrl} alt="" fill className="object-cover" />
          </div>
        )}
        <CardHeader>
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <StatusBadge status={opportunity.status} />
            {opportunity.category && <span className="text-xs text-muted-foreground">{opportunity.category}</span>}
          </div>
          <CardTitle className="text-2xl">{opportunity.title}</CardTitle>
          {opportunity.organization && <p className="text-muted-foreground">{opportunity.organization}</p>}
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-wrap gap-4 text-sm">
            {opportunity.amount && (
              <span className="flex items-center gap-1.5 font-medium">
                <HandCoins className="size-4 text-secondary-500" /> {formatMoney(opportunity.amount)}
              </span>
            )}
            {opportunity.deadline && (
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <Clock className="size-4" /> Deadline {new Date(opportunity.deadline).toLocaleDateString()}
              </span>
            )}
          </div>
          {opportunity.description && <p className="text-sm leading-relaxed">{opportunity.description}</p>}

          {/* TODO(backend): same role-gating caveat as Big Ideas moderation -
              no role field on UserInfo yet to check moderator status. */}
          <div className="flex flex-wrap gap-2 border-t border-border pt-4">
            <Button variant="outline" size="sm" onClick={() => moderation.review.mutate(undefined, { onError: () => toast.error("Failed") })}>
              Mark in review
            </Button>
            <Button size="sm" onClick={() => moderation.approve.mutate(undefined, { onError: () => toast.error("Failed") })}>
              Approve
            </Button>
            <Button variant="destructive" size="sm" onClick={() => moderation.decline.mutate(undefined, { onError: () => toast.error("Failed") })}>
              Decline
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
