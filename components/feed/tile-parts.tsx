import { cn } from "@/lib/utils";

/** Two-letter initials for people and businesses without a photo/logo. */
export function initialsOf(name: string | null | undefined) {
  const parts = (name ?? "").trim().split(/\s+/).filter(Boolean);
  const letters = parts.length > 1 ? parts[0][0] + parts[parts.length - 1][0] : (parts[0] ?? "?").slice(0, 2);
  return letters.toUpperCase();
}

// On-brand gradients a name hashes into, so a business keeps the same colours everywhere.
// Kept visually distinct from each other so neighbouring tiles rarely look alike.
const MONOGRAM_GRADIENTS = [
  "from-primary-400 to-primary-700",
  "from-secondary-300 to-secondary-600",
  "from-info to-primary-500",
  "from-secondary-500 to-error",
  "from-primary-300 to-secondary-400",
  "from-info to-secondary-400",
];

export function gradientFor(seed: string) {
  // FNV-1a: spreads similar names (same length, shared words) far better than a plain multiply.
  let hash = 0x811c9dc5;
  for (let i = 0; i < seed.length; i++) {
    hash ^= seed.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return MONOGRAM_GRADIENTS[hash % MONOGRAM_GRADIENTS.length];
}

export function InitialsAvatar({ name, className }: { name: string; className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        "flex size-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-[10px] font-semibold text-white ring-2 ring-card",
        gradientFor(name),
        className,
      )}
    >
      {initialsOf(name)}
    </span>
  );
}

/** A row of segments filling up to `value` of `total` - animates in on mount. */
export function SegmentMeter({
  value,
  total,
  tone = "primary",
  label,
}: {
  value: number;
  total: number;
  tone?: "primary" | "secondary" | "error";
  label: string;
}) {
  const fill = { primary: "bg-primary-500", secondary: "bg-secondary-500", error: "bg-error" }[tone];
  return (
    <div className="flex gap-1" role="meter" aria-label={label} aria-valuemin={0} aria-valuemax={total} aria-valuenow={value}>
      {Array.from({ length: total }).map((_, i) => (
        <span key={i} className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
          {i < value && (
            <span
              className={cn("block h-full origin-left animate-grow-x rounded-full", fill)}
              style={{ animationDelay: `${150 + i * 90}ms` }}
            />
          )}
        </span>
      ))}
    </div>
  );
}
