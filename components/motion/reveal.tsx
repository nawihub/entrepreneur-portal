"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Fades its content up once it scrolls into view. Content renders visible on the server and
 * is only hidden after hydration if it is still below the fold, so nothing is lost without JS.
 */
export function Reveal({
  children,
  className,
  delay = 0,
  as: Tag = "div",
}: {
  children: React.ReactNode;
  className?: string;
  /** Extra delay in ms, for staggering sibling sections. */
  delay?: number;
  as?: "div" | "section" | "aside" | "li";
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<"idle" | "pending" | "shown">("idle");

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    // Already on screen at mount: animate straight in rather than flashing hidden first.
    const rect = el.getBoundingClientRect();
    const inView = rect.top < window.innerHeight && rect.bottom > 0;
    // Deferred so the hidden state paints before the transition to "shown".
    const frame = requestAnimationFrame(() => setState(inView ? "shown" : "pending"));
    if (inView) return () => cancelAnimationFrame(frame);

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setState("shown");
          observer.disconnect();
        }
      },
      { rootMargin: "0px 0px -8% 0px" },
    );
    observer.observe(el);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, []);

  return (
    <Tag
      ref={ref as React.Ref<never>}
      data-reveal={state === "idle" ? undefined : state}
      style={{ "--reveal-delay": `${delay}ms` } as React.CSSProperties}
      className={cn(className)}
    >
      {children}
    </Tag>
  );
}
