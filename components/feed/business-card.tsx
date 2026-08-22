import Link from "next/link";
import { Building2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/status-badge";
import type { Business } from "@/lib/api/types";

export function BusinessCard({ business }: { business: Business }) {
  return (
    <Card className="card-interactive animate-fade-in-up">
      <CardContent className="flex flex-col gap-2.5 pt-6">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2 text-primary-600 dark:text-primary-400">
            <Building2 className="size-4" />
            <span className="text-xs font-medium uppercase tracking-wide">Business</span>
          </div>
          <StatusBadge status={business.status} />
        </div>
        <Link href={`/businesses/${business.id}`} className="font-display text-lg font-semibold hover:underline">
          {business.name}
        </Link>
        {business.description && <p className="line-clamp-2 text-sm text-muted-foreground">{business.description}</p>}
        <div className="flex flex-wrap gap-2 pt-0.5 text-xs text-muted-foreground">
          {business.sector && <span className="rounded-full bg-muted px-2.5 py-0.5">{business.sector}</span>}
          {business.district && <span className="rounded-full bg-muted px-2.5 py-0.5">{business.district}</span>}
        </div>
      </CardContent>
    </Card>
  );
}
