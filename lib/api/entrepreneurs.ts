import { api } from "@/lib/api/http";
import type {
  AwardEntry,
  EducationEntry,
  EntrepreneurProfile,
  FundingInfo,
  JourneyEntry,
  MembershipEntry,
  Page,
  PageParams,
  PublicLinkEntry,
  ReferenceEntry,
  SkillEntry,
  VentureEntry,
} from "@/lib/api/types";

const BASE = "/api/v1/entrepreneurs";

export interface RegisterEntrepreneurPayload {
  firstName: string;
  lastName: string;
  pronoun?: string;
  gender?: string;
  dateOfBirth?: string;
  nationality?: string;
  district?: string;
  chiefdom?: string;
  currentLocation?: string;
}

export interface PersonalInfoPayload
  extends Partial<RegisterEntrepreneurPayload> {
  phone?: string;
  address?: string;
}

export interface StoryPayload {
  aboutMe?: string;
  yearStarted?: number;
  successStory?: string;
}

export const entrepreneursApi = {
  get: (id: string) => api.get<EntrepreneurProfile>(`${BASE}/${id}`),

  getByUserId: (userId: string) =>
    api.get<EntrepreneurProfile>(`${BASE}/by-user/${userId}`),

  list: (params?: PageParams & { query?: string; district?: string }) =>
    api.get<Page<EntrepreneurProfile>>(BASE, { query: params }),

  journeys: (id: string) => api.get<JourneyEntry[]>(`${BASE}/${id}/journeys`),

  ventures: (id: string) => api.get<VentureEntry[]>(`${BASE}/${id}/ventures`),

  register: (payload: RegisterEntrepreneurPayload) =>
    api.post<EntrepreneurProfile>(BASE, payload),

  updatePersonalInfo: (id: string, payload: PersonalInfoPayload) =>
    api.patch<EntrepreneurProfile>(`${BASE}/${id}`, payload),

  updateStory: (id: string, payload: StoryPayload) =>
    api.put<EntrepreneurProfile>(`${BASE}/${id}/story`, payload),

  updateFunding: (id: string, payload: FundingInfo) =>
    api.put<EntrepreneurProfile>(`${BASE}/${id}/funding`, payload),

  updateSkills: (id: string, payload: SkillEntry[]) =>
    api.put<EntrepreneurProfile>(`${BASE}/${id}/skills`, payload),

  updateEducation: (id: string, payload: EducationEntry[]) =>
    api.put<EntrepreneurProfile>(`${BASE}/${id}/education`, payload),

  updateReferences: (id: string, payload: ReferenceEntry[]) =>
    api.put<EntrepreneurProfile>(`${BASE}/${id}/references`, payload),

  updateMemberships: (id: string, payload: MembershipEntry[]) =>
    api.put<EntrepreneurProfile>(`${BASE}/${id}/memberships`, payload),

  updateAwards: (id: string, payload: AwardEntry[]) =>
    api.put<EntrepreneurProfile>(`${BASE}/${id}/awards`, payload),

  updatePublicLinks: (id: string, payload: PublicLinkEntry[]) =>
    api.put<EntrepreneurProfile>(`${BASE}/${id}/public-links`, payload),

  addJourney: (id: string, payload: Omit<JourneyEntry, "id" | "createTime">) =>
    api.post<JourneyEntry>(`${BASE}/${id}/journeys`, payload),

  updateJourney: (
    id: string,
    journeyId: string,
    payload: Omit<JourneyEntry, "id" | "createTime">,
  ) => api.put<JourneyEntry>(`${BASE}/${id}/journeys/${journeyId}`, payload),

  deleteJourney: (id: string, journeyId: string) =>
    api.delete<void>(`${BASE}/${id}/journeys/${journeyId}`),

  addVenture: (id: string, payload: Omit<VentureEntry, "id">) =>
    api.post<VentureEntry>(`${BASE}/${id}/ventures`, payload),

  updateVenture: (
    id: string,
    ventureId: string,
    payload: Omit<VentureEntry, "id">,
  ) => api.put<VentureEntry>(`${BASE}/${id}/ventures/${ventureId}`, payload),
};
