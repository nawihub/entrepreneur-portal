"use client";

import Link from "next/link";
import { Building2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/empty-state";
import { LoadMoreButton } from "@/components/load-more-button";
import { BusinessCard } from "@/components/feed/business-card";
import { useBusinessesFeed } from "@/lib/queries/businesses";

export default function BusinessesPage() {
  const { data, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage } = useBusinessesFeed({ pageSize: 10 });
  const items = data?.pages.flatMap((p) => p.items) ?? [];

  return (
    <div className="container-page py-6">
      <div className="mb-6 flex items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold">My businesses</h1>
          <p className="text-muted-foreground">Businesses you&apos;ve registered on NaWeHub.</p>
        </div>
        <Button asChild>
          <Link href="/businesses/new">
            <Plus className="size-4" /> Register a business
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
        <EmptyState
          icon={Building2}
          title="No businesses yet"
          description="Register your first business to get started."
        />
      ) : (
        <div className="flex flex-col gap-4">
          {items.map((biz) => (
            <BusinessCard key={biz.id} business={biz} />
          ))}
        </div>
      )}
      <LoadMoreButton hasNextPage={hasNextPage} isFetching={isFetchingNextPage} onClick={() => fetchNextPage()} />
    </div>
  );
}
