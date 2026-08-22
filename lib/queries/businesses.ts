import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { businessesApi } from "@/lib/api/businesses";
import type { BusinessMeta } from "@/lib/api/types";

export const businessKeys = {
  all: ["businesses"] as const,
  detail: (id: string) => [...businessKeys.all, "detail", id] as const,
  list: (params?: unknown) => [...businessKeys.all, "list", params] as const,
};

export function useBusiness(id: string | undefined) {
  return useQuery({
    queryKey: businessKeys.detail(id ?? ""),
    queryFn: () => businessesApi.get(id!),
    enabled: Boolean(id),
  });
}

export function useBusinessesFeed(params?: Parameters<typeof businessesApi.list>[0]) {
  return useInfiniteQuery({
    queryKey: businessKeys.list(params),
    queryFn: ({ pageParam }) =>
      businessesApi.list({ ...params, pageToken: pageParam as string | undefined }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => (lastPage.hasNextPage ? lastPage.nextPageToken ?? undefined : undefined),
  });
}

export function useRegisterBusiness() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ meta, idScan }: { meta: BusinessMeta; idScan: File }) =>
      businessesApi.register(meta, idScan),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: businessKeys.all }),
  });
}

export function useBusinessLifecycle(id: string) {
  const queryClient = useQueryClient();
  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: businessKeys.detail(id) });
    queryClient.invalidateQueries({ queryKey: businessKeys.all });
  };
  return {
    markInReview: useMutation({ mutationFn: () => businessesApi.markInReview(id), onSuccess: invalidate }),
    requestPayment: useMutation({ mutationFn: () => businessesApi.requestPayment(id), onSuccess: invalidate }),
    confirmPayment: useMutation({ mutationFn: () => businessesApi.confirmPayment(id), onSuccess: invalidate }),
    approve: useMutation({ mutationFn: () => businessesApi.approve(id), onSuccess: invalidate }),
    reject: useMutation({ mutationFn: (reason?: string) => businessesApi.reject(id, reason), onSuccess: invalidate }),
  };
}
