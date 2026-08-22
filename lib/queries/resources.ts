import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { resourcesApi } from "@/lib/api/resources";

export const resourceKeys = {
  all: ["resources"] as const,
  detail: (id: string) => [...resourceKeys.all, "detail", id] as const,
  list: (params?: unknown) => [...resourceKeys.all, "list", params] as const,
};

export function useResource(id: string | undefined) {
  return useQuery({
    queryKey: resourceKeys.detail(id ?? ""),
    queryFn: () => resourcesApi.get(id!),
    enabled: Boolean(id),
  });
}

export function useResourcesFeed(params?: Parameters<typeof resourcesApi.list>[0]) {
  return useInfiniteQuery({
    queryKey: resourceKeys.list(params),
    queryFn: ({ pageParam }) =>
      resourcesApi.list({ ...params, pageToken: pageParam as string | undefined }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => (lastPage.hasNextPage ? lastPage.nextPageToken ?? undefined : undefined),
  });
}
