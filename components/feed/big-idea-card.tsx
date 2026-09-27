import Link from "next/link";
import { Lightbulb, MapPin, Users } from "lucide-react";
import { Card } from "@/components/ui/card";
import { IdeaStatusBadge } from "@/components/feed/idea-status-badge";
import { IDEA_STAGES, IDEA_SUBMISSION_TYPES, labelFor } from "@/lib/data/filter-options";
import type { BigIdea } from "@/lib/api/types";

/**
 * @param owned the card is in the owner's own list: statuses vary there (public listings only
 *              ever contain approved ideas), and it links to the owner's view of the idea.
 */
export function BigIdeaCard({ idea, owned = false }: { idea: BigIdea; owned?: boolean }) {
  return (
    <Card className="card-interactive group relative animate-fade-in-up overflow-hidden focus-within:ring-2 focus-within:ring-ring">
      <div className="flex gap-4 p-4 sm:p-5">
        <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary-100 text-primary-700 sm:size-14 dark:bg-primary-900/50 dark:text-primary-300">
          <Lightbulb className="size-6" />
        </div>
        <div className="min-w-0 flex-1 space-y-1.5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-semibold uppercase tracking-wide text-primary-700 dark:text-primary-400">
              {labelFor(IDEA_STAGES, idea.stage)}
            </span>
            {owned && <IdeaStatusBadge status={idea.status} />}
          </div>
          {/* Stretched link: the title's ::after covers the whole card, so the card is one
              link target without nesting interactive elements inside an <a>. */}
          <Link
            href={owned ? `/big-ideas/mine/${idea.id}` : `/big-ideas/${idea.id}`}
            className="block font-display text-lg font-semibold leading-snug outline-none after:absolute after:inset-0 after:content-[''] group-hover:text-primary-700 dark:group-hover:text-primary-300"
          >
            {idea.ideaName}
          </Link>
          <p className="line-clamp-2 text-sm text-muted-foreground">{idea.oneLineDescription}</p>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 pt-1 text-xs text-muted-foreground">
            <span className="font-medium text-foreground/80">{idea.applicant.fullName}</span>
            {idea.applicant.location && (
              <span className="flex items-center gap-1">
                <MapPin className="size-3" /> {idea.applicant.location}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Users className="size-3" /> {labelFor(IDEA_SUBMISSION_TYPES, idea.applicant.submissionType)}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}
