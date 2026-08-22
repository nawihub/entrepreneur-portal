"use client";

import Link from "next/link";
import { BookOpen, Folder, Tag } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/empty-state";
import { LoadMoreButton } from "@/components/load-more-button";
import { useResourcesFeed } from "@/lib/queries/resources";

export default function ResourcesPage() {
  const { data, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage, isError } = useResourcesFeed({ pageSize: 12 });
  const items = data?.pages.flatMap((p) => p.items) ?? [];

  return (
    <div className="container-page py-6">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-semibold">Resources</h1>
        <p className="text-muted-foreground">Templates, guides, and documents for building your venture.</p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      ) : isError || items.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No resources available"
          description={
            isError
              ? "The resources list endpoint isn't confirmed against the live API yet - see lib/api/resources.ts."
              : "Check back soon for templates and guides."
          }
        />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((resource) => (
              <Link key={resource.id} href={`/resources/${resource.id}`}>
                <Card className="card-interactive h-full animate-fade-in-up">
                  <CardContent className="flex flex-col gap-2 pt-6">
                    <div className="flex size-9 items-center justify-center rounded-lg bg-primary-100 text-primary-700 dark:bg-primary-900/50 dark:text-primary-300">
                      <BookOpen className="size-4" />
                    </div>
                    <p className="font-display font-semibold">{resource.title}</p>
                    {resource.description && <p className="line-clamp-2 text-sm text-muted-foreground">{resource.description}</p>}
                    <div className="mt-1 flex flex-wrap gap-2 text-xs text-muted-foreground">
                      {resource.folder && (
                        <span className="flex items-center gap-1">
                          <Folder className="size-3" /> {resource.folder}
                        </span>
                      )}
                      {resource.tags.slice(0, 2).map((tag) => (
                        <span key={tag} className="flex items-center gap-1">
                          <Tag className="size-3" /> {tag}
                        </span>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
          <LoadMoreButton hasNextPage={hasNextPage} isFetching={isFetchingNextPage} onClick={() => fetchNextPage()} />
        </>
      )}
    </div>
  );
}
