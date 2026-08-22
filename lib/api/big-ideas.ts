import { api } from "@/lib/api/http";
import type { BigIdea, Page, PageParams } from "@/lib/api/types";

const BASE = "/api/v1/big-ideas";

export interface CreateBigIdeaPayload {
  title: string;
  summary: string;
  problem?: string;
  solution?: string;
  category?: string;
}

export const bigIdeasApi = {
  get: (id: string) => api.get<BigIdea>(`${BASE}/${id}`),

  list: (params?: PageParams & { status?: string; category?: string }) =>
    api.get<Page<BigIdea>>(BASE, { query: params }),

  create: (payload: CreateBigIdeaPayload) =>
    api.post<BigIdea>(BASE, payload),

  addSupportingMaterial: (id: string, file: File) => {
    const form = new FormData();
    form.append("file", file);
    return api.upload<BigIdea>(`${BASE}/${id}/supporting-material`, form);
  },

  remove: (id: string) => api.delete<void>(`${BASE}/${id}`),

  // Moderator-only lifecycle actions. The catalog doesn't expose a role on
  // UserInfo, so there's no client-side way to gate these on "am I actually
  // a moderator" yet - see TODO in app/(app)/big-ideas/[id]/page.tsx.
  review: (id: string, note?: string) =>
    api.post<BigIdea>(`${BASE}/${id}/review`, { note }),
  approve: (id: string, note?: string) =>
    api.post<BigIdea>(`${BASE}/${id}/approve`, { note }),
  decline: (id: string, note?: string) =>
    api.post<BigIdea>(`${BASE}/${id}/decline`, { note }),
};
