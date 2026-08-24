import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { opportunitiesApi } from "@/lib/api/opportunities";

export const opportunityKeys = {
  all: ["opportunities"] as const,
  detail: (id: string) => [...opportunityKeys.all, "detail", id] as const,
  list: (params?: unknown) => [...opportunityKeys.all, "list", params] as const,
  analysis: () => [...opportunityKeys.all, "analysis"] as const,
};

export function useOpportunity(id: string | undefined) {
  return useQuery({
    queryKey: opportunityKeys.detail(id ?? ""),
    queryFn: () => opportunitiesApi.get(id!),
    enabled: Boolean(id),
  });
}

export function useOpportunitiesFeed(params?: Parameters<typeof opportunitiesApi.list>[0]) {
  return useInfiniteQuery({
    queryKey: opportunityKeys.list(params),
    queryFn: ({ pageParam }) =>
      opportunitiesApi.list({ ...params, pageToken: pageParam as string | undefined }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => (lastPage.hasNextPage ? lastPage.nextPageToken ?? undefined : undefined),
  });
}

export function useOpportunityAnalysis() {
  return useQuery({
    queryKey: opportunityKeys.analysis(),
    queryFn: () => opportunitiesApi.analysis(),
  });
}

export function useOpportunityModeration(id: string) {
  const queryClient = useQueryClient();
  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: opportunityKeys.detail(id) }).then();
    queryClient.invalidateQueries({ queryKey: opportunityKeys.all }).then();
  };
  return {
    review: useMutation({ mutationFn: (note?: string) => opportunitiesApi.review(id, note), onSuccess: invalidate }),
    approve: useMutation({ mutationFn: (note?: string) => opportunitiesApi.approve(id, note), onSuccess: invalidate }),
    decline: useMutation({ mutationFn: (note?: string) => opportunitiesApi.decline(id, note), onSuccess: invalidate }),
  };
}
