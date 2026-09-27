import { api } from "@/lib/api/http";
import type { BigIdea, IdeaApplicant, IdeaStage, MaterialType, Page, PageParams } from "@/lib/api/types";

const BASE = "/api/v1/big-ideas";

// Mirrors IdeaDto.CreateIdeaDto on the gateway - fields marked required are
// @NotBlank/@NotNull on the backend and will 400 without them.
export interface CreateBigIdeaPayload {
  applicant: IdeaApplicant;
  ideaName: string;
  oneLineDescription: string;
  description: string;
  problemStatement: string;
  problemAudience?: string;
  currentSolution?: string;
  proposedSolution: string;
  innovationDescription?: string;
  inspiration?: string;
  targetCustomers: string;
  customerLocation?: string;
  marketSize?: string;
  competitors?: string;
  competitiveAdvantage?: string;
  revenueModel: string;
  productOrService?: string;
  pricingStrategy?: string;
  mainCosts?: string;
  startupCapitalNeeded?: string;
  firstYearRevenueEstimate?: string;
  potentialPartners?: string;
  stage: IdeaStage;
  testedWithCustomers: boolean;
  testingLearnings?: string;
  existingResources?: string;
  challengesAndRisks?: string;
  riskMitigationPlan?: string;
  socialImpact?: string;
  environmentalImpact?: string;
  estimatedJobsCreated?: string;
  growthPlan?: string;
  whySelected?: string;
}

export interface BigIdeaFilters {
  searchQuery?: string;
  stage?: string;
  submissionType?: string;
}

export const bigIdeasApi = {
  get: (id: string) => api.get<BigIdea>(`${BASE}/${id}`),

  /** Public browsing - the gateway only ever returns approved ideas. */
  list: (params?: PageParams & BigIdeaFilters) =>
    api.get<Page<BigIdea>>(BASE, { query: params }),

  /** The caller's own ideas in every status, drafts included. */
  listMine: (params?: PageParams & BigIdeaFilters & { status?: string }) =>
    api.get<Page<BigIdea>>(`${BASE}/mine`, { query: params }),

  /** Owner submits their draft for moderation (PENDING -> PUBLISHED). */
  publish: (id: string) => api.post<BigIdea>(`${BASE}/${id}/publish`),

  create: (payload: CreateBigIdeaPayload) =>
    api.post<BigIdea>(BASE, payload),

  // materialType is a required query param on the gateway (@RequestParam),
  // not part of the multipart body - see BigIdeaController.attachSupportingMaterial.
  addSupportingMaterial: (id: string, file: File, materialType: MaterialType) => {
    const form = new FormData();
    form.append("file", file);
    return api.upload<BigIdea>(`${BASE}/${id}/supporting-material`, form, { query: { materialType } });
  },

  /** Owner-only until the idea is approved, so it's fetched with the caller's token. */
  downloadSupportingMaterial: (id: string, materialId: string) =>
    api.blob(`${BASE}/${id}/materials/${materialId}`, { timeoutMs: 120_000 }),

  // Moderation (review/approve/decline) and deletion are admin-only and aren't exposed by the
  // web gateway at all.
};
