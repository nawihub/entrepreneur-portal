import { Badge, type BadgeProps } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type Status =
  | "SUBMITTED"
  | "IN_REVIEW"
  | "APPROVED"
  | "DECLINED"
  | "PENDING"
  | "AWAITING_PAYMENT"
  | "REJECTED"
  | "PENDING_VERIFICATION"
  | "ACTIVE"
  | "SUSPENDED"
  | "DEACTIVATED"
  | "INACTIVE";

const STATUS_STYLES: Record<Status, { label: string; variant: BadgeProps["variant"] }> = {
  SUBMITTED: { label: "Submitted", variant: "info" },
  IN_REVIEW: { label: "In review", variant: "warning" },
  APPROVED: { label: "Approved", variant: "success" },
  DECLINED: { label: "Declined", variant: "error" },
  PENDING: { label: "Pending", variant: "info" },
  AWAITING_PAYMENT: { label: "Awaiting payment", variant: "warning" },
  REJECTED: { label: "Rejected", variant: "error" },
  PENDING_VERIFICATION: { label: "Pending verification", variant: "warning" },
  ACTIVE: { label: "Active", variant: "success" },
  SUSPENDED: { label: "Suspended", variant: "error" },
  DEACTIVATED: { label: "Deactivated", variant: "outline" },
  INACTIVE: { label: "Inactive", variant: "outline" },
};

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  const config = STATUS_STYLES[status as Status] ?? { label: status, variant: "outline" as const };
  return (
    <Badge variant={config.variant} className={cn(className)}>
      {config.label}
    </Badge>
  );
}
