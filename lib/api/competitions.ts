import { api, uploadWithProgress } from "@/lib/api/http";

const BASE = "/api/v1/competitions";

export type CompetitionState = "PUBLISHED" | "SHORTLISTING" | "PITCH_VIDEO" | "FINALS" | "COMPLETED" | "CANCELLED";
export type ApplicationState =
  | "DRAFT" | "SUBMITTED" | "SHORTLISTED" | "NOT_SHORTLISTED" | "FINALIST" | "NOT_ADVANCED" | "WINNER" | "WITHDRAWN";
export type QuestionType = "SHORT_TEXT" | "LONG_TEXT" | "SINGLE_CHOICE" | "MULTIPLE_CHOICE" | "YES_NO";

export interface CompetitionQuestion {
  id: string; prompt: string; helpText: string | null; type: QuestionType; options: string[]; required: boolean;
}

export interface Competition {
  id: string;
  title: string;
  tagline: string | null;
  description: string;
  eligibilityRequirements: string;
  eligibleIdeaStages: string[];
  applicationOpensAt: string;
  applicationClosesAt: string;
  pitchVideoDeadline: string;
  totalFinalists: number;
  evaluationCriteria: { id: string; name: string; description: string | null; weight: number }[];
  questions: CompetitionQuestion[];
  finalPitch: { format: "PHYSICAL" | "VIRTUAL" | null; venue: string | null; scheduledAt: string | null } | null;
  prizes: { rank: number; title: string; description: string | null }[];
  state: CompetitionState;
  cancelReason: string | null;
  stats: { submitted: number; shortlisted: number; pitchVideos: number; finalists: number; winners: number };
}

export interface StoredFile { id: string; fileName: string; contentType: string | null; size: number; uploadedAt: string | null }
export interface IdeaSnapshot {
  ideaName: string; oneLineDescription: string | null; stage: string | null; applicantName: string | null; applicantLocation: string | null;
}
export interface Answer { questionId: string; text: string | null; choices: string[] }

export interface CompetitionApplication {
  id: string;
  competitionId: string;
  ideaId: string;
  idea: IdeaSnapshot;
  potentialStatement: string | null;
  expectedImpact: string | null;
  supportNeeded: string | null;
  answers: Answer[];
  pitchDeck: StoredFile | null;
  pitchVideo: { link: string | null; file: StoredFile | null; submittedAt: string | null; filePurged: boolean } | null;
  state: ApplicationState;
  stateTime: string | null;
  /** The judges' note - only once a rejection has been announced. */
  feedback: string | null;
  winnerRank: number | null;
  submitTime: string | null;
  createTime: string;
  updateTime: string;
}

export interface Entrant { applicationId: string; ideaId: string; idea: IdeaSnapshot; state: ApplicationState; winnerRank: number | null }
export interface Entrants { shortlisted: Entrant[]; finalists: Entrant[]; winners: Entrant[] }
export interface TokenPage<T> { items: T[]; nextPageToken: string | null; totalCount: number }

export interface UpdateApplicationPayload {
  ideaId?: string;
  potentialStatement?: string;
  expectedImpact?: string;
  supportNeeded?: string;
  answers: { questionId: string; text?: string; choices?: string[] }[];
}

function fileForm(file: File) {
  const form = new FormData();
  form.append("file", file);
  return form;
}

export const competitionsApi = {
  list: (params: { state?: string[]; search?: string; pageSize?: number; pageToken?: string }) =>
    api.get<TokenPage<Competition>>(BASE, { query: params, auth: false }),
  get: (id: string) => api.get<Competition>(`${BASE}/${id}`, { auth: false }),
  entrants: (id: string) => api.get<Entrants>(`${BASE}/${id}/entrants`, { auth: false }),

  myApplications: (params: { pageSize?: number; pageToken?: string }) =>
    api.get<TokenPage<CompetitionApplication>>(`${BASE}/applications/mine`, { query: params }),
  /** The caller's application to this competition - 404 when they haven't applied. */
  myApplicationTo: (competitionId: string) => api.get<CompetitionApplication>(`${BASE}/${competitionId}/application`),
  start: (competitionId: string, ideaId: string) =>
    api.post<CompetitionApplication>(`${BASE}/${competitionId}/applications`, { ideaId }),
  update: (applicationId: string, payload: UpdateApplicationPayload) =>
    api.put<CompetitionApplication>(`${BASE}/applications/${applicationId}`, payload),
  uploadDeck: (applicationId: string, file: File, onProgress?: (f: number) => void) =>
    uploadWithProgress<CompetitionApplication>(`${BASE}/applications/${applicationId}/pitch-deck`, fileForm(file), { query: { size: file.size }, onProgress }),
  uploadVideo: (applicationId: string, file: File, onProgress?: (f: number) => void, signal?: AbortSignal) =>
    uploadWithProgress<CompetitionApplication>(`${BASE}/applications/${applicationId}/pitch-video`, fileForm(file), { query: { size: file.size }, onProgress, signal }),
  setVideoLink: (applicationId: string, link: string) =>
    api.put<CompetitionApplication>(`${BASE}/applications/${applicationId}/pitch-video-link`, { link }),
  submit: (applicationId: string) => api.post<CompetitionApplication>(`${BASE}/applications/${applicationId}/submit`),
  withdraw: (applicationId: string) => api.post<CompetitionApplication>(`${BASE}/applications/${applicationId}/withdraw`),
  file: (applicationId: string, fileId: string) =>
    api.blob(`${BASE}/applications/${applicationId}/files/${fileId}?inline=true`, { timeoutMs: 300_000 }),
};
