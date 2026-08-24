import { api } from "@/lib/api/http";
import type {
  CategoryAnalysisSummary,
  Money,
  Opportunity,
  Page,
  PageParams,
} from "@/lib/api/types";

const BASE = "/api/v1/opportunities";

export interface CreateOpportunityPayload {
  title: string;
  organization?: string;
  category?: string;
  description?: string;
  amount?: Money;
  deadline?: string;
  flier: File;
}

export const opportunitiesApi = {
  get: (id: string) => api.get<Opportunity>(`${BASE}/${id}`),

  list: (params?: PageParams & { category?: string; status?: string }) =>
    api.get<Page<Opportunity>>(BASE, { query: params }),

  // Backend returns a bare array, not an object wrapper - see CategoryAnalysisSummary.
  analysis: () => api.get<CategoryAnalysisSummary[]>(`${BASE}/analysis`),

  create: (payload: CreateOpportunityPayload) => {
    const { flier, ...meta } = payload;
    const form = new FormData();
    form.append(
      "opportunityMeta",
      new Blob([JSON.stringify(meta)], { type: "application/json" }),
    );
    form.append("flier", flier);
    return api.upload<Opportunity>(BASE, form);
  },

  remove: (id: string) => api.delete<void>(`${BASE}/${id}`),

  review: (id: string, note?: string) =>
    api.post<Opportunity>(`${BASE}/${id}/review`, { note }),
  approve: (id: string, note?: string) =>
    api.post<Opportunity>(`${BASE}/${id}/approve`, { note }),
  decline: (id: string, note?: string) =>
    api.post<Opportunity>(`${BASE}/${id}/decline`, { note }),
};
