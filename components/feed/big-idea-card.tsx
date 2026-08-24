import Link from "next/link";
import { Lightbulb } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/status-badge";
import { formatEnumLabel } from "@/lib/utils";
import type { BigIdea } from "@/lib/api/types";

export function BigIdeaCard({ idea }: { idea: BigIdea }) {
  return (
    <Card className="card-interactive animate-fade-in-up">
      <CardContent className="flex flex-col gap-2.5 pt-6">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2 text-secondary-600 dark:text-secondary-400">
            <Lightbulb className="size-4" />
            <span className="text-xs font-medium uppercase tracking-wide">Big Idea</span>
          </div>
          <StatusBadge status={idea.status} />
        </div>
        <Link href={`/big-ideas/${idea.id}`} className="font-display text-lg font-semibold hover:underline">
          {idea.ideaName}
        </Link>
        <p className="line-clamp-2 text-sm text-muted-foreground">{idea.oneLineDescription}</p>
        <span className="w-fit rounded-full bg-muted px-2.5 py-0.5 text-xs text-muted-foreground">
          {formatEnumLabel(idea.applicant.submissionType)}
        </span>
      </CardContent>
    </Card>
  );
}
