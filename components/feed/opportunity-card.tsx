import Link from "next/link";
import Image from "next/image";
import { HandCoins, Clock, Globe2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/status-badge";
import { cn } from "@/lib/utils";
import { OPPORTUNITY_CATEGORIES, OPPORTUNITY_SCOPES, labelFor } from "@/lib/data/filter-options";
import type { Opportunity } from "@/lib/api/types";

function daysUntil(deadline: string) {
  const ms = new Date(deadline).getTime() - Date.now();
  return Math.ceil(ms / (1000 * 60 * 60 * 24));
}

function deadlineLabel(daysLeft: number) {
  if (daysLeft < 0) return "Deadline passed";
  if (daysLeft === 0) return "Closes today";
  if (daysLeft === 1) return "1 day left";
  return `${daysLeft} days left`;
}

/**
 * @param showStatus public listings only ever contain approved opportunities, so the status
 *                   badge is noise there - only show it where statuses actually vary.
 */
export function OpportunityCard({ opportunity, showStatus = false }: { opportunity: Opportunity; showStatus?: boolean }) {
  const daysLeft = opportunity.deadline ? daysUntil(opportunity.deadline) : null;
  const isUrgent = daysLeft !== null && daysLeft >= 0 && daysLeft <= 7;
  const categories = opportunity.categories.map((c) =>
    c === "OTHER" && opportunity.categoryOther ? opportunity.categoryOther : labelFor(OPPORTUNITY_CATEGORIES, c),
  );

  return (
    <Card className="card-interactive group relative animate-fade-in-up overflow-hidden focus-within:ring-2 focus-within:ring-ring">
      <div className="flex gap-4 p-4 sm:p-5">
        {opportunity.flierUrl ? (
          <Image
            src={opportunity.flierUrl}
            alt=""
            width={56}
            height={56}
            className="size-12 shrink-0 rounded-xl object-cover ring-1 ring-border sm:size-14"
          />
        ) : (
          <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-secondary-100 text-secondary-700 sm:size-14 dark:bg-secondary-900/50 dark:text-secondary-300">
            <HandCoins className="size-6" />
          </div>
        )}
        <div className="min-w-0 flex-1 space-y-1.5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="truncate text-xs font-semibold uppercase tracking-wide text-secondary-700 dark:text-secondary-400">
              {categories.length ? categories.slice(0, 2).join(" · ") : "Opportunity"}
              {categories.length > 2 && ` +${categories.length - 2}`}
            </span>
            {showStatus && <StatusBadge status={opportunity.status} />}
          </div>
          <Link
            href={`/opportunities/${opportunity.id}`}
            className="block font-display text-lg font-semibold leading-snug outline-none after:absolute after:inset-0 after:content-[''] group-hover:text-secondary-700 dark:group-hover:text-secondary-300"
          >
            {opportunity.title}
          </Link>
          {opportunity.organizationName && (
            <p className="truncate text-sm text-muted-foreground">{opportunity.organizationName}</p>
          )}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 pt-1 text-xs text-muted-foreground">
            {daysLeft !== null && (
              <span className={cn("flex items-center gap-1", isUrgent && "font-medium text-error", daysLeft < 0 && "line-through")}>
                <Clock className="size-3" /> {deadlineLabel(daysLeft)}
              </span>
            )}
            {opportunity.geographicScope && (
              <span className="flex items-center gap-1">
                <Globe2 className="size-3" />
                {opportunity.geographicScope === "OTHER" && opportunity.geographicScopeOther
                  ? opportunity.geographicScopeOther
                  : labelFor(OPPORTUNITY_SCOPES, opportunity.geographicScope)}
              </span>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
