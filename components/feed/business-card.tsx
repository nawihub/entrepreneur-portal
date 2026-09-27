import Link from "next/link";
import { Building2, MapPin } from "lucide-react";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/status-badge";
import { BUSINESS_CATEGORIES, labelFor } from "@/lib/data/filter-options";
import type { Business } from "@/lib/api/types";

// Businesses shown in the portal are always the caller's own registrations, so the
// registration status is the most important thing on the card and is always shown.
export function BusinessCard({ business }: { business: Business }) {
  return (
    <Card className="card-interactive group relative animate-fade-in-up overflow-hidden focus-within:ring-2 focus-within:ring-ring">
      <div className="flex gap-4 p-4 sm:p-5">
        <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-info/10 text-info sm:size-14">
          <Building2 className="size-6" />
        </div>
        <div className="min-w-0 flex-1 space-y-1.5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="font-mono text-[11px] text-muted-foreground">#{business.trackingId}</span>
            <StatusBadge status={business.status} />
          </div>
          <Link
            href={`/businesses/${business.id}`}
            className="block font-display text-lg font-semibold leading-snug outline-none after:absolute after:inset-0 after:content-[''] group-hover:text-primary-700 dark:group-hover:text-primary-300"
          >
            {business.businessName}
          </Link>
          {business.businessActivities && (
            <p className="line-clamp-2 text-sm text-muted-foreground">{business.businessActivities}</p>
          )}
          <div className="flex flex-wrap items-center gap-2 pt-0.5 text-xs text-muted-foreground">
            <span className="rounded-full bg-muted px-2.5 py-0.5">
              {business.businessCategory === "OTHER" && business.otherCategory
                ? business.otherCategory
                : labelFor(BUSINESS_CATEGORIES, business.businessCategory)}
            </span>
            {business.businessEntityType && (
              <span className="rounded-full bg-muted px-2.5 py-0.5">{business.businessEntityType}</span>
            )}
            {business.businessAddress && (
              <span className="flex min-w-0 items-center gap-1">
                <MapPin className="size-3 shrink-0" /> <span className="truncate">{business.businessAddress}</span>
              </span>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
