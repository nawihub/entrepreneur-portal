import { keepPreviousData, useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { competitionsApi, type CompetitionApplication, type UpdateApplicationPayload } from "@/lib/api/competitions";
import { ApiError } from "@/lib/api/http";

export const competitionKeys = {
  all: ["competitions"] as const,
  list: (params?: unknown) => [...competitionKeys.all, "list", params] as const,
  detail: (id: string) => [...competitionKeys.all, "detail", id] as const,
  entrants: (id: string) => [...competitionKeys.all, "entrants", id] as const,
  mine: () => [...competitionKeys.all, "mine"] as const,
  myApplicationTo: (competitionId: string) => [...competitionKeys.all, "application", competitionId] as const,
};

export function useCompetitions(params: { state?: string[]; search?: string }) {
  return useInfiniteQuery({
    queryKey: competitionKeys.list(params),
    queryFn: ({ pageParam }) => competitionsApi.list({ ...params, pageSize: 12, pageToken: pageParam as string | undefined }),
    placeholderData: keepPreviousData,
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last) => last.nextPageToken ?? undefined,
  });
}

export function useCompetition(id: string) {
  return useQuery({ queryKey: competitionKeys.detail(id), queryFn: () => competitionsApi.get(id) });
}

export function useEntrants(id: string, enabled: boolean) {
  return useQuery({ queryKey: competitionKeys.entrants(id), queryFn: () => competitionsApi.entrants(id), enabled });
}

export function useMyApplications() {
  return useInfiniteQuery({
    queryKey: competitionKeys.mine(),
    queryFn: ({ pageParam }) => competitionsApi.myApplications({ pageSize: 20, pageToken: pageParam as string | undefined }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last) => last.nextPageToken ?? undefined,
  });
}

/** The caller's application to a competition, or null when they haven't applied. */
export function useMyApplicationTo(competitionId: string, enabled = true) {
  return useQuery({
    queryKey: competitionKeys.myApplicationTo(competitionId),
    queryFn: async () => {
      try {
        return await competitionsApi.myApplicationTo(competitionId);
      } catch (err) {
        if (err instanceof ApiError && err.status === 404) return null;
        throw err;
      }
    },
    enabled,
  });
}

/** Keeps the cached application in step after any change, and refreshes lists. */
function useApplicationMutation<TArgs>(competitionId: string, fn: (args: TArgs) => Promise<CompetitionApplication>) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: (application) => {
      queryClient.setQueryData(competitionKeys.myApplicationTo(competitionId),
        application.state === "WITHDRAWN" ? null : application);
      queryClient.invalidateQueries({ queryKey: competitionKeys.mine() });
      queryClient.invalidateQueries({ queryKey: competitionKeys.detail(competitionId) });
    },
  });
}

export function useStartApplication(competitionId: string) {
  return useApplicationMutation(competitionId, (ideaId: string) => competitionsApi.start(competitionId, ideaId));
}

export function useUpdateApplication(competitionId: string, applicationId: string) {
  return useApplicationMutation(competitionId, (payload: UpdateApplicationPayload) => competitionsApi.update(applicationId, payload));
}

export function useUploadDeck(competitionId: string, applicationId: string) {
  return useApplicationMutation(competitionId, ({ file, onProgress }: { file: File; onProgress?: (f: number) => void }) =>
    competitionsApi.uploadDeck(applicationId, file, onProgress));
}

export function useUploadVideo(competitionId: string, applicationId: string) {
  return useApplicationMutation(competitionId, ({ file, onProgress, signal }: { file: File; onProgress?: (f: number) => void; signal?: AbortSignal }) =>
    competitionsApi.uploadVideo(applicationId, file, onProgress, signal));
}

export function useSetVideoLink(competitionId: string, applicationId: string) {
  return useApplicationMutation(competitionId, (link: string) => competitionsApi.setVideoLink(applicationId, link));
}

export function useSubmitApplication(competitionId: string, applicationId: string) {
  return useApplicationMutation(competitionId, () => competitionsApi.submit(applicationId));
}

export function useWithdrawApplication(competitionId: string, applicationId: string) {
  return useApplicationMutation(competitionId, () => competitionsApi.withdraw(applicationId));
}
