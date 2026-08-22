import Link from "next/link";
import Image from "next/image";
import { HandCoins, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { formatMoney } from "@/lib/format-money";
import type { Opportunity } from "@/lib/api/types";

export function OpportunityCard({ opportunity }: { opportunity: Opportunity }) {
  return (
    <Card className="card-interactive animate-fade-in-up overflow-hidden">
      <div className="flex gap-4 p-5">
        {opportunity.flierUrl ? (
          <Image
            src={opportunity.flierUrl}
            alt=""
            width={72}
            height={72}
            className="size-18 shrink-0 rounded-lg object-cover"
          />
        ) : (
          <div className="flex size-18 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-secondary-400 to-secondary-600 text-white">
            <HandCoins className="size-6" />
          </div>
        )}
        <CardContent className="flex-1 space-y-1.5 p-0">
          <div className="flex items-center gap-2 text-secondary-600 dark:text-secondary-400">
            <span className="text-xs font-medium uppercase tracking-wide">
              {opportunity.category ?? "Opportunity"}
            </span>
          </div>
          <Link href={`/opportunities/${opportunity.id}`} className="font-display font-semibold hover:underline">
            {opportunity.title}
          </Link>
          {opportunity.organization && (
            <p className="text-sm text-muted-foreground">{opportunity.organization}</p>
          )}
          <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-muted-foreground">
            {opportunity.amount && <span className="font-medium text-foreground">{formatMoney(opportunity.amount)}</span>}
            {opportunity.deadline && (
              <span className="flex items-center gap-1">
                <Clock className="size-3" /> Due {new Date(opportunity.deadline).toLocaleDateString()}
              </span>
            )}
          </div>
        </CardContent>
      </div>
    </Card>
  );
}
