"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ArrowLeft, CheckCircle2, Clock, Crown, ExternalLink, Frown, Lightbulb, Link2, Loader2, MapPin, Medal, Plus, Save, Send, Trophy,
  UploadCloud, Video, XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { EmptyState } from "@/components/empty-state";
import { Checklist, FileUploader, QuestionField, videoDuration, type AnswerValue } from "@/components/competitions/application-parts";
import { APPLICATION_LABEL, PITCH_VIDEO_POINTS, formatWhen, ordinal } from "@/components/competitions/phase";
import {
  useCompetition, useMyApplicationTo, useSetVideoLink, useStartApplication, useSubmitApplication, useUpdateApplication,
  useUploadDeck, useUploadVideo, useWithdrawApplication,
} from "@/lib/queries/competitions";
import { useMyBigIdeas } from "@/lib/queries/big-ideas";
import { useNow } from "@/lib/hooks/use-now";
import type { Competition, CompetitionApplication } from "@/lib/api/competitions";
import type { BigIdea } from "@/lib/api/types";
import { cn, formatEnumLabel } from "@/lib/utils";

const MIN_POTENTIAL = 50;
const DECK_ACCEPT = ".pdf,.ppt,.pptx,.key,.odp";
const VIDEO_ACCEPT = ".mp4,.mov,.m4v,.webm,.mkv,.avi,video/*";
const MAX_DECK = 25 * 1024 * 1024;
const MAX_VIDEO = 500 * 1024 * 1024;
/** 3 minutes, plus a few seconds' grace for intros and fades. */
const MAX_VIDEO_SECONDS = 3 * 60 + 10;

function errorText(err: unknown) {
  return err instanceof Error ? err.message : "Something went wrong";
}

// ─── Picking an idea ─────────────────────────────────────────────────────────

function ideaIneligibility(idea: BigIdea, c: Competition) {
  if (idea.status === "DECLINED") return "Declined ideas can't enter";
  if (c.eligibleIdeaStages.length && !c.eligibleIdeaStages.includes(idea.stage)) return `${formatEnumLabel(idea.stage)} ideas can't enter this one`;
  return null;
}

function IdeaPicker({ c, current, onPick, pending, cta }: {
  c: Competition; current?: string; onPick: (ideaId: string) => void; pending: boolean; cta: string;
}) {
  const ideas = useMyBigIdeas({ pageSize: 50 });
  const list = ideas.data?.pages.flatMap((p) => p.items) ?? [];
  const [selected, setSelected] = useState<string | undefined>(current);

  if (ideas.isLoading) return <div className="space-y-2">{[0, 1].map((i) => <Skeleton key={i} className="h-16 rounded-xl" />)}</div>;
  if (list.length === 0) {
    return (
      <EmptyState
        icon={Lightbulb}
        title="You don't have a saved idea yet"
        description="Competitions are entered with one of your saved ideas. Create one first - it can stay a draft."
        action={<Button size="sm" asChild><Link href="/big-ideas/new"><Plus className="size-4" /> Create an idea</Link></Button>}
      />
    );
  }
  return (
    <div className="space-y-3">
      <div role="radiogroup" aria-label="Your ideas" className="space-y-2">
        {list.map((idea) => {
          const why = ideaIneligibility(idea, c);
          const on = selected === idea.id;
          return (
            <button
              key={idea.id} type="button" role="radio" aria-checked={on} disabled={!!why}
              onClick={() => setSelected(idea.id)}
              className={cn("flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-all disabled:cursor-not-allowed disabled:opacity-55",
                on ? "border-primary-400 bg-primary-500/5 ring-4 ring-primary-500/10" : "border-border hover:bg-muted/50")}
            >
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-secondary-300 to-primary-500 font-display font-bold text-white">
                {idea.ideaName.charAt(0)}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium">{idea.ideaName}</span>
                <span className="block truncate text-xs text-muted-foreground">{why ?? `${formatEnumLabel(idea.stage)} · ${idea.oneLineDescription}`}</span>
              </span>
            </button>
          );
        })}
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Link href="/big-ideas/new" className="text-sm text-primary-700 hover:underline dark:text-primary-300">+ Create a new idea</Link>
        <Button disabled={!selected || selected === current || pending} onClick={() => selected && onPick(selected)}>
          {pending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />} {cta}
        </Button>
      </div>
    </div>
  );
}

