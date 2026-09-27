import { api } from "@/lib/api/http";
import type { Page, PageParams, RatingSummary, Resource, ResourceFormat, ResourceType } from "@/lib/api/types";

const BASE = "/api/v1/resources";

export interface ResourceFilters {
  query?: string;
  format?: ResourceFormat;
  type?: ResourceType;
  tags?: string[];
}

export const resourcesApi = {
  /** Approved, non-private resources - everything an entrepreneur can see. */
  listApproved: (params?: PageParams & ResourceFilters) =>
    api.get<Page<Resource>>(`${BASE}/approved`, { query: params }),

  get: (id: string) => api.get<Resource>(`${BASE}/${id}`),

  /** The caller's bookmarked resources, most recently bookmarked first. */
  listBookmarks: (params?: PageParams) =>
    api.get<Page<Resource>>(`${BASE}/bookmarks`, { query: params }),

  bookmark: (id: string) => api.put<void>(`${BASE}/${id}/bookmark`),
  removeBookmark: (id: string) => api.delete<void>(`${BASE}/${id}/bookmark`),

  /** Creates or replaces the caller's 1-5 rating. */
  rate: (id: string, rating: number) => api.put<RatingSummary>(`${BASE}/${id}/rating`, { rating }),
  removeRating: (id: string) => api.delete<RatingSummary>(`${BASE}/${id}/rating`),

  /** The file itself - streamed by the gateway, which needs the bearer token, so it is
   * fetched as a blob rather than linked to directly. */
  downloadFile: (id: string) => api.blob(`${BASE}/${id}/download`, { timeoutMs: 120_000 }),
};
