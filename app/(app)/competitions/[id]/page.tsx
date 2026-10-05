"use client";

import { use } from "react";
import Link from "next/link";
import { ArrowLeft, Award, CalendarClock, CheckCircle2, Crown, Lightbulb, MapPin, Medal, Mic, Send, Trophy, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/empty-state";
import { useCompetition, useEntrants, useMyApplicationTo } from "@/lib/queries/competitions";
import { useAuthStore } from "@/lib/store/auth-store";
import { useNow } from "@/lib/hooks/use-now";
import { APPLICATION_LABEL, PHASE_STYLE, formatWhen, ordinal, phaseOf } from "@/components/competitions/phase";
import type { Competition, Entrant } from "@/lib/api/competitions";
import { cn, formatEnumLabel } from "@/lib/utils";

const JOURNEY = [
  { icon: Lightbulb, title: "Apply", body: "Enter one of your saved ideas, answer a few questions and upload your pitch deck." },
  { icon: CheckCircle2, title: "Shortlisting", body: "The judges review every application against the criteria." },
  { icon: Video, title: "Pitch video", body: "Shortlisted entrepreneurs send a pitch video of up to 3 minutes." },
  { icon: Mic, title: "Live final", body: "The top finalists pitch live to the judging panel and answer their questions." },
  { icon: Crown, title: "Winners", body: "Three winners are declared and receive their prizes." },
];

function ApplyCard({ c, now }: { c: Competition; now: number }) {
  const signedIn = useAuthStore((s) => !!s.user);
  const mine = useMyApplicationTo(c.id, signedIn);
  const open = c.state === "PUBLISHED" && now >= Date.parse(c.applicationOpensAt) && now < Date.parse(c.applicationClosesAt);
  const app = mine.data;

  let body: React.ReactNode;
  if (mine.isLoading) body = <Skeleton className="h-10 w-full" />;
  else if (app) {
    body = (
      <>
        <p className="text-sm">
          Your entry: <strong>{app.idea.ideaName}</strong>
          <span className="ml-2 rounded-full bg-muted px-2 py-0.5 text-xs font-semibold">
            {app.winnerRank ? `${ordinal(app.winnerRank)} place` : APPLICATION_LABEL[app.state]}
          </span>
        </p>
        <Button asChild className="mt-3 w-full">
          <Link href={`/competitions/${c.id}/application`}>{app.state === "DRAFT" ? "Continue your application" : "View your application"}</Link>
        </Button>
      </>
    );
  } else if (open) {
    body = (
      <>
        <p className="text-sm text-muted-foreground">Applications close {formatWhen(c.applicationClosesAt)}.</p>
        <Button asChild className="mt-3 w-full"><Link href={`/competitions/${c.id}/application`}><Send className="size-4" /> Apply with one of your ideas</Link></Button>
      </>
    );
  } else if (c.state === "PUBLISHED" && now < Date.parse(c.applicationOpensAt)) {
    body = <p className="text-sm text-muted-foreground">Applications open {formatWhen(c.applicationOpensAt)}. Get your idea ready in the meantime.</p>;
  } else if (c.state === "CANCELLED") {
    body = <p className="text-sm text-muted-foreground">This competition was cancelled{c.cancelReason ? `: ${c.cancelReason}` : "."}</p>;
  } else {
    body = <p className="text-sm text-muted-foreground">Applications are closed.</p>;
  }
  return (
    <Card className="border-primary-200 dark:border-primary-800">
      <CardHeader><CardTitle className="text-base">{app ? "Your application" : "Enter this competition"}</CardTitle></CardHeader>
      <CardContent>{body}</CardContent>
    </Card>
  );
}

function EntrantRow({ e, rank }: { e: Entrant; rank?: number | null }) {
  return (
    <li className="flex items-center gap-3 py-2.5">
      {rank ? (
        <span className={cn("flex size-9 shrink-0 items-center justify-center rounded-full text-sm font-bold",
          rank === 1 ? "bg-secondary-400 text-white" : "bg-secondary-500/15 text-secondary-700 dark:text-secondary-300")}>{rank}</span>
      ) : <Award className="size-5 shrink-0 text-muted-foreground" />}
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-medium">{e.idea.ideaName}</span>
        <span className="block truncate text-xs text-muted-foreground">{e.idea.applicantName}{e.idea.applicantLocation && ` · ${e.idea.applicantLocation}`}</span>
      </span>
      {rank && <span className="text-xs font-semibold text-secondary-700 dark:text-secondary-300">{ordinal(rank)}</span>}
    </li>
  );
}

function Results({ c }: { c: Competition }) {
  const announced = c.state === "PITCH_VIDEO" || c.state === "FINALS" || c.state === "COMPLETED";
  const { data } = useEntrants(c.id, announced);
  if (!announced || !data) return null;
  return (
    <Card>
      <CardHeader><CardTitle className="flex items-center gap-2 text-base"><Trophy className="size-4 text-secondary-500" /> Results</CardTitle></CardHeader>
      <CardContent className="space-y-5">
        {data.winners.length > 0 && (
          <div><p className="mb-1 text-sm font-semibold">Winners</p><ul className="divide-y divide-border">{data.winners.map((e) => <EntrantRow key={e.applicationId} e={e} rank={e.winnerRank} />)}</ul></div>
        )}
        {data.finalists.length > 0 && (
          <div><p className="mb-1 text-sm font-semibold">Finalists</p><ul className="divide-y divide-border">{data.finalists.map((e) => <EntrantRow key={e.applicationId} e={e} />)}</ul></div>
        )}
        <div><p className="mb-1 text-sm font-semibold">Shortlist</p><ul className="divide-y divide-border">{data.shortlisted.map((e) => <EntrantRow key={e.applicationId} e={e} />)}</ul></div>
      </CardContent>
    </Card>
  );
}

export default function CompetitionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: c, isLoading, isError } = useCompetition(id);
  const now = useNow();

  if (isLoading) return <div className="container-page space-y-4 py-6"><Skeleton className="h-48 rounded-2xl" /><Skeleton className="h-64 rounded-2xl" /></div>;
  if (isError || !c) return <div className="container-page py-10"><EmptyState icon={Trophy} title="Competition not found" description="It may have been removed." /></div>;
  const phase = phaseOf(c, now);
  const weights = c.evaluationCriteria.reduce((s, x) => s + x.weight, 0);

  return (
    <div className="container-page py-6">
      <Link href="/competitions" className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="size-4" /> Competitions</Link>
      <section className="tile-pattern relative mb-6 overflow-hidden rounded-3xl bg-gradient-to-br from-secondary-400 via-primary-500 to-primary-700 p-6 text-white shadow-lg sm:p-8">
        <Trophy className="absolute -right-4 -top-4 size-40 text-white/10" aria-hidden />
        <span className={cn("inline-block rounded-full bg-card/90 px-3 py-1 text-xs font-semibold ring-1", PHASE_STYLE[phase.tone])}>{phase.label}</span>
        <h1 className="mt-3 max-w-3xl font-display text-3xl font-semibold sm:text-4xl">{c.title}</h1>
        {c.tagline && <p className="mt-2 max-w-2xl text-white/85">{c.tagline}</p>}
        <p className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-white/85">
          <span className="flex items-center gap-1.5"><CalendarClock className="size-4" /> Apply {formatWhen(c.applicationOpensAt, false)} - {formatWhen(c.applicationClosesAt)}</span>
          <span className="flex items-center gap-1.5"><Award className="size-4" /> {c.totalFinalists} finalists · 3 winners</span>
        </p>
      </section>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader><CardTitle className="text-base">About</CardTitle></CardHeader>
            <CardContent><p className="whitespace-pre-line text-sm leading-relaxed">{c.description}</p></CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-base">Who can enter</CardTitle></CardHeader>
            <CardContent>
              <p className="whitespace-pre-line text-sm leading-relaxed">{c.eligibilityRequirements}</p>
              <p className="mt-3 text-sm text-muted-foreground">
                {c.eligibleIdeaStages.length === 0 ? "Ideas at any stage can enter." : `Ideas at these stages can enter: ${c.eligibleIdeaStages.map((s) => formatEnumLabel(s)).join(", ")}.`}
                {" "}Each application is built on exactly one of your saved ideas, and an idea can only be in one running competition at a time.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-base">How it works</CardTitle></CardHeader>
            <CardContent>
              <ol className="relative space-y-4 border-l border-border pl-6">
                {JOURNEY.map((step) => (
                  <li key={step.title} className="relative">
                    <span className="absolute -left-[2.15rem] flex size-7 items-center justify-center rounded-full bg-primary-500/10 text-primary-600 ring-4 ring-card dark:text-primary-300"><step.icon className="size-3.5" /></span>
                    <p className="text-sm font-semibold">{step.title}</p>
                    <p className="text-sm text-muted-foreground">{step.body}</p>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>
          <Results c={c} />
        </div>
        <div className="space-y-6">
          <ApplyCard c={c} now={now} />
          <Card>
            <CardHeader><CardTitle className="text-base">Key dates</CardTitle></CardHeader>
            <CardContent>
              <ul className="space-y-3 text-sm">
                <li><span className="text-muted-foreground">Applications open</span><br />{formatWhen(c.applicationOpensAt)}</li>
                <li><span className="text-muted-foreground">Application deadline</span><br />{formatWhen(c.applicationClosesAt)}</li>
                <li><span className="text-muted-foreground">Pitch videos due (shortlisted)</span><br />{formatWhen(c.pitchVideoDeadline)}</li>
                <li className="flex gap-2"><MapPin className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                  <span><span className="text-muted-foreground">Live final{c.finalPitch?.format && ` · ${c.finalPitch.format === "PHYSICAL" ? "in person" : "online"}`}</span><br />
                    {c.finalPitch?.scheduledAt ? formatWhen(c.finalPitch.scheduledAt) : "To be announced"}
                    {c.finalPitch?.venue && <><br />{c.finalPitch.venue}</>}</span>
                </li>
              </ul>
            </CardContent>
          </Card>
          {c.prizes.length > 0 && (
            <Card>
              <CardHeader><CardTitle className="text-base">Prizes</CardTitle></CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {c.prizes.map((p) => (
                    <li key={p.rank} className="flex gap-2.5 text-sm">
                      <Medal className={cn("mt-0.5 size-4 shrink-0", p.rank === 1 ? "text-secondary-500" : "text-muted-foreground")} />
                      <span><span className="font-semibold">{ordinal(p.rank)}: {p.title}</span>{p.description && <><br /><span className="text-muted-foreground">{p.description}</span></>}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
          <Card>
            <CardHeader><CardTitle className="text-base">How entries are judged</CardTitle></CardHeader>
            <CardContent>
              <ul className="space-y-2.5">
                {c.evaluationCriteria.map((x) => (
                  <li key={x.id} className="text-sm">
                    <div className="flex justify-between gap-2"><span className="font-medium">{x.name}</span><span className="text-xs text-muted-foreground">{Math.round((x.weight / weights) * 100)}%</span></div>
                    {x.description && <p className="text-xs text-muted-foreground">{x.description}</p>}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
