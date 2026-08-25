import Link from "next/link";
import Image from "next/image";
import { HandCoins, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/status-badge";
import { formatMoney } from "@/lib/format-money";
import { cn } from "@/lib/utils";
import type { Opportunity } from "@/lib/api/types";

function daysUntil(deadline: string) {
  const ms = new Date(deadline).getTime() - Date.now();
  return Math.ceil(ms / (1000 * 60 * 60 * 24));
}

export function OpportunityCard({ opportunity }: { opportunity: Opportunity }) {
  const daysLeft = opportunity.deadline ? daysUntil(opportunity.deadline) : null;
  const isUrgent = daysLeft !== null && daysLeft >= 0 && daysLeft <= 7;

  return (
    <Card className="card-interactive animate-fade-in-up overflow-hidden">
      <div className="flex gap-4 p-5">
        {opportunity.flierUrl ? (
          <Image
            src={opportunity.flierUrl}
            alt=""
            width={80}
            height={80}
            className="size-20 shrink-0 rounded-xl object-cover ring-1 ring-border"
          />
        ) : (
          <div className="flex size-20 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-secondary-400 to-secondary-600 text-white shadow-secondary">
            <HandCoins className="size-7" />
          </div>
        )}
        <CardContent className="min-w-0 flex-1 space-y-1.5 p-0">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-semibold uppercase tracking-wide text-secondary-600 dark:text-secondary-400">
              {opportunity.category ?? "Opportunity"}
            </span>
            <StatusBadge status={opportunity.status} />
          </div>
          <Link
            href={`/opportunities/${opportunity.id}`}
            className="block font-display text-lg font-semibold leading-snug hover:underline"
          >
            {opportunity.title}
          </Link>
          {opportunity.organization && (
            <p className="truncate text-sm text-muted-foreground">{opportunity.organization}</p>
          )}
          <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-muted-foreground">
            {opportunity.amount && (
              <span className="font-medium text-foreground">{formatMoney(opportunity.amount)}</span>
            )}
            {opportunity.deadline && (
              <span className={cn("flex items-center gap-1", isUrgent && "font-medium text-error")}>
                <Clock className="size-3" />
                {daysLeft !== null && daysLeft >= 0
                  ? daysLeft === 0
                    ? "Closes today"
                    : `${daysLeft}d left`
                  : "Deadline passed"}
              </span>
            )}
          </div>
        </CardContent>
      </div>
    </Card>
  );
}
