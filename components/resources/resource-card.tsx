import Link from "next/link";
import { FileText, Lock, PlayCircle, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import { BookmarkButton } from "@/components/resources/bookmark-button";
import { RatingSummary } from "@/components/resources/rating-stars";
import { resolveMediaUrl } from "@/lib/media-url";
import { FadeImage } from "@/components/motion/fade-image";
import type { Resource } from "@/lib/api/types";

const FORMAT_LABELS: Record<string, string> = {
  TEMPLATE: "Template",
  GUIDE: "Guide",
  CHECKLIST: "Checklist",
  CASE_STUDY: "Case study",
  COURSE: "Course",
  FRAMEWORK: "Framework",
};

/** Singular label for a card or detail page ("Template", "Video"). */
export function resourceKindLabel(resource: Pick<Resource, "type" | "format">) {
  if (resource.type === "VIDEO") return "Video";
  return FORMAT_LABELS[resource.format] ?? "Resource";
}

export function ResourceThumbnail({ resource, className }: { resource: Resource; className?: string }) {
  const src = resolveMediaUrl(resource.thumbnailUrl);
  const isVideo = resource.type === "VIDEO";
  return (
    <div className={`tile-cover aspect-[16/10] border-b border-border bg-muted ${className ?? ""}`}>
      {src ? (
        // Thumbnails are small pre-sized JPEGs from the gateway - no need for the image optimizer.
        // Document thumbnails are page renders - anchor to the top, where titles usually are,
        // rather than cropping to the (often blank) middle of the page.
        <FadeImage
          src={src}
          alt=""
          fill
          unoptimized
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className={`tile-cover-media ${isVideo ? "object-cover" : "object-cover object-top"}`}
        />
      ) : (
        <div className="tile-cover-media flex h-full items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 text-primary-600 dark:from-primary-900/40 dark:to-primary-800/30 dark:text-primary-300">
          {isVideo ? <PlayCircle className="size-10" /> : <FileText className="size-10" />}
        </div>
      )}
      {isVideo && src && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/15">
          <PlayCircle className="size-12 text-white drop-shadow-md transition-transform duration-slow ease-spring group-hover:scale-110" />
        </div>
      )}
    </div>
  );
}

export function ResourceCard({ resource, onTagClick }: { resource: Resource; onTagClick?: (tag: string) => void }) {
  const premium = resource.accessLevel === "PREMIUM";
  return (
    <Card className="card-interactive group relative flex h-full flex-col overflow-hidden focus-within:ring-2 focus-within:ring-ring">
      <ResourceThumbnail resource={resource} />
      <div className="absolute left-3 top-3 flex gap-1.5">
        <span className="rounded-full bg-card/90 px-2.5 py-1 text-[11px] font-semibold shadow-sm ring-1 ring-border backdrop-blur">
          {resourceKindLabel(resource)}
        </span>
        {premium && (
          <span className="flex items-center gap-1 rounded-full bg-secondary-500 px-2.5 py-1 text-[11px] font-semibold text-white shadow-sm">
            <Lock className="size-3" /> Premium
          </span>
        )}
      </div>
      <BookmarkButton resource={resource} className="absolute right-3 top-3 z-10" />

      <div className="flex flex-1 flex-col gap-2 p-4">
        <Link
          href={`/resources/${resource.id}`}
          className="font-display text-base font-semibold leading-snug outline-none after:absolute after:inset-0 after:content-[''] group-hover:text-primary-700 dark:group-hover:text-primary-300"
        >
          {resource.featured && <Sparkles className="mr-1 inline size-4 text-secondary-500" aria-label="Featured" />}
          {resource.title}
        </Link>
        <p className="line-clamp-2 text-sm text-muted-foreground">{resource.description}</p>
        <div className="mt-auto flex flex-wrap items-center justify-between gap-2 pt-2">
          <RatingSummary average={resource.averageRating} count={resource.ratingCount} />
          {resource.tags.length > 0 && (
            <div className="relative z-10 flex flex-wrap gap-1">
              {resource.tags.slice(0, 2).map((tag) =>
                onTagClick ? (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => onTagClick(tag)}
                    className="rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground hover:bg-primary-100 hover:text-primary-800 dark:hover:bg-primary-900/50 dark:hover:text-primary-200"
                  >
                    {formatTag(tag)}
                  </button>
                ) : (
                  <span key={tag} className="rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">
                    {formatTag(tag)}
                  </span>
                ),
              )}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

/** "stage:launch" -> "Launch" - namespaced tags read better without their namespace. */
export function formatTag(tag: string) {
  const value = tag.includes(":") ? tag.slice(tag.indexOf(":") + 1) : tag;
  return value.replaceAll("-", " ").replace(/^\w/, (c) => c.toUpperCase());
}
