import Link from "next/link";
import { ArrowRight, Building, CalendarClock, Globe2, HandCoins } from "lucide-react";
import { Card } from "@/components/ui/card";
import { FadeImage } from "@/components/motion/fade-image";
import { StatusBadge } from "@/components/status-badge";
import { cn } from "@/lib/utils";
import { OPPORTUNITY_CATEGORIES, OPPORTUNITY_SCOPES, labelFor } from "@/lib/data/filter-options";
import type { Opportunity } from "@/lib/api/types";
import { resolveMediaUrl } from "@/lib/media-url";

function daysUntil(deadline: string) {
  const ms = new Date(deadline).getTime() - Date.now();
  return Math.ceil(ms / (1000 * 60 * 60 * 24));
}

function deadlineLabel(daysLeft: number) {
  if (daysLeft < 0) return "Closed";
  if (daysLeft === 0) return "Closes today";
  if (daysLeft === 1) return "1 day left";
  return `${daysLeft} days left`;
}

/**
 * @param showStatus public listings only ever contain approved opportunities, so the status
 *                   badge is noise there - only show it where statuses actually vary.
 * @param owned      the card is in the owner's own list: it shows the status and links to the
 *                   owner's page (drafts and unapproved ones aren't public).
 */
export function OpportunityCard({ opportunity, showStatus = false, owned = false }: { opportunity: Opportunity; showStatus?: boolean; owned?: boolean }) {
  const daysLeft = opportunity.deadline ? daysUntil(opportunity.deadline) : null;
  const isUrgent = daysLeft !== null && daysLeft >= 0 && daysLeft <= 7;
  const categories = opportunity.categories.map((c) =>
    c === "OTHER" && opportunity.categoryOther ? opportunity.categoryOther : labelFor(OPPORTUNITY_CATEGORIES, c),
  );
  // Only approved fliers are public; the owner list shows the branded cover instead.
  const flier = owned && opportunity.status !== "APPROVED" ? null : resolveMediaUrl(opportunity.flierUrl);
  const scope =
    opportunity.geographicScope === "OTHER" && opportunity.geographicScopeOther
      ? opportunity.geographicScopeOther
      : opportunity.geographicScope
        ? labelFor(OPPORTUNITY_SCOPES, opportunity.geographicScope)
        : null;

  return (
    <Card className="card-interactive group @container relative flex h-full flex-col overflow-hidden focus-within:ring-2 focus-within:ring-ring">
      <div className="tile-cover aspect-[16/9]">
        {/* Branded cover - shown on its own, or underneath a flier while it loads (or if it fails). */}
        <div className="tile-cover-media tile-pattern absolute inset-0 flex items-center justify-center bg-gradient-to-br from-secondary-400 via-secondary-500 to-secondary-700">
          <HandCoins className="size-14 text-white/80 drop-shadow-sm transition-transform duration-slower ease-spring group-hover:-rotate-6 group-hover:scale-110" />
        </div>
        {flier && (
          <FadeImage
            src={flier}
            alt=""
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="tile-cover-media object-cover"
          />
        )}
        {/* Keeps the chips legible on busy fliers. */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-transparent to-transparent" />

        <div className="absolute inset-x-3 top-3 z-[2] flex items-start justify-between gap-2">
          <div className="flex min-w-0 flex-wrap gap-1">
            {(categories.length ? categories.slice(0, 2) : ["Opportunity"]).map((c) => (
              <span key={c} className="truncate rounded-full bg-black/35 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur-sm">
                {c}
              </span>
            ))}
            {categories.length > 2 && (
              <span className="rounded-full bg-black/35 px-2 py-1 text-[11px] font-semibold text-white backdrop-blur-sm">+{categories.length - 2}</span>
            )}
          </div>
          {(showStatus || owned) && <StatusBadge status={opportunity.status} className="bg-card/95 shadow-sm" />}
        </div>

        {daysLeft !== null && (
          <span
            className={cn(
              "absolute bottom-3 left-3 z-[2] flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold shadow-sm",
              isUrgent ? "bg-error text-white" : daysLeft < 0 ? "bg-neutral-800/80 text-white/80" : "bg-card/95 text-foreground",
            )}
          >
            {isUrgent ? <span className="pulse-dot relative size-1.5 rounded-full bg-white" aria-hidden /> : <CalendarClock className="size-3" />}
            {deadlineLabel(daysLeft)}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <Link
          href={owned ? `/opportunities/mine/${opportunity.id}` : `/opportunities/${opportunity.id}`}
          className="line-clamp-2 font-display text-lg font-semibold leading-snug outline-none transition-colors after:absolute after:inset-0 after:content-[''] group-hover:text-secondary-700 dark:group-hover:text-secondary-300"
        >
          {opportunity.title}
        </Link>
        {opportunity.organizationName && (
          <p className="flex items-center gap-1.5 truncate text-sm text-muted-foreground">
            <Building className="size-3.5 shrink-0" /> <span className="truncate">{opportunity.organizationName}</span>
          </p>
        )}

        <div className="mt-auto flex items-center justify-between gap-2 border-t border-border/70 pt-3 text-xs text-muted-foreground">
          <span className="flex min-w-0 items-center gap-1">
            {scope && (
              <>
                <Globe2 className="size-3.5 shrink-0" /> <span className="truncate">{scope}</span>
              </>
            )}
          </span>
          <span className="flex shrink-0 items-center gap-1 font-medium text-secondary-700 dark:text-secondary-300">
            {/* The label only fits beside the location on wider tiles (e.g. not in the feed column). */}
            <span className="hidden @[19rem]:inline">View details</span> <ArrowRight className="tile-arrow size-3.5" aria-hidden />
          </span>
        </div>
      </div>
    </Card>
  );
}
