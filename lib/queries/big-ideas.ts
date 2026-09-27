import { keepPreviousData, useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { bigIdeasApi, type CreateBigIdeaPayload } from "@/lib/api/big-ideas";

export const bigIdeaKeys = {
  all: ["big-ideas"] as const,
  detail: (id: string) => [...bigIdeaKeys.all, "detail", id] as const,
  list: (params?: unknown) => [...bigIdeaKeys.all, "list", params] as const,
  mine: (params?: unknown) => [...bigIdeaKeys.all, "mine", params] as const,
};

export function useBigIdea(id: string | undefined) {
  return useQuery({
    queryKey: bigIdeaKeys.detail(id ?? ""),
    queryFn: () => bigIdeasApi.get(id!),
    enabled: Boolean(id),
  });
}

/** Approved ideas from across the network. */
export function useBigIdeasFeed(params?: Parameters<typeof bigIdeasApi.list>[0]) {
  return useInfiniteQuery({
    queryKey: bigIdeaKeys.list(params),
    queryFn: ({ pageParam }) =>
      bigIdeasApi.list({ ...params, pageToken: pageParam as string | undefined }),
    // Keep showing the previous results (dimmed) while a new search/filter loads.
    placeholderData: keepPreviousData,
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => (lastPage.hasNextPage ? lastPage.nextPageToken ?? undefined : undefined),
  });
}

/** The signed-in user's own ideas, drafts included. */
export function useMyBigIdeas(params?: Parameters<typeof bigIdeasApi.listMine>[0]) {
  return useInfiniteQuery({
    queryKey: bigIdeaKeys.mine(params),
    queryFn: ({ pageParam }) =>
      bigIdeasApi.listMine({ ...params, pageToken: pageParam as string | undefined }),
    placeholderData: keepPreviousData,
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => (lastPage.hasNextPage ? lastPage.nextPageToken ?? undefined : undefined),
  });
}

export function useCreateBigIdea() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateBigIdeaPayload) => bigIdeasApi.create(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: bigIdeaKeys.all }),
  });
}

export function usePublishBigIdea() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => bigIdeasApi.publish(id),
    onSuccess: (idea) => {
      queryClient.setQueryData(bigIdeaKeys.detail(idea.id), idea);
      return queryClient.invalidateQueries({ queryKey: bigIdeaKeys.all });
    },
  });
}
