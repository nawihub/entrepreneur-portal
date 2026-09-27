import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface FilterBarProps {
  /** Usually a <SearchField>, shown first and full-width on small screens. */
  search: React.ReactNode;
  /** Filter controls, wrapped onto as many lines as needed. */
  children?: React.ReactNode;
  activeCount: number;
  onClear: () => void;
  className?: string;
}

export function FilterBar({ search, children, activeCount, onClear, className }: FilterBarProps) {
  return (
    <div className={cn("mb-6 flex flex-col gap-3", className)} role="search">
      {search}
      {(children || activeCount > 0) && (
        <div className="flex flex-wrap items-center gap-2">
          {children}
          {activeCount > 0 && (
            <button
              type="button"
              onClick={onClear}
              className="flex h-9 items-center gap-1 rounded-full px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <X className="size-3.5" /> Clear {activeCount > 1 ? `all (${activeCount})` : "filter"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
