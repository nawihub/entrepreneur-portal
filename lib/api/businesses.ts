import { api } from "@/lib/api/http";
import type { Business, BusinessMeta, Page, PageParams } from "@/lib/api/types";

const BASE = "/api/v1/businesses";

export const businessesApi = {
  get: (id: string) => api.get<Business>(`${BASE}/${id}`),

  getByTrackingId: (trackingId: string) =>
    api.get<Business>(`${BASE}/by-tracking-id/${trackingId}`),

  // /mine (not the bare list endpoint) - the businesses shown in-app are the
  // signed-in user's own registrations, not a public directory; the gateway
  // scopes ownership server-side off the bearer token, not a client-supplied
  // ownerId.
  list: (params?: PageParams & { status?: string }) =>
    api.get<Page<Business>>(`${BASE}/mine`, { query: params }),

  register: (meta: BusinessMeta, idScan: File) => {
    const form = new FormData();
    form.append(
      "businessMeta",
      new Blob([JSON.stringify(meta)], { type: "application/json" }),
    );
    form.append("idScan", idScan);
    return api.upload<Business>(BASE, form);
  },

  // mark-in-review/request-payment/confirm-payment/approve/reject are
  // deliberately not exposed here - they're admin-only lifecycle RPCs, not
  // something an entrepreneur-facing app should be able to call.
};
