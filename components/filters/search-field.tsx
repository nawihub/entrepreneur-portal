"use client";

import { useEffect, useRef, useState } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface SearchFieldProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  className?: string;
  /** Delay before a keystroke is applied, so each character doesn't trigger a request. */
  debounceMs?: number;
}

export function SearchField({ value, onChange, placeholder, className, debounceMs = 350 }: SearchFieldProps) {
  const [draft, setDraft] = useState(value);
  const lastEmitted = useRef(value);

  // Follow external changes (e.g. "Clear filters") without clobbering what's being typed.
  useEffect(() => {
    if (value !== lastEmitted.current) {
      lastEmitted.current = value;
      setDraft(value);
    }
  }, [value]);

  useEffect(() => {
    if (draft === lastEmitted.current) return;
    const timer = setTimeout(() => {
      lastEmitted.current = draft.trim() ? draft : "";
      onChange(lastEmitted.current);
    }, debounceMs);
    return () => clearTimeout(timer);
  }, [draft, debounceMs, onChange]);

  return (
    <div className={cn("relative", className)}>
      <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        type="search"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            lastEmitted.current = draft;
            onChange(draft);
          }
        }}
        placeholder={placeholder}
        aria-label={placeholder}
        className="pl-9 pr-9 [&::-webkit-search-cancel-button]:hidden"
      />
      {draft && (
        <button
          type="button"
          onClick={() => {
            setDraft("");
            lastEmitted.current = "";
            onChange("");
          }}
          className="absolute right-2 top-1/2 flex size-6 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
          aria-label="Clear search"
        >
          <X className="size-3.5" />
        </button>
      )}
    </div>
  );
}
