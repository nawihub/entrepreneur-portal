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

export const bigIdeasApi = {
  get: (id: string) => api.get<BigIdea>(`${BASE}/${id}`),

  list: (params?: PageParams & { submissionType?: string; stage?: string; status?: string; searchQuery?: string }) =>
    api.get<Page<BigIdea>>(BASE, { query: params }),

  create: (payload: CreateBigIdeaPayload) =>
    api.post<BigIdea>(BASE, payload),

  // materialType is a required query param on the gateway (@RequestParam),
  // not part of the multipart body - see BigIdeaController.attachSupportingMaterial.
  addSupportingMaterial: (id: string, file: File, materialType: MaterialType) => {
    const form = new FormData();
    form.append("file", file);
    return api.upload<BigIdea>(`${BASE}/${id}/supporting-material`, form, { query: { materialType } });
  },

  remove: (id: string) => api.delete<void>(`${BASE}/${id}`),

  // review/approve/decline are deliberately not exposed here - they're
  // admin-only moderation RPCs, not something an entrepreneur-facing app
  // should be able to call.
};
