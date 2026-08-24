import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { bigIdeasApi, type CreateBigIdeaPayload } from "@/lib/api/big-ideas";

export const bigIdeaKeys = {
  all: ["big-ideas"] as const,
  detail: (id: string) => [...bigIdeaKeys.all, "detail", id] as const,
  list: (params?: unknown) => [...bigIdeaKeys.all, "list", params] as const,
};

export function useBigIdea(id: string | undefined) {
  return useQuery({
    queryKey: bigIdeaKeys.detail(id ?? ""),
    queryFn: () => bigIdeasApi.get(id!),
    enabled: Boolean(id),
  });
}

export function useBigIdeasFeed(params?: Parameters<typeof bigIdeasApi.list>[0]) {
  return useInfiniteQuery({
    queryKey: bigIdeaKeys.list(params),
    queryFn: ({ pageParam }) =>
      bigIdeasApi.list({ ...params, pageToken: pageParam as string | undefined }),
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

export function useDeleteBigIdea() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => bigIdeasApi.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: bigIdeaKeys.all }),
  });
}

export function useBigIdeaModeration(id: string) {
  const queryClient = useQueryClient();
  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: bigIdeaKeys.detail(id) }).then();
    queryClient.invalidateQueries({ queryKey: bigIdeaKeys.all }).then();
  };
  return {
    review: useMutation({ mutationFn: (note?: string) => bigIdeasApi.review(id, note), onSuccess: invalidate }),
    approve: useMutation({ mutationFn: (note?: string) => bigIdeasApi.approve(id, note), onSuccess: invalidate }),
    decline: useMutation({ mutationFn: (note?: string) => bigIdeasApi.decline(id, note), onSuccess: invalidate }),
  };
}
