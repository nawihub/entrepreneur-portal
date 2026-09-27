"use client";

import { Suspense } from "react";
import { Bookmark, BookOpen, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ListPageHeader, ListResults } from "@/components/list-results";
import { FilterBar } from "@/components/filters/filter-bar";
import { SearchField } from "@/components/filters/search-field";
import { SelectFilter } from "@/components/filters/select-filter";
import { ResourceCard, formatTag } from "@/components/resources/resource-card";
import { useBookmarkedResources, useResourcesFeed } from "@/lib/queries/resources";
import { useUrlFilters } from "@/lib/hooks/use-url-filters";
import { RESOURCE_FORMATS, RESOURCE_TYPES } from "@/lib/data/filter-options";
import type { ResourceFormat, ResourceType } from "@/lib/api/types";

const VIEW = { single: ["view"] } as const;
const FILTERS = { single: ["q", "type", "format"], multi: ["tags"] } as const;

export default function ResourcesPage() {
  return (
    <div className="container-page py-6">
      <ListPageHeader title="Resources" description="Templates, guides and videos to help you plan, launch and grow." />
      {/* useSearchParams needs a Suspense boundary for production builds. */}
      <Suspense>
        <ResourcesContent />
      </Suspense>
    </div>
  );
}

function ResourcesContent() {
  const view = useUrlFilters(VIEW);
  const saved = view.values.view === "saved";

  return (
    <Tabs value={saved ? "saved" : "all"} onValueChange={(v) => view.update({ view: v === "saved" ? "saved" : "" })}>
      <TabsList className="mb-5">
        <TabsTrigger value="all">
          <BookOpen className="size-4" /> All resources
        </TabsTrigger>
        <TabsTrigger value="saved">
          <Bookmark className="size-4" /> Saved
        </TabsTrigger>
      </TabsList>
      {saved ? <SavedResources onBrowse={() => view.update({ view: "" })} /> : <AllResources />}
    </Tabs>
  );
}

function AllResources() {
  const { values, update, clear, activeCount } = useUrlFilters(FILTERS);
  const isVideo = values.type === "VIDEO";
  const feed = useResourcesFeed({
    pageSize: 12,
    query: values.q || undefined,
    type: (values.type || undefined) as ResourceType | undefined,
    // Videos have no document format, so a format filter would match nothing.
    format: (isVideo ? undefined : values.format || undefined) as ResourceFormat | undefined,
    tags: values.tags,
  });

  return (
    <>
      <FilterBar
        activeCount={activeCount}
        onClear={clear}
        search={<SearchField value={values.q} onChange={(q) => update({ q })} placeholder="Search resources…" className="max-w-xl" />}
      >
        <SelectFilter
          label="Type"
          value={values.type}
          options={RESOURCE_TYPES}
          onChange={(type) => update({ type, ...(type === "VIDEO" ? { format: "" } : {}) })}
        />
        {!isVideo && <SelectFilter label="Format" value={values.format} options={RESOURCE_FORMATS} onChange={(format) => update({ format })} />}
        {values.tags.map((tag) => (
          <button
            key={tag}
            type="button"
            onClick={() => update({ tags: values.tags.filter((t) => t !== tag) })}
            className="flex h-9 items-center gap-1.5 rounded-full border border-primary-500 bg-primary-50 px-3 text-sm text-primary-800 dark:bg-primary-900/40 dark:text-primary-200"
            aria-label={`Remove tag filter ${formatTag(tag)}`}
          >
            #{formatTag(tag)} <X className="size-3.5" />
          </button>
        ))}
      </FilterBar>

      <ListResults
        layout="grid"
        query={feed}
        getKey={(r) => r.id}
        renderItem={(resource) => (
          <ResourceCard
            resource={resource}
            onTagClick={(tag) => !values.tags.includes(tag) && update({ tags: [...values.tags, tag] })}
          />
        )}
        isFiltered={activeCount > 0}
        onClearFilters={clear}
        empty={{ icon: BookOpen, title: "No resources yet", description: "New templates, guides and videos will appear here as they're published." }}
      />
    </>
  );
}

function SavedResources({ onBrowse }: { onBrowse: () => void }) {
  const saved = useBookmarkedResources();
  return (
    <ListResults
      layout="grid"
      query={saved}
      getKey={(r) => r.id}
      renderItem={(resource) => <ResourceCard resource={resource} />}
      empty={{
        icon: Bookmark,
        title: "Nothing saved yet",
        description: "Tap the bookmark on any resource to keep it here for later.",
        action: (
          <Button variant="outline" size="sm" onClick={onBrowse}>
            Browse resources
          </Button>
        ),
      }}
    />
  );
}
