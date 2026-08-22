"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface ProfileScoreRingProps {
  /** 0-100 profile completeness score from EntrepreneurProfile.profileScore. */
  score: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
  children?: React.ReactNode;
}

/** LinkedIn-style circular completeness meter. Animates from 0 to `score`
 * on mount/update by transitioning stroke-dashoffset, using the design
 * system's spring easing so it feels alive rather than mechanical. */
export function ProfileScoreRing({
  score,
  size = 64,
  strokeWidth = 5,
  className,
  children,
}: ProfileScoreRingProps) {
  const clamped = Math.max(0, Math.min(100, score));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const [animatedOffset, setAnimatedOffset] = useState(circumference);

  useEffect(() => {
    const targetOffset = circumference - (clamped / 100) * circumference;
    const raf = requestAnimationFrame(() => setAnimatedOffset(targetOffset));
    return () => cancelAnimationFrame(raf);
  }, [circumference, clamped]);

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="hsl(var(--muted))"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="url(#profile-score-gradient)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={animatedOffset}
          style={{ transition: "stroke-dashoffset var(--duration-slower) var(--ease-spring)" }}
        />
        <defs>
          <linearGradient id="profile-score-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(var(--color-primary-400))" />
            <stop offset="100%" stopColor="hsl(var(--color-secondary-500))" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        {children ?? <span className="font-display text-sm font-semibold">{clamped}%</span>}
      </div>
    </div>
  );
}
