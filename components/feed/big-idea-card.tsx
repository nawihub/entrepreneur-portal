import Link from "next/link";
import { Lightbulb, MapPin } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/status-badge";
import { Badge } from "@/components/ui/badge";
import { formatEnumLabel } from "@/lib/utils";
import type { BigIdea } from "@/lib/api/types";

export function BigIdeaCard({ idea }: { idea: BigIdea }) {
  return (
    <Card className="card-interactive animate-fade-in-up overflow-hidden">
      <div className="flex gap-4 p-5">
        <div className="flex size-20 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 text-white shadow-primary">
          <Lightbulb className="size-7" />
        </div>
        <CardContent className="min-w-0 flex-1 space-y-1.5 p-0">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <Badge variant="secondary" className="text-[11px] uppercase tracking-wide">
              {formatEnumLabel(idea.stage)}
            </Badge>
            <StatusBadge status={idea.status} />
          </div>
          <Link
            href={`/big-ideas/${idea.id}`}
            className="block font-display text-lg font-semibold leading-snug hover:underline"
          >
            {idea.ideaName}
          </Link>
          <p className="line-clamp-2 text-sm text-muted-foreground">{idea.oneLineDescription}</p>
          <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-muted-foreground">
            <span>{idea.applicant.fullName}</span>
            {idea.applicant.location && (
              <span className="flex items-center gap-1">
                <MapPin className="size-3" /> {idea.applicant.location}
              </span>
            )}
            <span className="rounded-full bg-muted px-2 py-0.5">
              {formatEnumLabel(idea.applicant.submissionType)}
            </span>
          </div>
        </CardContent>
      </div>
    </Card>
  );
}
