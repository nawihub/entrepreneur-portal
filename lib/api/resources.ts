import { api } from "@/lib/api/http";
import type { Page, PageParams, Resource } from "@/lib/api/types";

const BASE = "/api/v1/resources";

export const resourcesApi = {
  get: (id: string) => api.get<Resource>(`${BASE}/${id}`),

  // The catalog only explicitly documents GET /{id}. A list endpoint is
  // assumed to follow the same pagination envelope as every other domain
  // (GET /api/v1/resources) - verify against /v3/api-docs once the gateway
  // is reachable; if it doesn't exist, the resources page below falls back
  // to an empty state rather than fabricating results.
  list: (params?: PageParams & { category?: string; folder?: string; tag?: string }) =>
    api.get<Page<Resource>>(BASE, { query: params }),
};
