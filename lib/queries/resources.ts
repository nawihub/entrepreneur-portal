import { keepPreviousData, useInfiniteQuery, useMutation, useQuery, useQueryClient, type InfiniteData, type QueryClient } from "@tanstack/react-query";
import { resourcesApi, type ResourceFilters } from "@/lib/api/resources";
import type { Page, Resource } from "@/lib/api/types";

export const resourceKeys = {
  all: ["resources"] as const,
  detail: (id: string) => [...resourceKeys.all, "detail", id] as const,
  list: (params?: unknown) => [...resourceKeys.all, "list", params] as const,
  bookmarks: () => [...resourceKeys.all, "bookmarks"] as const,
};

export function useResource(id: string | undefined) {
  return useQuery({
    queryKey: resourceKeys.detail(id ?? ""),
    queryFn: () => resourcesApi.get(id!),
    enabled: Boolean(id),
  });
}

export function useResourcesFeed(filters: ResourceFilters & { pageSize?: number }) {
  return useInfiniteQuery({
    queryKey: resourceKeys.list(filters),
    queryFn: ({ pageParam }) => resourcesApi.listApproved({ ...filters, pageToken: pageParam as string | undefined }),
    // Keep showing the previous results (dimmed) while a new search/filter loads.
    placeholderData: keepPreviousData,
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => (lastPage.hasNextPage ? lastPage.nextPageToken ?? undefined : undefined),
  });
}

export function useBookmarkedResources(pageSize = 12) {
  return useInfiniteQuery({
    queryKey: resourceKeys.bookmarks(),
    queryFn: ({ pageParam }) => resourcesApi.listBookmarks({ pageSize, pageToken: pageParam as string | undefined }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => (lastPage.hasNextPage ? lastPage.nextPageToken ?? undefined : undefined),
  });
}

/**
 * Applies a change to one resource everywhere it is cached (its detail entry and every
 * list page), returning a function that restores the previous state.
 */
function patchCachedResource(queryClient: QueryClient, id: string, patch: (r: Resource) => Resource) {
  const detailKey = resourceKeys.detail(id);
  const previousDetail = queryClient.getQueryData<Resource>(detailKey);
  const previousLists = queryClient.getQueriesData<InfiniteData<Page<Resource>>>({
    predicate: (query) => query.queryKey[0] === resourceKeys.all[0] && (query.queryKey[1] === "list" || query.queryKey[1] === "bookmarks"),
  });

  if (previousDetail) queryClient.setQueryData(detailKey, patch(previousDetail));
  for (const [key, data] of previousLists) {
    if (!data) continue;
    queryClient.setQueryData<InfiniteData<Page<Resource>>>(key, {
      ...data,
      pages: data.pages.map((page) => ({
        ...page,
        items: page.items.map((item) => (item.id === id ? patch(item) : item)),
      })),
    });
  }

  return () => {
    if (previousDetail) queryClient.setQueryData(detailKey, previousDetail);
    for (const [key, data] of previousLists) queryClient.setQueryData(key, data);
  };
}

export function useToggleBookmark() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, bookmarked }: { id: string; bookmarked: boolean }) =>
      bookmarked ? resourcesApi.bookmark(id) : resourcesApi.removeBookmark(id),
    // Optimistic: the icon flips immediately and rolls back if the request fails.
    onMutate: ({ id, bookmarked }) => ({
      rollback: patchCachedResource(queryClient, id, (r) => ({ ...r, bookmarked })),
    }),
    onError: (_err, _vars, context) => context?.rollback(),
    onSettled: () => queryClient.invalidateQueries({ queryKey: resourceKeys.bookmarks() }),
  });
}

export function useRateResource() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, rating }: { id: string; rating: number | null }) =>
      rating === null ? resourcesApi.removeRating(id) : resourcesApi.rate(id, rating),
    onMutate: ({ id, rating }) => ({
      rollback: patchCachedResource(queryClient, id, (r) => ({ ...r, myRating: rating })),
    }),
    onError: (_err, _vars, context) => context?.rollback(),
    // The server returns the new aggregate - apply it rather than guessing client-side.
    onSuccess: (summary, { id }) => {
      patchCachedResource(queryClient, id, (r) => ({
        ...r,
        averageRating: summary.averageRating,
        ratingCount: summary.ratingCount,
        myRating: summary.myRating,
      }));
    },
  });
}
