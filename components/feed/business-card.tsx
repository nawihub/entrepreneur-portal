import Link from "next/link";
import { ArrowRight, MapPin } from "lucide-react";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/status-badge";
import { SegmentMeter, gradientFor, initialsOf } from "@/components/feed/tile-parts";
import { BUSINESS_CATEGORIES, labelFor } from "@/lib/data/filter-options";
import { cn } from "@/lib/utils";
import type { Business, BusinessStatus } from "@/lib/api/types";

// How far through registration each status is (submitted -> review -> payment -> approved).
const PROGRESS: Record<BusinessStatus, { step: number; hint: string }> = {
  PENDING: { step: 1, hint: "Submitted - waiting for review" },
  IN_REVIEW: { step: 2, hint: "Being reviewed" },
  PAYMENT_PENDING: { step: 3, hint: "Registration fee due" },
  PROCESSING: { step: 3, hint: "Payment processing" },
  APPROVED: { step: 4, hint: "Registered" },
  REJECTED: { step: 4, hint: "Registration rejected" },
};

// Businesses shown in the portal are always the caller's own registrations, so the
// registration status is the most important thing on the card and is always shown.
export function BusinessCard({ business }: { business: Business }) {
  const progress = PROGRESS[business.status] ?? { step: 1, hint: "" };
  const category =
    business.businessCategory === "OTHER" && business.otherCategory
      ? business.otherCategory
      : labelFor(BUSINESS_CATEGORIES, business.businessCategory);

  return (
    <Card className="card-interactive group relative flex h-full flex-col overflow-hidden focus-within:ring-2 focus-within:ring-ring">
      <div className="tile-cover h-20">
        <div className={cn("tile-cover-media tile-pattern absolute inset-0 bg-gradient-to-br opacity-90", gradientFor(business.businessName))} />
        <div className="relative flex items-start justify-between gap-2 p-3">
          <span className="truncate rounded-full bg-black/20 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur-sm">{category}</span>
          <StatusBadge status={business.status} className="shrink-0 bg-card/95 shadow-sm" />
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3 px-4 pb-4">
        {/* Monogram overlaps the cover like a logo on a banner. */}
        <div className="-mt-7 flex items-end gap-3">
          <span
            aria-hidden
            className={cn(
              "relative z-[2] flex size-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br font-display text-lg font-semibold text-white shadow-md ring-4 ring-card transition-transform duration-slow ease-spring group-hover:-translate-y-1 group-hover:-rotate-3",
              gradientFor(business.businessName),
            )}
          >
            {initialsOf(business.businessName)}
          </span>
          <span className="mb-1 font-mono text-[11px] text-muted-foreground">#{business.trackingId}</span>
        </div>

        <div className="space-y-1">
          <Link
            href={`/businesses/${business.id}`}
            className="line-clamp-2 font-display text-lg font-semibold leading-snug outline-none transition-colors after:absolute after:inset-0 after:content-[''] group-hover:text-primary-700 dark:group-hover:text-primary-300"
          >
            {business.businessName}
          </Link>
          {business.businessActivities && (
            <p className="line-clamp-2 text-sm text-muted-foreground">{business.businessActivities}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <SegmentMeter
            value={progress.step}
            total={4}
            tone={business.status === "REJECTED" ? "error" : business.status === "APPROVED" ? "primary" : "secondary"}
            label={`Registration progress: ${progress.hint}`}
          />
          <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{progress.hint}</p>
        </div>

        <div className="mt-auto flex items-center justify-between gap-2 border-t border-border/70 pt-3 text-xs text-muted-foreground">
          <span className="flex min-w-0 items-center gap-1">
            {business.businessAddress && (
              <>
                <MapPin className="size-3.5 shrink-0" /> <span className="truncate">{business.businessAddress}</span>
              </>
            )}
          </span>
          <ArrowRight className="tile-arrow size-4 shrink-0 text-primary-600 dark:text-primary-400" aria-hidden />
        </div>
      </div>
    </Card>
  );
}
