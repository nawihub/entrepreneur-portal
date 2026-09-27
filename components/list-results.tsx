"use client";

import type { InfiniteData, UseInfiniteQueryResult } from "@tanstack/react-query";
import { AlertTriangle, SearchX, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/empty-state";
import { LoadMoreButton } from "@/components/load-more-button";
import { cn } from "@/lib/utils";
import type { Page } from "@/lib/api/types";

interface ListResultsProps<T> {
  query: UseInfiniteQueryResult<InfiniteData<Page<T>>>;
  renderItem: (item: T) => React.ReactNode;
  getKey: (item: T) => string;
  /** Shown when nothing exists at all (no filters applied). */
  empty: { icon: LucideIcon; title: string; description?: string; action?: React.ReactNode };
  /** Whether search/filters are narrowing the results - changes the empty state to offer clearing them. */
  isFiltered?: boolean;
  onClearFilters?: () => void;
  layout?: "list" | "grid";
}

export function ListResults<T>({ query, renderItem, getKey, empty, isFiltered, onClearFilters, layout = "list" }: ListResultsProps<T>) {
  const containerClass =
    layout === "grid" ? "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3" : "flex flex-col gap-4";

  if (query.isLoading) {
    return (
      <div className={containerClass} aria-busy="true" aria-label="Loading">
        {Array.from({ length: layout === "grid" ? 6 : 4 }).map((_, i) => (
          <Skeleton key={i} className={layout === "grid" ? "h-72" : "h-32"} />
        ))}
      </div>
    );
  }

  if (query.isError) {
    return (
      <EmptyState
        icon={AlertTriangle}
        title="Couldn't load this list"
        description="Something went wrong on our side. Check your connection and try again."
        action={
          <Button variant="outline" size="sm" onClick={() => query.refetch()}>
            Try again
          </Button>
        }
      />
    );
  }

  const items = query.data?.pages.flatMap((p) => p.items) ?? [];

  if (items.length === 0) {
    return isFiltered ? (
      <EmptyState
        icon={SearchX}
        title="No matches"
        description="Nothing matches your search and filters. Try fewer filters or different words."
        action={
          onClearFilters && (
            <Button variant="outline" size="sm" onClick={onClearFilters}>
              Clear search and filters
            </Button>
          )
        }
      />
    ) : (
      <EmptyState icon={empty.icon} title={empty.title} description={empty.description} action={empty.action} />
    );
  }

  return (
    <>
      <div className={cn(containerClass, query.isFetching && !query.isFetchingNextPage && "opacity-60 transition-opacity")}>
        {items.map((item) => (
          <div key={getKey(item)} className="min-w-0">
            {renderItem(item)}
          </div>
        ))}
      </div>
      <LoadMoreButton
        hasNextPage={query.hasNextPage}
        isFetching={query.isFetchingNextPage}
        onClick={() => query.fetchNextPage()}
      />
    </>
  );
}

export function ListPageHeader({ title, description, action }: { title: string; description: string; action?: React.ReactNode }) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="font-display text-2xl font-semibold sm:text-3xl">{title}</h1>
        <p className="mt-1 text-muted-foreground">{description}</p>
      </div>
      {action}
    </div>
  );
}
