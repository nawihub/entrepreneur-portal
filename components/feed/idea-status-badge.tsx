import { Badge, type BadgeProps } from "@/components/ui/badge";
import { IDEA_STATUSES, labelFor } from "@/lib/data/filter-options";
import type { BigIdeaStatus } from "@/lib/api/types";

const VARIANTS: Record<BigIdeaStatus, BadgeProps["variant"]> = {
  PENDING: "outline",
  PUBLISHED: "info",
  IN_REVIEW: "warning",
  APPROVED: "success",
  DECLINED: "error",
};

/** Idea status in the owner's terms ("Draft", "Submitted", ...). */
export function IdeaStatusBadge({ status, className }: { status: BigIdeaStatus; className?: string }) {
  return (
    <Badge variant={VARIANTS[status] ?? "outline"} className={className}>
      {labelFor(IDEA_STATUSES, status)}
    </Badge>
  );
}
