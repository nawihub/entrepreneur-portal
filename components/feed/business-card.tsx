import Link from "next/link";
import { Building2, MapPin } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/status-badge";
import { formatEnumLabel } from "@/lib/utils";
import type { Business } from "@/lib/api/types";

export function BusinessCard({ business }: { business: Business }) {
  return (
    <Card className="card-interactive animate-fade-in-up overflow-hidden">
      <div className="flex gap-4 p-5">
        <div className="flex size-20 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 text-white shadow-primary">
          <Building2 className="size-7" />
        </div>
        <CardContent className="min-w-0 flex-1 space-y-1.5 p-0">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="font-mono text-[11px] text-muted-foreground">#{business.trackingId}</span>
            <StatusBadge status={business.status} />
          </div>
          <Link
            href={`/businesses/${business.id}`}
            className="block font-display text-lg font-semibold leading-snug hover:underline"
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
                : formatEnumLabel(business.businessCategory)}
            </span>
            {business.businessEntityType && (
              <span className="rounded-full bg-muted px-2.5 py-0.5">{business.businessEntityType}</span>
            )}
            {business.businessAddress && (
              <span className="flex items-center gap-1">
                <MapPin className="size-3" /> {business.businessAddress}
              </span>
            )}
          </div>
        </CardContent>
      </div>
    </Card>
  );
}
