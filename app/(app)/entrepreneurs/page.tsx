"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Search, Users, MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/empty-state";
import { LoadMoreButton } from "@/components/load-more-button";
import { useInfiniteQuery } from "@tanstack/react-query";
import { entrepreneursApi } from "@/lib/api/entrepreneurs";
import { entrepreneurKeys } from "@/lib/queries/entrepreneurs";

function DirectoryContent() {
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("query") ?? "");
  const [activeQuery, setActiveQuery] = useState(query);

  const { data, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage } = useInfiniteQuery({
    queryKey: entrepreneurKeys.list({ query: activeQuery }),
    queryFn: ({ pageParam }) =>
      entrepreneursApi.list({ query: activeQuery || undefined, pageSize: 12, pageToken: pageParam }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => (lastPage.hasNextPage ? lastPage.nextPageToken ?? undefined : undefined),
  });

  const items = data?.pages.flatMap((p) => p.items) ?? [];

  return (
    <div className="container-page py-6">
      <div className="mb-6 flex flex-col gap-2">
        <h1 className="font-display text-2xl font-semibold">Entrepreneur directory</h1>
        <p className="text-muted-foreground">Discover founders building across Sierra Leone.</p>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          setActiveQuery(query);
        }}
        className="relative mb-6 max-w-md"
      >
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name, skill, or location…"
          className="pl-9"
        />
      </form>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-40" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <EmptyState icon={Users} title="No entrepreneurs found" description="Try a different search term." />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((entrepreneur) => (
              <Link key={entrepreneur.id} href={`/profile/${entrepreneur.id}`}>
                <Card className="card-interactive h-full animate-fade-in-up">
                  <CardContent className="flex flex-col items-center gap-2 pt-6 text-center">
                    <Avatar className="size-16">
                      <AvatarImage src={entrepreneur.profilePhotoUrl ?? undefined} />
                      <AvatarFallback>{entrepreneur.firstName?.[0]}</AvatarFallback>
                    </Avatar>
                    <p className="font-display font-semibold">
                      {entrepreneur.firstName} {entrepreneur.lastName}
                    </p>
                    {entrepreneur.currentLocation && (
                      <p className="flex items-center gap-1 text-xs text-muted-foreground">
                        <MapPin className="size-3" /> {entrepreneur.currentLocation}
                      </p>
                    )}
                    <div className="flex flex-wrap justify-center gap-1.5">
                      {entrepreneur.vetted && <Badge variant="vetted">Vetted</Badge>}
                      {entrepreneur.featured && <Badge variant="featured">Featured</Badge>}
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

export default function EntrepreneursDirectoryPage() {
  return (
    <Suspense>
      <DirectoryContent />
    </Suspense>
  );
}
