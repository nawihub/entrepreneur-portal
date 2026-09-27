"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

/** Read-only average, e.g. "★★★★☆ 4.3 (12)". Partial stars are rounded to the nearest half. */
export function RatingSummary({ average, count, size = "sm", className }: { average: number; count: number; size?: "sm" | "md"; className?: string }) {
  if (count === 0) {
    return <span className={cn("text-xs text-muted-foreground", className)}>No ratings yet</span>;
  }
  const iconClass = size === "sm" ? "size-3.5" : "size-4";
  return (
    <span className={cn("inline-flex items-center gap-1.5", className)} aria-label={`Rated ${average.toFixed(1)} out of 5 by ${count} ${count === 1 ? "person" : "people"}`}>
      <span className="flex" aria-hidden>
        {[1, 2, 3, 4, 5].map((n) => {
          const fill = Math.max(0, Math.min(1, Math.round((average - n + 1) * 2) / 2));
          return (
            <span key={n} className={cn("relative", iconClass)}>
              <Star className={cn("absolute inset-0 text-neutral-300 dark:text-neutral-600", iconClass)} />
              {fill > 0 && (
                <span className="absolute inset-0 overflow-hidden" style={{ width: `${fill * 100}%` }}>
                  <Star className={cn("fill-warning text-warning", iconClass)} />
                </span>
              )}
            </span>
          );
        })}
      </span>
      <span className={cn("font-medium", size === "sm" ? "text-xs" : "text-sm")}>{average.toFixed(1)}</span>
      <span className={cn("text-muted-foreground", size === "sm" ? "text-xs" : "text-sm")}>({count})</span>
    </span>
  );
}

interface RatingInputProps {
  value: number | null;
  onChange: (rating: number) => void;
  disabled?: boolean;
}

/** The caller's own 1-5 rating. A radio group, so arrow keys work like any other rating control. */
export function RatingInput({ value, onChange, disabled }: RatingInputProps) {
  const [hover, setHover] = useState<number | null>(null);
  const shown = hover ?? value ?? 0;
  return (
    <div
      role="radiogroup"
      aria-label="Your rating"
      className={cn("flex gap-1", disabled && "pointer-events-none opacity-50")}
      onMouseLeave={() => setHover(null)}
    >
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          role="radio"
          aria-checked={value === n}
          aria-label={`${n} star${n === 1 ? "" : "s"}`}
          tabIndex={(value ?? 1) === n ? 0 : -1}
          disabled={disabled}
          onMouseEnter={() => setHover(n)}
          onClick={() => onChange(n)}
          onKeyDown={(e) => {
            if (e.key === "ArrowRight" || e.key === "ArrowUp") {
              e.preventDefault();
              onChange(Math.min(5, (value ?? 0) + 1));
            } else if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
              e.preventDefault();
              onChange(Math.max(1, (value ?? 2) - 1));
            }
          }}
          className="rounded-md p-0.5 transition-transform hover:scale-110 focus-visible:scale-110"
        >
          <Star className={cn("size-7", n <= shown ? "fill-warning text-warning" : "text-neutral-300 dark:text-neutral-600")} />
        </button>
      ))}
    </div>
  );
}
