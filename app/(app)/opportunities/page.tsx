"use client";

import Link from "next/link";
import { HandCoins, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/empty-state";
import { LoadMoreButton } from "@/components/load-more-button";
import { OpportunityCard } from "@/components/feed/opportunity-card";
import { useOpportunitiesFeed } from "@/lib/queries/opportunities";

export default function OpportunitiesPage() {
  const { data, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage } = useOpportunitiesFeed({ pageSize: 10 });
  const items = data?.pages.flatMap((p) => p.items) ?? [];

  return (
    <div className="container-page py-6">
      <div className="mb-6 flex items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold">Opportunities</h1>
          <p className="text-muted-foreground">Funding, grants, and programs for young entrepreneurs.</p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/opportunities/analysis">
            <BarChart3 className="size-4" /> Insights
          </Link>
        </Button>
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <EmptyState icon={HandCoins} title="No opportunities yet" description="Check back soon." />
      ) : (
        <div className="flex flex-col gap-4">
          {items.map((opp) => (
            <OpportunityCard key={opp.id} opportunity={opp} />
          ))}
        </div>
      )}
      <LoadMoreButton hasNextPage={hasNextPage} isFetching={isFetchingNextPage} onClick={() => fetchNextPage()} />
    </div>
  );
}
