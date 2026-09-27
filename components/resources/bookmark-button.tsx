"use client";

import { Bookmark } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useToggleBookmark } from "@/lib/queries/resources";
import { cn } from "@/lib/utils";
import type { Resource } from "@/lib/api/types";

interface BookmarkButtonProps {
  resource: Pick<Resource, "id" | "bookmarked" | "title">;
  /** "icon" for cards, "full" (icon + label) for the detail page. */
  variant?: "icon" | "full";
  className?: string;
}

export function BookmarkButton({ resource, variant = "icon", className }: BookmarkButtonProps) {
  const toggle = useToggleBookmark();
  const saved = resource.bookmarked;
  const label = saved ? "Saved" : "Save";

  function onClick(e: React.MouseEvent) {
    // Cards are one big link - don't navigate when saving from a card.
    e.preventDefault();
    e.stopPropagation();
    toggle.mutate(
      { id: resource.id, bookmarked: !saved },
      {
        onSuccess: () => toast.success(saved ? "Removed from saved resources" : "Saved - find it under Saved"),
        onError: () => toast.error("Couldn't update your saved resources. Try again."),
      },
    );
  }

  const icon = <Bookmark className={cn("size-4", saved && "fill-current")} />;

  if (variant === "full") {
    return (
      <Button variant={saved ? "secondary" : "outline"} onClick={onClick} aria-pressed={saved} className={className}>
        {icon} {label}
      </Button>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={saved}
      aria-label={saved ? `Remove ${resource.title} from saved` : `Save ${resource.title}`}
      className={cn(
        "flex size-9 items-center justify-center rounded-full bg-card/90 shadow-sm ring-1 ring-border backdrop-blur transition-colors hover:bg-card",
        saved ? "text-secondary-600 dark:text-secondary-400" : "text-muted-foreground hover:text-foreground",
        className,
      )}
    >
      {icon}
    </button>
  );
}
