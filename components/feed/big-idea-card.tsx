import Link from "next/link";
import { ArrowRight, Lightbulb, MapPin, Users } from "lucide-react";
import { Card } from "@/components/ui/card";
import { IdeaStatusBadge } from "@/components/feed/idea-status-badge";
import { InitialsAvatar, SegmentMeter } from "@/components/feed/tile-parts";
import { IDEA_STAGES, IDEA_SUBMISSION_TYPES, labelFor } from "@/lib/data/filter-options";
import { cn } from "@/lib/utils";
import type { BigIdea, IdeaStage } from "@/lib/api/types";

// The cover warms from orange (a concept) to deep green (an operating venture), so a grid of
// ideas reads at a glance as "how far along" each one is.
export const STAGE_COVERS: Record<IdeaStage, string> = {
  CONCEPT_ONLY: "from-secondary-300 via-secondary-400 to-secondary-500",
  RESEARCH_COMPLETED: "from-secondary-400 via-secondary-300 to-primary-400",
  PROTOTYPE_DEVELOPED: "from-primary-300 via-primary-400 to-primary-500",
  TESTING_PILOT: "from-primary-400 via-primary-500 to-primary-600",
  ALREADY_OPERATING: "from-primary-500 via-primary-600 to-primary-800",
};

/**
 * @param owned the card is in the owner's own list: statuses vary there (public listings only
 *              ever contain approved ideas), and it links to the owner's view of the idea.
 */
export function BigIdeaCard({ idea, owned = false }: { idea: BigIdea; owned?: boolean }) {
  const stageIndex = Math.max(0, IDEA_STAGES.findIndex((s) => s.value === idea.stage));
  const stageLabel = labelFor(IDEA_STAGES, idea.stage);

  return (
    <Card className="card-interactive group relative flex h-full flex-col overflow-hidden focus-within:ring-2 focus-within:ring-ring">
      <div className="tile-cover h-24">
        <div className={cn("tile-cover-media tile-pattern absolute inset-0 bg-gradient-to-br", STAGE_COVERS[idea.stage] ?? STAGE_COVERS.CONCEPT_ONLY)} />
        <Lightbulb className="absolute -bottom-5 -right-3 size-24 rotate-12 text-white/20 transition-transform duration-slower ease-out group-hover:-rotate-3 group-hover:scale-110" />
        <div className="relative flex items-start justify-between gap-2 p-3">
          <span className="rounded-full bg-black/20 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur-sm">{stageLabel}</span>
          {owned && <IdeaStatusBadge status={idea.status} className="bg-card/95 shadow-sm" />}
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="space-y-1.5">
          {/* Stretched link: the title's ::after covers the whole card, so the card is one
              link target without nesting interactive elements inside an <a>. */}
          <Link
            href={owned ? `/big-ideas/mine/${idea.id}` : `/big-ideas/${idea.id}`}
            className="line-clamp-2 font-display text-lg font-semibold leading-snug outline-none transition-colors after:absolute after:inset-0 after:content-[''] group-hover:text-primary-700 dark:group-hover:text-primary-300"
          >
            {idea.ideaName}
          </Link>
          <p className="line-clamp-2 text-sm text-muted-foreground">{idea.oneLineDescription}</p>
        </div>

        <div className="space-y-1.5">
          <SegmentMeter value={stageIndex + 1} total={IDEA_STAGES.length} label={`Stage: ${stageLabel}`} />
          <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            Stage {stageIndex + 1} of {IDEA_STAGES.length}
          </p>
        </div>

        <div className="mt-auto flex items-center gap-2.5 border-t border-border/70 pt-3">
          <InitialsAvatar name={idea.applicant.fullName} />
          <div className="min-w-0 flex-1 text-xs">
            <p className="truncate font-medium text-foreground/90">{idea.applicant.fullName}</p>
            <p className="flex items-center gap-2 truncate text-muted-foreground">
              {idea.applicant.location && (
                <span className="flex items-center gap-0.5">
                  <MapPin className="size-3" /> {idea.applicant.location}
                </span>
              )}
              <span className="flex items-center gap-0.5">
                <Users className="size-3" /> {labelFor(IDEA_SUBMISSION_TYPES, idea.applicant.submissionType)}
              </span>
            </p>
          </div>
          <ArrowRight className="tile-arrow size-4 shrink-0 text-primary-600 dark:text-primary-400" aria-hidden />
        </div>
      </div>
    </Card>
  );
}
