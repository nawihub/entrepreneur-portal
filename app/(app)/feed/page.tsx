"use client";

import Link from "next/link";
import { Lightbulb, HandCoins, Building2, Compass, Plus } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/empty-state";
import { LoadMoreButton } from "@/components/load-more-button";
import { BigIdeaCard } from "@/components/feed/big-idea-card";
import { OpportunityCard } from "@/components/feed/opportunity-card";
import { BusinessCard } from "@/components/feed/business-card";
import { LeftRail } from "@/components/nav/left-rail";
import { RightRail } from "@/components/nav/right-rail";
import { useBigIdeasFeed } from "@/lib/queries/big-ideas";
import { useOpportunitiesFeed } from "@/lib/queries/opportunities";
import { useBusinessesFeed } from "@/lib/queries/businesses";
import type { BigIdea, Business, Opportunity } from "@/lib/api/types";

function CardSkeletons() {
  return (
    <div className="flex flex-col gap-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <Skeleton key={i} className="h-32 w-full" />
      ))}
    </div>
  );
}

export default function FeedPage() {
  const bigIdeas = useBigIdeasFeed({ pageSize: 6 });
  const opportunities = useOpportunitiesFeed({ pageSize: 6 });
  const businesses = useBusinessesFeed({ pageSize: 6 });

  const ideaItems = bigIdeas.data?.pages.flatMap((p) => p.items) ?? [];
  const oppItems = opportunities.data?.pages.flatMap((p) => p.items) ?? [];
  const bizItems = businesses.data?.pages.flatMap((p) => p.items) ?? [];

  // "For You" interleaves the three domains (newest-first within each,
  // round-robin across domains) rather than a real relevance-ranked
  // algorithm - there's no signal from the API yet (interests, follows,
  // location match) to rank on, so this is a deliberately simple
  // placeholder for "your call" on the feed algorithm.
  const forYou = interleave([ideaItems.slice(0, 4), oppItems.slice(0, 4), bizItems.slice(0, 4)]);

  return (
    <div className="container-page grid grid-cols-1 gap-6 py-6 lg:grid-cols-[minmax(0,260px)_minmax(0,1fr)] xl:grid-cols-[260px_minmax(0,1fr)_280px]">
      <aside className="hidden lg:block">
        <div className="sticky top-20">
          <LeftRail />
        </div>
      </aside>

      <main className="min-w-0">
        <Tabs defaultValue="for-you">
          <div className="flex items-center justify-between gap-3">
            <TabsList>
              <TabsTrigger value="for-you">For you</TabsTrigger>
              <TabsTrigger value="big-ideas">Big Ideas</TabsTrigger>
              <TabsTrigger value="opportunities">Opportunities</TabsTrigger>
              <TabsTrigger value="businesses">Businesses</TabsTrigger>
            </TabsList>
            <Button size="sm" asChild>
              <Link href="/big-ideas/new">
                <Plus className="size-4" /> Pitch an idea
              </Link>
            </Button>
          </div>

          <TabsContent value="for-you" className="flex flex-col gap-4">
            {bigIdeas.isLoading || opportunities.isLoading || businesses.isLoading ? (
              <CardSkeletons />
            ) : forYou.length === 0 ? (
              <EmptyState
                icon={Compass}
                title="Nothing here yet"
                description="Once ideas, opportunities, and businesses start flowing in, they'll show up here."
              />
            ) : (
              forYou.map((entry) =>
                entry.kind === "idea" ? (
                  <BigIdeaCard key={`idea-${entry.item.id}`} idea={entry.item} />
                ) : entry.kind === "opportunity" ? (
                  <OpportunityCard key={`opp-${entry.item.id}`} opportunity={entry.item} />
                ) : (
                  <BusinessCard key={`biz-${entry.item.id}`} business={entry.item} />
                ),
              )
            )}
          </TabsContent>

          <TabsContent value="big-ideas" className="flex flex-col gap-4">
            {bigIdeas.isLoading ? (
              <CardSkeletons />
            ) : ideaItems.length === 0 ? (
              <EmptyState icon={Lightbulb} title="No Big Ideas yet" description="Be the first to pitch one." />
            ) : (
              ideaItems.map((idea) => <BigIdeaCard key={idea.id} idea={idea} />)
            )}
            <LoadMoreButton
              hasNextPage={bigIdeas.hasNextPage}
              isFetching={bigIdeas.isFetchingNextPage}
              onClick={() => bigIdeas.fetchNextPage()}
            />
          </TabsContent>

          <TabsContent value="opportunities" className="flex flex-col gap-4">
            {opportunities.isLoading ? (
              <CardSkeletons />
            ) : oppItems.length === 0 ? (
              <EmptyState icon={HandCoins} title="No opportunities yet" description="Check back soon for funding and programs." />
            ) : (
              oppItems.map((opp) => <OpportunityCard key={opp.id} opportunity={opp} />)
            )}
            <LoadMoreButton
              hasNextPage={opportunities.hasNextPage}
              isFetching={opportunities.isFetchingNextPage}
              onClick={() => opportunities.fetchNextPage()}
            />
          </TabsContent>

          <TabsContent value="businesses" className="flex flex-col gap-4">
            {businesses.isLoading ? (
              <CardSkeletons />
            ) : bizItems.length === 0 ? (
              <EmptyState icon={Building2} title="No businesses listed yet" description="Registered businesses will show up here." />
            ) : (
              bizItems.map((biz) => <BusinessCard key={biz.id} business={biz} />)
            )}
            <LoadMoreButton
              hasNextPage={businesses.hasNextPage}
              isFetching={businesses.isFetchingNextPage}
              onClick={() => businesses.fetchNextPage()}
            />
          </TabsContent>
        </Tabs>
      </main>

      <aside className="hidden xl:block">
        <div className="sticky top-20">
          <RightRail />
        </div>
      </aside>
    </div>
  );
}

type FeedEntry =
  | { kind: "idea"; item: BigIdea }
  | { kind: "opportunity"; item: Opportunity }
  | { kind: "business"; item: Business };

function interleave(lists: [BigIdea[], Opportunity[], Business[]]): FeedEntry[] {
  const [ideas, opps, bizs] = lists;
  const kinds: FeedEntry["kind"][] = ["idea", "opportunity", "business"];
  const sources: Array<BigIdea[] | Opportunity[] | Business[]> = [ideas, opps, bizs];
  const result: FeedEntry[] = [];
  const maxLen = Math.max(ideas.length, opps.length, bizs.length);
  for (let i = 0; i < maxLen; i++) {
    for (let s = 0; s < sources.length; s++) {
      const item = sources[s][i];
      if (item) result.push({ kind: kinds[s], item } as FeedEntry);
    }
  }
  return result;
}
