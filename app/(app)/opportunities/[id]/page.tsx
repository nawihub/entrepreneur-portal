"use client";

import { use } from "react";
import Image from "next/image";
import { HandCoins, Clock, Building2, Mail, Phone, Globe2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/status-badge";
import { EmptyState } from "@/components/empty-state";
import { formatEnumLabel } from "@/lib/utils";
import { useOpportunity } from "@/lib/queries/opportunities";

export default function OpportunityDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: opportunity, isLoading, isError } = useOpportunity(id);

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
        <div className="relative h-56 w-full bg-gradient-to-br from-secondary-400 to-secondary-600">
          {opportunity.flierUrl && (
            <Image src={opportunity.flierUrl} alt="" fill className="object-cover" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 flex flex-col gap-2 p-5">
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge status={opportunity.status} />
              {opportunity.categories.map((category) => (
                <span
                  key={category}
                  className="rounded-full bg-white/15 px-2.5 py-0.5 text-xs font-medium text-white backdrop-blur-sm"
                >
                  {category === "OTHER" && opportunity.categoryOther
                    ? opportunity.categoryOther
                    : formatEnumLabel(category)}
                </span>
              ))}
            </div>
            <CardTitle className="text-2xl text-white drop-shadow-sm">{opportunity.title}</CardTitle>
          </div>
        </div>
        <CardHeader className="pb-0">
          {opportunity.organizationName && (
            <p className="flex items-center gap-1.5 text-muted-foreground">
              <Building2 className="size-4" /> {opportunity.organizationName}
            </p>
          )}
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-wrap gap-3">
            {opportunity.deadline && (
              <span className="flex items-center gap-1.5 rounded-full bg-muted px-3 py-1.5 text-sm text-muted-foreground">
                <Clock className="size-4" /> Deadline {new Date(opportunity.deadline).toLocaleDateString()}
              </span>
            )}
            {opportunity.geographicScope && (
              <span className="flex items-center gap-1.5 rounded-full bg-muted px-3 py-1.5 text-sm text-muted-foreground">
                <Globe2 className="size-4" />
                {opportunity.geographicScope === "OTHER" && opportunity.geographicScopeOther
                  ? opportunity.geographicScopeOther
                  : formatEnumLabel(opportunity.geographicScope)}
              </span>
            )}
          </div>

          {opportunity.description && (
            <p className="whitespace-pre-line text-sm leading-relaxed">{opportunity.description}</p>
          )}

          {opportunity.eligibilityCriteria && (
            <div className="rounded-lg border border-border p-3">
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Eligibility
              </p>
              <p className="text-sm leading-relaxed">{opportunity.eligibilityCriteria}</p>
            </div>
          )}

          {(opportunity.contactInfo?.email || opportunity.contactInfo?.phone) && (
            <div className="flex flex-wrap items-center gap-4 rounded-lg bg-muted/50 px-3 py-2 text-sm text-muted-foreground">
              {opportunity.contactInfo.email && (
                <span className="flex items-center gap-1.5">
                  <Mail className="size-3.5" /> {opportunity.contactInfo.email}
                </span>
              )}
              {opportunity.contactInfo.phone && (
                <span className="flex items-center gap-1.5">
                  <Phone className="size-3.5" /> {opportunity.contactInfo.phone}
                </span>
              )}
            </div>
          )}

          {opportunity.status === "DECLINED" && opportunity.declineReason && (
            <div className="rounded-lg bg-error/10 p-3 text-sm text-error">
              <p className="mb-1 font-medium">Decline reason</p>
              <p>{opportunity.declineReason}</p>
            </div>
          )}

          {opportunity.applicationLink && (
            <div className="border-t border-border pt-4">
              <Button asChild className="w-fit">
                <a href={opportunity.applicationLink} target="_blank" rel="noreferrer">
                  <ExternalLink className="size-4" /> Register / apply
                </a>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
