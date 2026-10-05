"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useQueries } from "@tanstack/react-query";
import { CalendarClock, ClipboardList, Medal, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/empty-state";
import { ListPageHeader } from "@/components/list-results";
import { LoadMoreButton } from "@/components/load-more-button";
import { useUrlFilters } from "@/lib/hooks/use-url-filters";
import { useNow } from "@/lib/hooks/use-now";
import { useCompetitions, useMyApplications, competitionKeys } from "@/lib/queries/competitions";
import { competitionsApi, type Competition } from "@/lib/api/competitions";
import { APPLICATION_LABEL, PHASE_STYLE, formatWhen, ordinal, phaseOf } from "@/components/competitions/phase";
import { cn } from "@/lib/utils";

const VIEW = { single: ["view"] } as const;
const RUNNING = ["PUBLISHED", "SHORTLISTING", "PITCH_VIDEO", "FINALS"];
const PAST = ["COMPLETED", "CANCELLED"];

export default function CompetitionsPage() {
  return (
    <div className="container-page py-6">
      <ListPageHeader
        title="Competitions"
        description="Enter one of your saved ideas into a Next Big Idea competition: get shortlisted, pitch, and win."
        action={<Button variant="outline" asChild><Link href="/big-ideas?view=mine">My ideas</Link></Button>}
      />
      <Suspense>
        <CompetitionsContent />
      </Suspense>
    </div>
  );
}

function CompetitionsContent() {
  const view = useUrlFilters(VIEW);
  const tab = view.values.view || "running";
  return (
    <Tabs value={tab} onValueChange={(v) => view.update({ view: v === "running" ? "" : v })}>
      <TabsList className="mb-5">
        <TabsTrigger value="running"><Trophy className="size-4" /> Running</TabsTrigger>
        <TabsTrigger value="past"><Medal className="size-4" /> Past</TabsTrigger>
        <TabsTrigger value="mine"><ClipboardList className="size-4" /> My applications</TabsTrigger>
      </TabsList>
      {tab === "mine" ? <MyApplications /> : <CompetitionGrid states={tab === "past" ? PAST : RUNNING} past={tab === "past"} />}
    </Tabs>
  );
}

function CompetitionGrid({ states, past }: { states: string[]; past: boolean }) {
  const query = useCompetitions({ state: states });
  const now = useNow();
  const items = query.data?.pages.flatMap((p) => p.items) ?? [];
  if (query.isLoading) {
    return <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-64 rounded-2xl" />)}</div>;
  }
  if (items.length === 0) {
    return (
      <EmptyState
        icon={Trophy}
        title={past ? "No past competitions yet" : "No competitions running right now"}
        description={past ? "Finished competitions and their winners will appear here." : "New competitions are announced here - meanwhile, polish your ideas so you're ready to enter."}
      />
    );
  }
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((c, i) => <CompetitionCard key={c.id} c={c} now={now} index={i} />)}
      </div>
      <LoadMoreButton hasNextPage={!!query.hasNextPage} isFetching={query.isFetchingNextPage} onClick={() => query.fetchNextPage()} />
    </>
  );
}

function CompetitionCard({ c, now, index }: { c: Competition; now: number; index: number }) {
  const phase = phaseOf(c, now);
  const top = c.prizes.find((p) => p.rank === 1);
  return (
    <Link
      href={`/competitions/${c.id}`}
      className="stagger-in group flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all duration-normal hover:-translate-y-0.5 hover:shadow-md"
      style={{ "--stagger": index + 1 } as React.CSSProperties}
    >
      <div className="tile-pattern relative h-28 bg-gradient-to-br from-secondary-400 via-primary-500 to-primary-700">
        <Trophy className="absolute right-5 top-5 size-12 text-white/30 transition-transform duration-slow group-hover:scale-110" aria-hidden />
        <span className={cn("absolute bottom-3 left-4 rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 backdrop-blur-sm", PHASE_STYLE[phase.tone], "bg-card/90")}>
          {phase.label}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-4">
        <p className="line-clamp-2 font-display text-lg font-semibold">{c.title}</p>
        {c.tagline && <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{c.tagline}</p>}
        <div className="mt-auto space-y-1.5 pt-4 text-xs text-muted-foreground">
          {c.state === "PUBLISHED" && (
            <p className="flex items-center gap-1.5"><CalendarClock className="size-3.5" />
              {now < Date.parse(c.applicationOpensAt) ? `Opens ${formatWhen(c.applicationOpensAt)}` : `Apply by ${formatWhen(c.applicationClosesAt)}`}
            </p>
          )}
          {top && <p className="flex items-center gap-1.5"><Medal className="size-3.5" /> 1st prize: {top.title}</p>}
        </div>
      </div>
    </Link>
  );
}

function MyApplications() {
  const query = useMyApplications();
  const apps = query.data?.pages.flatMap((p) => p.items) ?? [];
  const competitionIds = [...new Set(apps.map((a) => a.competitionId))];
  const competitions = useQueries({
    queries: competitionIds.map((id) => ({ queryKey: competitionKeys.detail(id), queryFn: () => competitionsApi.get(id) })),
  });
  const titleOf = (id: string) => competitions[competitionIds.indexOf(id)]?.data?.title;

  if (query.isLoading) return <div className="space-y-3">{[0, 1].map((i) => <Skeleton key={i} className="h-20 rounded-2xl" />)}</div>;
  if (apps.length === 0) {
    return (
      <EmptyState
        icon={ClipboardList}
        title="You haven't entered a competition yet"
        description="Pick a running competition and enter one of your saved ideas."
        action={<Button size="sm" asChild><Link href="/competitions">Browse competitions</Link></Button>}
      />
    );
  }
  return (
    <>
    <ul className="space-y-3">
      {apps.map((a, i) => (
        <li key={a.id} className="stagger-in" style={{ "--stagger": i + 1 } as React.CSSProperties}>
          <Link href={`/competitions/${a.competitionId}/application`}
            className="flex items-center gap-4 rounded-2xl border border-border bg-card p-4 shadow-sm transition-colors hover:bg-muted/40">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-secondary-400 to-primary-600 text-white">
              <Trophy className="size-5" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate font-medium">{titleOf(a.competitionId) ?? "Competition"}</span>
              <span className="block truncate text-sm text-muted-foreground">{a.idea.ideaName}</span>
            </span>
            <span className={cn("shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1",
              a.state === "WINNER" ? PHASE_STYLE.done : a.state === "NOT_SHORTLISTED" || a.state === "NOT_ADVANCED" || a.state === "WITHDRAWN" ? PHASE_STYLE.cancelled
                : a.state === "DRAFT" ? PHASE_STYLE.soon : PHASE_STYLE.open)}>
              {a.winnerRank ? `${ordinal(a.winnerRank)} place` : APPLICATION_LABEL[a.state]}
            </span>
          </Link>
        </li>
      ))}
    </ul>
    <LoadMoreButton hasNextPage={!!query.hasNextPage} isFetching={query.isFetchingNextPage} onClick={() => query.fetchNextPage()} />
    </>
  );
}
