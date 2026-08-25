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
  ReferenceEntry,
  VentureEntry,
} from "@/lib/api/types";

const BASE = "/api/v1/entrepreneurs";

// Mirrors EntrepreneurDto.RegisterEntrepreneurDto on the gateway - fields
// without a `?` are @NotBlank on the backend and will 400 without them.
// In practice this is rarely called directly: entrepreneur-service
// auto-creates a PENDING shell profile via Kafka the instant a user
// registers (email or OAuth), so this only fires as a fallback if that
// hasn't landed yet by the time the user reaches onboarding.
export interface RegisterEntrepreneurPayload {
  userId: string;
  firstName: string;
  lastName: string;
  gender: string;
  dateOfBirth: string; // ISO yyyy-MM-dd
  nationality: string;
  district: string;
  chiefdom?: string;
  currentLocation: string;
  email: string;
  phoneNumber: string;
  whatsappNumber?: string;
  skills?: string[];
  photoUrl?: string;
}

// Mirrors EntrepreneurDto.UpdatePersonalInfoDto - all fields optional on
// the backend (partial update).
export interface PersonalInfoPayload {
  firstName?: string;
  lastName?: string;
  gender?: string;
  dateOfBirth?: string;
  nationality?: string;
  district?: string;
  chiefdom?: string;
  currentLocation?: string;
  phoneNumber?: string;
  whatsappNumber?: string;
  skills?: string[];
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

  // Identity comes from the caller's own bearer token server-side - no
  // userId needed. Preferred over getByUserId for "my own profile".
  getMe: () => api.get<EntrepreneurProfile>(`${BASE}/me`),

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

  // Backend wants { skills: string[] }, not a bare array - see
  // EntrepreneurDto.UpdateSkillsDto.
  updateSkills: (id: string, skills: string[]) =>
    api.put<EntrepreneurProfile>(`${BASE}/${id}/skills`, { skills }),

  // LinkedIn-style "finish onboarding" step: PENDING -> ACTIVE. No request
  // body - see EntrepreneurController.activate.
  activate: (id: string) => api.post<EntrepreneurProfile>(`${BASE}/${id}/activate`),

  // Each of these wants its list wrapped in a named field - see
  // EntrepreneurDto.Update{Education,References,Memberships,Awards,
  // PublicLinks}Dto - not a bare array.
  updateEducation: (id: string, records: EducationEntry[]) =>
    api.put<EntrepreneurProfile>(`${BASE}/${id}/education`, { records }),

  updateReferences: (id: string, references: ReferenceEntry[]) =>
    api.put<EntrepreneurProfile>(`${BASE}/${id}/references`, { references }),

  updateMemberships: (id: string, memberships: MembershipEntry[]) =>
    api.put<EntrepreneurProfile>(`${BASE}/${id}/memberships`, { memberships }),

  updateAwards: (id: string, awards: AwardEntry[]) =>
    api.put<EntrepreneurProfile>(`${BASE}/${id}/awards`, { awards }),

  updatePublicLinks: (id: string, publicLinks: string[]) =>
    api.put<EntrepreneurProfile>(`${BASE}/${id}/public-links`, { publicLinks }),

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
