import type { ApplicationState, Competition } from "@/lib/api/competitions";

export type Phase = { label: string; tone: "open" | "soon" | "progress" | "done" | "cancelled" };

/** Where a competition is, in an entrant's words. */
export function phaseOf(c: Competition, now: number): Phase {
  switch (c.state) {
    case "PUBLISHED":
      if (now < Date.parse(c.applicationOpensAt)) return { label: "Opens soon", tone: "soon" };
      if (now < Date.parse(c.applicationClosesAt)) return { label: "Open for applications", tone: "open" };
      return { label: "Applications closed", tone: "progress" };
    case "SHORTLISTING": return { label: "Shortlisting", tone: "progress" };
    case "PITCH_VIDEO": return { label: "Pitch videos", tone: "progress" };
    case "FINALS": return { label: "Live final", tone: "progress" };
    case "COMPLETED": return { label: "Winners announced", tone: "done" };
    case "CANCELLED": return { label: "Cancelled", tone: "cancelled" };
  }
}

export const PHASE_STYLE: Record<Phase["tone"], string> = {
  open: "bg-success/15 text-success ring-success/30",
  soon: "bg-info/15 text-info ring-info/30",
  progress: "bg-warning/15 text-[hsl(38_92%_38%)] ring-warning/30 dark:text-warning",
  done: "bg-primary-500/15 text-primary-700 ring-primary-500/30 dark:text-primary-300",
  cancelled: "bg-muted text-muted-foreground ring-border",
};

export const APPLICATION_LABEL: Record<ApplicationState, string> = {
  DRAFT: "Draft",
  SUBMITTED: "Submitted",
  SHORTLISTED: "Shortlisted",
  NOT_SHORTLISTED: "Not shortlisted",
  FINALIST: "Finalist",
  NOT_ADVANCED: "Not advanced",
  WINNER: "Winner",
  WITHDRAWN: "Withdrawn",
};

export function ordinal(rank: number) {
  return rank === 1 ? "1st" : rank === 2 ? "2nd" : rank === 3 ? "3rd" : `${rank}th`;
}

export function formatWhen(iso: string | null | undefined, withTime = true) {
  if (!iso) return "";
  return new Date(iso).toLocaleString("en-GB", {
    day: "numeric", month: "short", year: "numeric", ...(withTime ? { hour: "2-digit", minute: "2-digit" } : {}),
  });
}

export function formatSize(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/** The six points the 3-minute pitch video should cover (from the competition brief). */
export const PITCH_VIDEO_POINTS = [
  "The problem or opportunity",
  "Your proposed solution",
  "Your target customers or beneficiaries",
  "What makes it unique or innovative",
  "Its business or social impact",
  "Why it should go through to the final",
];
