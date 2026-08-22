import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { entrepreneursApi, type PersonalInfoPayload, type RegisterEntrepreneurPayload, type StoryPayload } from "@/lib/api/entrepreneurs";
import { useAuthStore } from "@/lib/store/auth-store";
import type {
  AwardEntry,
  EducationEntry,
  FundingInfo,
  MembershipEntry,
  PublicLinkEntry,
  ReferenceEntry,
  SkillEntry,
} from "@/lib/api/types";

export const entrepreneurKeys = {
  all: ["entrepreneurs"] as const,
  detail: (id: string) => [...entrepreneurKeys.all, "detail", id] as const,
  byUser: (userId: string) => [...entrepreneurKeys.all, "by-user", userId] as const,
  list: (params?: unknown) => [...entrepreneurKeys.all, "list", params] as const,
  journeys: (id: string) => [...entrepreneurKeys.all, id, "journeys"] as const,
  ventures: (id: string) => [...entrepreneurKeys.all, id, "ventures"] as const,
};

/** The logged-in user's own entrepreneur profile - loaded right after login
 * per the brief (GET /by-user/{userId}), and reused everywhere the app
 * shell needs "my" profile (left rail summary, profile edit forms). */
export function useOwnEntrepreneurProfile() {
  const userId = useAuthStore((s) => s.user?.id);
  return useQuery({
    queryKey: userId ? entrepreneurKeys.byUser(userId) : entrepreneurKeys.byUser("anonymous"),
    queryFn: () => entrepreneursApi.getByUserId(userId!),
    enabled: Boolean(userId),
    retry: false,
  });
}

export function useEntrepreneurProfile(id: string | undefined) {
  return useQuery({
    queryKey: entrepreneurKeys.detail(id ?? ""),
    queryFn: () => entrepreneursApi.get(id!),
    enabled: Boolean(id),
  });
}

export function useEntrepreneursList(params?: Parameters<typeof entrepreneursApi.list>[0]) {
  return useQuery({
    queryKey: entrepreneurKeys.list(params),
    queryFn: () => entrepreneursApi.list(params),
    placeholderData: (prev) => prev,
  });
}

export function useEntrepreneurJourneys(id: string | undefined) {
  return useQuery({
    queryKey: entrepreneurKeys.journeys(id ?? ""),
    queryFn: () => entrepreneursApi.journeys(id!),
    enabled: Boolean(id),
  });
}

export function useEntrepreneurVentures(id: string | undefined) {
  return useQuery({
    queryKey: entrepreneurKeys.ventures(id ?? ""),
    queryFn: () => entrepreneursApi.ventures(id!),
    enabled: Boolean(id),
  });
}

function useInvalidateEntrepreneur(id: string) {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: entrepreneurKeys.detail(id) });
    queryClient.invalidateQueries({ queryKey: entrepreneurKeys.all });
  };
}

export function useRegisterEntrepreneur() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: RegisterEntrepreneurPayload) => entrepreneursApi.register(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: entrepreneurKeys.all }),
  });
}

export function useUpdatePersonalInfo(id: string) {
  const invalidate = useInvalidateEntrepreneur(id);
  return useMutation({
    mutationFn: (payload: PersonalInfoPayload) => entrepreneursApi.updatePersonalInfo(id, payload),
    onSuccess: invalidate,
  });
}

export function useUpdateStory(id: string) {
  const invalidate = useInvalidateEntrepreneur(id);
  return useMutation({
    mutationFn: (payload: StoryPayload) => entrepreneursApi.updateStory(id, payload),
    onSuccess: invalidate,
  });
}

export function useUpdateFunding(id: string) {
  const invalidate = useInvalidateEntrepreneur(id);
  return useMutation({
    mutationFn: (payload: FundingInfo) => entrepreneursApi.updateFunding(id, payload),
    onSuccess: invalidate,
  });
}

export function useUpdateSkills(id: string) {
  const invalidate = useInvalidateEntrepreneur(id);
  return useMutation({
    mutationFn: (payload: SkillEntry[]) => entrepreneursApi.updateSkills(id, payload),
    onSuccess: invalidate,
  });
}

export function useUpdateEducation(id: string) {
  const invalidate = useInvalidateEntrepreneur(id);
  return useMutation({
    mutationFn: (payload: EducationEntry[]) => entrepreneursApi.updateEducation(id, payload),
    onSuccess: invalidate,
  });
}

export function useUpdateReferences(id: string) {
  const invalidate = useInvalidateEntrepreneur(id);
  return useMutation({
    mutationFn: (payload: ReferenceEntry[]) => entrepreneursApi.updateReferences(id, payload),
    onSuccess: invalidate,
  });
}

export function useUpdateMemberships(id: string) {
  const invalidate = useInvalidateEntrepreneur(id);
  return useMutation({
    mutationFn: (payload: MembershipEntry[]) => entrepreneursApi.updateMemberships(id, payload),
    onSuccess: invalidate,
  });
}

export function useUpdateAwards(id: string) {
  const invalidate = useInvalidateEntrepreneur(id);
  return useMutation({
    mutationFn: (payload: AwardEntry[]) => entrepreneursApi.updateAwards(id, payload),
    onSuccess: invalidate,
  });
}

export function useUpdatePublicLinks(id: string) {
  const invalidate = useInvalidateEntrepreneur(id);
  return useMutation({
    mutationFn: (payload: PublicLinkEntry[]) => entrepreneursApi.updatePublicLinks(id, payload),
    onSuccess: invalidate,
  });
}

export function useJourneyMutations(id: string) {
  const queryClient = useQueryClient();
  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: entrepreneurKeys.journeys(id) });

  const add = useMutation({
    mutationFn: (payload: Parameters<typeof entrepreneursApi.addJourney>[1]) =>
      entrepreneursApi.addJourney(id, payload),
    onSuccess: invalidate,
  });
  const remove = useMutation({
    mutationFn: (journeyId: string) => entrepreneursApi.deleteJourney(id, journeyId),
    onSuccess: invalidate,
  });
  return { add, remove };
}

export function useVentureMutations(id: string) {
  const queryClient = useQueryClient();
  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: entrepreneurKeys.ventures(id) });

  const add = useMutation({
    mutationFn: (payload: Parameters<typeof entrepreneursApi.addVenture>[1]) =>
      entrepreneursApi.addVenture(id, payload),
    onSuccess: invalidate,
  });
  return { add };
}
