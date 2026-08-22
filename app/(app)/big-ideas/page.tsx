"use client";

import Link from "next/link";
import { Lightbulb, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/empty-state";
import { LoadMoreButton } from "@/components/load-more-button";
import { BigIdeaCard } from "@/components/feed/big-idea-card";
import { useBigIdeasFeed } from "@/lib/queries/big-ideas";

export default function BigIdeasPage() {
  const { data, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage } = useBigIdeasFeed({ pageSize: 10 });
  const items = data?.pages.flatMap((p) => p.items) ?? [];

  return (
    <div className="container-page py-6">
      <div className="mb-6 flex items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold">Big Ideas</h1>
          <p className="text-muted-foreground">Pitch submissions from entrepreneurs across the network.</p>
        </div>
        <Button asChild>
          <Link href="/big-ideas/new">
            <Plus className="size-4" /> Pitch an idea
          </Link>
        </Button>
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <EmptyState icon={Lightbulb} title="No Big Ideas yet" description="Be the first to pitch one." />
      ) : (
        <div className="flex flex-col gap-4">
          {items.map((idea) => (
            <BigIdeaCard key={idea.id} idea={idea} />
          ))}
        </div>
      )}
      <LoadMoreButton hasNextPage={hasNextPage} isFetching={isFetchingNextPage} onClick={() => fetchNextPage()} />
    </div>
  );
}
