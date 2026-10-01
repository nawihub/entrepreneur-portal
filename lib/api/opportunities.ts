import { api } from "@/lib/api/http";
import type { CategoryAnalysisSummary, Opportunity, Page, PageParams } from "@/lib/api/types";

const BASE = "/api/v1/opportunities";

export interface OpportunityFilters {
  searchQuery?: string;
  categories?: string[];
  targetBeneficiaries?: string[];
  geographicScope?: string;
}

/** Mirrors the gateway's CreateOpportunityDto; enum values are the names in lib/data/filter-options. */
export interface CreateOpportunityPayload {
  title: string;
  categories: string[];
  categoryOther?: string;
  description: string;
  organizationName: string;
  organizationTypes: string[];
  organizationTypeOther?: string;
  targetBeneficiaries: string[];
  targetBeneficiaryOther?: string;
  eligibilityCriteria?: string;
  /** yyyy-MM-dd - applications stay open all of that day. */
  deadline: string;
  applicationLink: string;
  contactInfo: { email: string; phone: string; additionalContact?: string };
  geographicScope: string;
  geographicScopeOther?: string;
  /** Who's submitting it (shown to reviewers). */
  submittedBy: string;
}

export const opportunitiesApi = {
  get: (id: string) => api.get<Opportunity>(`${BASE}/${id}`),

  // searchQuery matches title and organization name. The gateway only returns approved opportunities.
  list: (params?: PageParams & OpportunityFilters) =>
    api.get<Page<Opportunity>>(BASE, { query: params }),

  // Backend returns a bare array, not an object wrapper - see CategoryAnalysisSummary.
  analysis: () => api.get<CategoryAnalysisSummary[]>(`${BASE}/analysis`),

  // ─── The signed-in entrepreneur's own opportunities ──────────────────────

  /** Creates it as the caller's draft; publish it to submit it for review. */
  createMine: (payload: CreateOpportunityPayload, flier?: File | null) => {
    const form = new FormData();
    form.append("opportunity", new Blob([JSON.stringify(payload)], { type: "application/json" }));
    if (flier) form.append("flier", flier);
    return api.upload<Opportunity>(`${BASE}/mine`, form);
  },

  /** The caller's own opportunities in every status, drafts included. */
  listMine: (params?: PageParams & { searchQuery?: string; status?: string }) =>
    api.get<Page<Opportunity>>(`${BASE}/mine`, { query: params }),

  getMine: (id: string) => api.get<Opportunity>(`${BASE}/mine/${id}`),

  /** The flier of one of the caller's own opportunities (any status) - fetched with their token. */
  myFlier: (id: string) => api.blob(`${BASE}/mine/${id}/flier`),

  /** Owner submits their draft for review (DRAFT -> PENDING). */
  publish: (id: string) => api.post<Opportunity>(`${BASE}/${id}/publish`),

  /** Only the owner can delete their opportunity. */
  remove: (id: string) => api.delete<void>(`${BASE}/${id}`),

  // review/approve/decline are deliberately not exposed here - they're admin-only moderation.
};
