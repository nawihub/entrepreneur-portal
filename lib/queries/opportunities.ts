import { keepPreviousData, useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { opportunitiesApi, type CreateOpportunityPayload } from "@/lib/api/opportunities";

export const opportunityKeys = {
  all: ["opportunities"] as const,
  detail: (id: string) => [...opportunityKeys.all, "detail", id] as const,
  list: (params?: unknown) => [...opportunityKeys.all, "list", params] as const,
  analysis: () => [...opportunityKeys.all, "analysis"] as const,
  mine: (params?: unknown) => [...opportunityKeys.all, "mine", params] as const,
  mineDetail: (id: string) => [...opportunityKeys.all, "mine-detail", id] as const,
  mineFlier: (id: string) => [...opportunityKeys.all, "mine-flier", id] as const,
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
    // Keep showing the previous results (dimmed) while a new search/filter loads.
    placeholderData: keepPreviousData,
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

export function useMyOpportunities(params?: Parameters<typeof opportunitiesApi.listMine>[0]) {
  return useInfiniteQuery({
    queryKey: opportunityKeys.mine(params),
    queryFn: ({ pageParam }) => opportunitiesApi.listMine({ ...params, pageToken: pageParam as string | undefined }),
    placeholderData: keepPreviousData,
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => (lastPage.hasNextPage ? lastPage.nextPageToken ?? undefined : undefined),
  });
}

export function useMyOpportunity(id: string | undefined) {
  return useQuery({
    queryKey: opportunityKeys.mineDetail(id ?? ""),
    queryFn: () => opportunitiesApi.getMine(id!),
    enabled: Boolean(id),
  });
}

/** The owner's flier as an image Blob (drafts aren't public, so it can't be a plain <img src>). */
export function useMyOpportunityFlier(id: string | undefined, enabled: boolean) {
  return useQuery({
    queryKey: opportunityKeys.mineFlier(id ?? ""),
    queryFn: () => opportunitiesApi.myFlier(id!),
    enabled: Boolean(id) && enabled,
    staleTime: 5 * 60_000,
  });
}

export function useCreateOpportunity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ payload, flier }: { payload: CreateOpportunityPayload; flier?: File | null }) =>
      opportunitiesApi.createMine(payload, flier),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: opportunityKeys.all }),
  });
}

export function usePublishOpportunity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => opportunitiesApi.publish(id),
    onSuccess: (opportunity) => {
      queryClient.setQueryData(opportunityKeys.mineDetail(opportunity.id), opportunity);
      return queryClient.invalidateQueries({ queryKey: opportunityKeys.all });
    },
  });
}

export function useDeleteOpportunity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => opportunitiesApi.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: opportunityKeys.all }),
  });
}