// ─── Draft form ──────────────────────────────────────────────────────────────

function DraftForm({ c, app, now }: { c: Competition; app: CompetitionApplication; now: number }) {
  const router = useRouter();
  const update = useUpdateApplication(c.id, app.id);
  const submit = useSubmitApplication(c.id, app.id);
  const withdraw = useWithdrawApplication(c.id, app.id);
  const uploadDeck = useUploadDeck(c.id, app.id);
  const [changingIdea, setChangingIdea] = useState(false);
  const [confirmSubmit, setConfirmSubmit] = useState(false);
  const [potential, setPotential] = useState(app.potentialStatement ?? "");
  const [impact, setImpact] = useState(app.expectedImpact ?? "");
  const [support, setSupport] = useState(app.supportNeeded ?? "");
  const [answers, setAnswers] = useState<Record<string, AnswerValue>>(() =>
    Object.fromEntries(c.questions.map((q) => {
      const a = app.answers.find((x) => x.questionId === q.id);
      return [q.id, { text: a?.text ?? "", choices: a?.choices ?? [] }];
    })));

  const open = now < Date.parse(c.applicationClosesAt);
  const payload = (ideaId?: string) => ({
    ideaId,
    potentialStatement: potential, expectedImpact: impact, supportNeeded: support,
    answers: c.questions.map((q) => ({ questionId: q.id, text: answers[q.id]?.text || undefined, choices: answers[q.id]?.choices ?? [] })),
  });
  const answered = (id: string) => !!(answers[id]?.text.trim() || answers[id]?.choices.length);
  const checklist = [
    { label: `Why your idea has potential (${MIN_POTENTIAL}+ characters)`, done: potential.trim().length >= MIN_POTENTIAL },
    ...c.questions.filter((q) => q.required).map((q) => ({ label: q.prompt, done: answered(q.id) })),
    { label: "Pitch deck uploaded", done: !!app.pitchDeck },
  ];
  const ready = checklist.every((i) => i.done);

  async function save(quiet = false) {
    try {
      await update.mutateAsync(payload());
      if (!quiet) toast.success("Draft saved");
      return true;
    } catch (err) {
      toast.error(errorText(err));
      return false;
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">
        <Card>
          <CardHeader><CardTitle className="text-base">Your idea</CardTitle></CardHeader>
          <CardContent>
            {changingIdea ? (
              <IdeaPicker c={c} current={app.ideaId} pending={update.isPending} cta="Use this idea"
                onPick={(ideaId) => update.mutate(payload(ideaId), {
                  onSuccess: () => { setChangingIdea(false); toast.success("Idea changed"); },
                  onError: (err) => toast.error(errorText(err)),
                })} />
            ) : (
              <div className="flex items-center gap-3">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-secondary-300 to-primary-500 font-display text-lg font-bold text-white">{app.idea.ideaName.charAt(0)}</span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-medium">{app.idea.ideaName}</span>
                  <span className="block truncate text-sm text-muted-foreground">{app.idea.oneLineDescription}</span>
                </span>
                <Button variant="outline" size="sm" onClick={() => setChangingIdea(true)}>Change</Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Your application</CardTitle></CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="potential">Why does this idea have the potential to succeed? <span className="text-error">*</span></Label>
              <Textarea id="potential" rows={5} maxLength={3000} value={potential} onChange={(e) => setPotential(e.target.value)}
                placeholder="The size of the opportunity, what you've learned from customers, why now, why your team…" />
              <p className={cn("text-right text-xs", potential.trim().length < MIN_POTENTIAL ? "text-muted-foreground" : "text-success")}>
                {potential.trim().length}/{MIN_POTENTIAL} minimum
              </p>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="impact">What difference will it make? <span className="text-muted-foreground">(optional)</span></Label>
              <Textarea id="impact" rows={3} maxLength={3000} value={impact} onChange={(e) => setImpact(e.target.value)} placeholder="Jobs, income, health, the environment…" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="support">What support do you need to grow it? <span className="text-muted-foreground">(optional)</span></Label>
              <Textarea id="support" rows={3} maxLength={3000} value={support} onChange={(e) => setSupport(e.target.value)} placeholder="Funding, mentorship, partners, equipment…" />
            </div>
            {c.questions.map((q, i) => (
              <QuestionField key={q.id} q={q} index={i} value={answers[q.id] ?? { text: "", choices: [] }}
                onChange={(v) => setAnswers({ ...answers, [q.id]: v })} />
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Pitch deck <span className="text-error">*</span></CardTitle></CardHeader>
          <CardContent>
            <FileUploader current={app.pitchDeck} accept={DECK_ACCEPT} maxBytes={MAX_DECK} kindLabel="pitch deck"
              hint="PDF or PowerPoint, up to 25 MB" disabled={!open}
              onUpload={async (file, onProgress) => {
                await uploadDeck.mutateAsync({ file, onProgress });
                toast.success("Pitch deck uploaded");
              }} />
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <Card className="lg:sticky lg:top-24">
          <CardHeader><CardTitle className="text-base">Submit</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <p className="flex items-center gap-1.5 text-sm text-muted-foreground"><Clock className="size-4" /> Deadline {formatWhen(c.applicationClosesAt)}</p>
            <Checklist items={checklist} />
            <div className="flex flex-col gap-2">
              <Button variant="outline" disabled={update.isPending || !open} onClick={() => save()}>
                {update.isPending ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />} Save draft
              </Button>
              <Button disabled={!ready || !open || submit.isPending || update.isPending} onClick={() => setConfirmSubmit(true)}>
                <Send className="size-4" /> Submit application
              </Button>
              <Button variant="ghost" className="text-error" disabled={withdraw.isPending || !open}
                onClick={() => withdraw.mutate(undefined, {
                  onSuccess: () => { toast.success("Draft discarded"); router.push(`/competitions/${c.id}`); },
                  onError: (err) => toast.error(errorText(err)),
                })}>
                Discard draft
              </Button>
            </div>
            {!open && <p className="text-sm text-error">The deadline has passed - this draft can no longer be submitted.</p>}
          </CardContent>
        </Card>
      </div>

      <Dialog open={confirmSubmit} onOpenChange={setConfirmSubmit}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Submit your application?</DialogTitle>
            <DialogDescription>
              You can&apos;t edit it after submitting. You can still withdraw it until the deadline ({formatWhen(c.applicationClosesAt)}).
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setConfirmSubmit(false)}>Keep editing</Button>
            <Button disabled={submit.isPending || update.isPending} onClick={async () => {
              if (!(await save(true))) return;
              submit.mutate(undefined, {
                onSuccess: () => { setConfirmSubmit(false); toast.success("Application submitted - good luck!"); },
                onError: (err) => toast.error(errorText(err)),
              });
            }}>
              {submit.isPending || update.isPending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />} Submit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── After submitting ────────────────────────────────────────────────────────

function StatusCard({ c, app }: { c: Competition; app: CompetitionApplication }) {
  const prize = app.winnerRank ? c.prizes.find((p) => p.rank === app.winnerRank) : null;
  const config: Record<string, { icon: typeof Clock; tone: string; title: string; body: React.ReactNode }> = {
    SUBMITTED: {
      icon: Clock, tone: "border-info/30 bg-info/5", title: "Submitted - good luck!",
      body: c.state === "PUBLISHED"
        ? <>The judges review applications after the deadline ({formatWhen(c.applicationClosesAt)}). We&apos;ll email you when the shortlist is announced.</>
        : <>The judges are reviewing applications. We&apos;ll email you when the shortlist is announced.</>,
    },
    SHORTLISTED: {
      icon: CheckCircle2, tone: "border-success/30 bg-success/5", title: "You're on the shortlist!",
      body: c.state === "PITCH_VIDEO"
        ? <>Send your pitch video by {formatWhen(c.pitchVideoDeadline)}. The judges then pick the finalists.</>
        : <>The judges are picking the finalists from the pitch videos.</>,
    },
    FINALIST: {
      icon: Trophy, tone: "border-primary-400/40 bg-primary-500/5", title: "You're a finalist!",
      body: <>You&apos;ll pitch live to the judging panel{c.finalPitch?.scheduledAt ? ` on ${formatWhen(c.finalPitch.scheduledAt)}` : ""}
        {c.finalPitch?.format === "PHYSICAL" && c.finalPitch.venue ? ` at ${c.finalPitch.venue}` : ""}
        {c.finalPitch?.format === "VIRTUAL" ? " online - the meeting link was sent to you by email" : ""}. Prepare to answer questions on feasibility, market potential and how you&apos;ll deliver it.</>,
    },
    WINNER: {
      icon: Crown, tone: "border-secondary-400/50 bg-secondary-500/10", title: `Congratulations - ${ordinal(app.winnerRank ?? 0)} place!`,
      body: <>{prize ? <>Your prize: <strong>{prize.title}</strong>{prize.description ? ` - ${prize.description}` : ""}. </> : null}The NaWeHub team will be in touch about your prize and the announcement.</>,
    },
    NOT_SHORTLISTED: {
      icon: Frown, tone: "border-border bg-muted/50", title: "Not shortlisted this time",
      body: <>Thank you for entering. Keep building - you can enter this idea, or another, into future competitions.</>,
    },
    NOT_ADVANCED: {
      icon: Frown, tone: "border-border bg-muted/50", title: "Not selected for the final",
      body: <>Being shortlisted is an achievement in itself - well done, and keep going.</>,
    },
  };
  const s = config[app.state] ?? config.SUBMITTED;
  if (app.state === "FINALIST" && c.state === "COMPLETED") {
    s.title = "Thank you for pitching in the final";
    s.body = <>The winners have been announced. Reaching the final puts you among the very best entries.</>;
  }
  return (
    <div className={cn("animate-fade-in-up flex gap-4 rounded-2xl border p-5", s.tone)}>
      <s.icon className="size-7 shrink-0" />
      <div>
        <p className="font-display text-lg font-semibold">{s.title}</p>
        <p className="mt-1 text-sm">{s.body}</p>
        {app.feedback && (
          <div className="mt-3 rounded-xl bg-card p-3 text-sm">
            <p className="font-medium">Feedback from the judges</p>
            <p className="mt-0.5 whitespace-pre-line">{app.feedback}</p>
          </div>
        )}
      </div>
    </div>
  );
}

function PitchVideo({ c, app, now }: { c: Competition; app: CompetitionApplication; now: number }) {
  const setLink = useSetVideoLink(c.id, app.id);
  const upload = useUploadVideo(c.id, app.id);
  const [mode, setMode] = useState<"link" | "upload">(app.pitchVideo?.file ? "upload" : "link");
  const [link, setLinkValue] = useState(app.pitchVideo?.link ?? "");
  const canSend = app.state === "SHORTLISTED" && c.state === "PITCH_VIDEO" && now <= Date.parse(c.pitchVideoDeadline);
  const video = app.pitchVideo;

  return (
    <Card>
      <CardHeader><CardTitle className="flex items-center gap-2 text-base"><Video className="size-4" /> Pitch video</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        {video ? (
          <div className="flex items-center gap-3 rounded-xl border border-success/30 bg-success/5 p-3 text-sm">
            <CheckCircle2 className="size-5 shrink-0 text-success" />
            <span className="min-w-0 flex-1">
              {video.link ? <a href={video.link} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 break-all font-medium hover:underline">{video.link} <ExternalLink className="size-3.5" /></a>
                : video.file ? <span className="font-medium">{video.file.fileName}</span>
                  : <span>Your uploaded video was removed after the competition ended.</span>}
              <span className="block text-xs text-muted-foreground">Sent {formatWhen(video.submittedAt)}</span>
            </span>
          </div>
        ) : !canSend ? <p className="text-sm text-muted-foreground">No video was sent.</p> : null}

        {canSend && (
          <>
            <div className="rounded-xl bg-muted/60 p-4 text-sm">
              <p className="font-medium">In no more than 3 minutes, cover:</p>
              <ol className="mt-2 list-decimal space-y-0.5 pl-5 text-muted-foreground">{PITCH_VIDEO_POINTS.map((p) => <li key={p}>{p}</li>)}</ol>
              <p className="mt-2 text-muted-foreground">Due {formatWhen(c.pitchVideoDeadline)}. {video ? "Sending another replaces this one." : ""}</p>
            </div>
            <div className="grid grid-cols-2 gap-2" role="tablist" aria-label="How to send your video">
              {([["link", Link2, "Share a link"], ["upload", UploadCloud, "Upload a file"]] as const).map(([value, Icon, label]) => (
                <button key={value} type="button" role="tab" aria-selected={mode === value} onClick={() => setMode(value)}
                  className={cn("flex items-center justify-center gap-2 rounded-xl border p-3 text-sm transition-all",
                    mode === value ? "border-primary-400 bg-primary-500/5 ring-4 ring-primary-500/10" : "border-border hover:bg-muted/50")}>
                  <Icon className="size-4" /> {label}
                </button>
              ))}
            </div>
            {mode === "link" ? (
              <form className="flex flex-col gap-2 sm:flex-row" onSubmit={(e) => {
                e.preventDefault();
                setLink.mutate(link.trim(), { onSuccess: () => toast.success("Pitch video link saved"), onError: (err) => toast.error(errorText(err)) });
              }}>
                <Input type="url" aria-label="Video link" placeholder="https://youtu.be/… or a Google Drive / Vimeo link" value={link} onChange={(e) => setLinkValue(e.target.value)} />
                <Button type="submit" disabled={!/^https?:\/\/\S+$/.test(link.trim()) || setLink.isPending}>
                  {setLink.isPending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />} Send link
                </Button>
              </form>
            ) : (
              <FileUploader current={video?.file ?? null} accept={VIDEO_ACCEPT} maxBytes={MAX_VIDEO} kindLabel="pitch video"
                hint="MP4, MOV or WEBM, up to 3 minutes and 500 MB. If you share a link instead, make sure anyone can watch it."
                validate={async (file) => {
                  const seconds = await videoDuration(file);
                  if (seconds === null || seconds <= MAX_VIDEO_SECONDS) return null;
                  const mins = Math.floor(seconds / 60), secs = Math.round(seconds % 60);
                  return `Your video is ${mins}:${String(secs).padStart(2, "0")} long - keep it to 3 minutes.`;
                }}
                onUpload={async (file, onProgress) => {
                  await upload.mutateAsync({ file, onProgress });
                  toast.success("Pitch video uploaded");
                }} />
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

function Submitted({ c, app, now }: { c: Competition; app: CompetitionApplication; now: number }) {
  const router = useRouter();
  const withdraw = useWithdrawApplication(c.id, app.id);
  const [confirm, setConfirm] = useState(false);
  const canWithdraw = app.state === "SUBMITTED" && c.state === "PUBLISHED" && now < Date.parse(c.applicationClosesAt);
  const showVideo = ["SHORTLISTED", "FINALIST", "NOT_ADVANCED", "WINNER"].includes(app.state);

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">
        <StatusCard c={c} app={app} />
        {showVideo && <PitchVideo c={c} app={app} now={now} />}
        <Card>
          <CardHeader><CardTitle className="text-base">What you submitted</CardTitle></CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div><p className="font-medium">Idea</p><p>{app.idea.ideaName} - <span className="text-muted-foreground">{app.idea.oneLineDescription}</span></p></div>
            <div><p className="font-medium">Why it has potential</p><p className="whitespace-pre-line text-muted-foreground">{app.potentialStatement}</p></div>
            {app.expectedImpact && <div><p className="font-medium">Expected impact</p><p className="whitespace-pre-line text-muted-foreground">{app.expectedImpact}</p></div>}
            {app.supportNeeded && <div><p className="font-medium">Support needed</p><p className="whitespace-pre-line text-muted-foreground">{app.supportNeeded}</p></div>}
            {c.questions.map((q) => {
              const a = app.answers.find((x) => x.questionId === q.id);
              const v = a?.text ?? a?.choices.map((x) => (x === "YES" ? "Yes" : x === "NO" ? "No" : x)).join(", ");
              return <div key={q.id}><p className="font-medium">{q.prompt}</p><p className="whitespace-pre-line text-muted-foreground">{v || "Not answered"}</p></div>;
            })}
            {app.pitchDeck && <div><p className="font-medium">Pitch deck</p><p className="text-muted-foreground">{app.pitchDeck.fileName}</p></div>}
          </CardContent>
        </Card>
      </div>
      <div className="space-y-6">
        <Card>
          <CardHeader><CardTitle className="text-base">Status</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            <p className="flex items-center gap-2">
              {app.state === "WINNER" ? <Medal className="size-4 text-secondary-500" /> : app.state.startsWith("NOT_") ? <XCircle className="size-4 text-muted-foreground" /> : <CheckCircle2 className="size-4 text-success" />}
              <strong>{app.winnerRank ? `${ordinal(app.winnerRank)} place` : APPLICATION_LABEL[app.state]}</strong>
            </p>
            <p className="text-muted-foreground">Submitted {formatWhen(app.submitTime)}</p>
            {c.finalPitch?.venue && app.state === "FINALIST" && <p className="flex gap-1.5"><MapPin className="size-4" /> {c.finalPitch.venue}</p>}
            {canWithdraw && <Button variant="ghost" className="w-full text-error" onClick={() => setConfirm(true)}>Withdraw application</Button>}
          </CardContent>
        </Card>
      </div>
      <Dialog open={confirm} onOpenChange={setConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Withdraw your application?</DialogTitle>
            <DialogDescription>It won&apos;t be judged. Your idea is freed up, and you can apply again before the deadline.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setConfirm(false)}>Keep it</Button>
            <Button variant="destructive" disabled={withdraw.isPending} onClick={() => withdraw.mutate(undefined, {
              onSuccess: () => { toast.success("Application withdrawn"); router.push(`/competitions/${c.id}`); },
              onError: (err) => toast.error(errorText(err)),
            })}>
              {withdraw.isPending && <Loader2 className="size-4 animate-spin" />} Withdraw
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function ApplicationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const now = useNow();
  const competition = useCompetition(id);
  const mine = useMyApplicationTo(id);
  const start = useStartApplication(id);
  const c = competition.data;

  let body: React.ReactNode;
  if (competition.isLoading || mine.isLoading) body = <Skeleton className="h-72 rounded-2xl" />;
  else if (!c) body = <EmptyState icon={Trophy} title="Competition not found" description="It may have been removed." />;
  else if (mine.data) body = mine.data.state === "DRAFT" ? <DraftForm c={c} app={mine.data} now={now} /> : <Submitted c={c} app={mine.data} now={now} />;
  else if (c.state === "PUBLISHED" && now >= Date.parse(c.applicationOpensAt) && now < Date.parse(c.applicationClosesAt)) {
    body = (
      <Card className="mx-auto max-w-2xl">
        <CardHeader>
          <CardTitle className="text-base">Choose the idea to enter</CardTitle>
          <p className="text-sm text-muted-foreground">Your application is built on one saved idea. You can change it until you submit.</p>
        </CardHeader>
        <CardContent>
          <IdeaPicker c={c} pending={start.isPending} cta="Start application"
            onPick={(ideaId) => start.mutate(ideaId, { onError: (err) => toast.error(errorText(err)) })} />
        </CardContent>
      </Card>
    );
  } else body = <EmptyState icon={Trophy} title="Applications aren't open" description="You can only start an application while the competition is open." />;

  return (
    <div className="container-page py-6">
      <Link href={`/competitions/${id}`} className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> {c?.title ?? "Competition"}
      </Link>
      <h1 className="mb-6 font-display text-2xl font-semibold">Your application</h1>
      {body}
    </div>
  );
}
