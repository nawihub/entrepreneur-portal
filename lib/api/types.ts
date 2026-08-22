/**
 * Shared response/request shapes for the web-api-gateway REST API.
 *
 * These are hand-written from the endpoint/shape summary in
 * frontend-build-prompt.md (hand-verified against the gateway's controller
 * source on the day this was written), NOT generated from a live OpenAPI
 * spec - the gateway wasn't reachable at http://localhost:8080 while this
 * project was scaffolded. Re-generate/diff these against
 * {NEXT_PUBLIC_API_BASE_URL}/v3/api-docs once the gateway is running; treat
 * that spec as ground truth over this file if they've drifted.
 */

// ---------------------------------------------------------------------------
// Shared primitives
// ---------------------------------------------------------------------------

export type CurrencyCode = "SLE" | (string & {});

export interface Money {
  currency: CurrencyCode;
  amount: string; // decimal string, e.g. "1500.00"
}

/** Cursor-based pagination envelope used by every list endpoint. */
export interface Page<T> {
  items: T[];
  pageSize: number;
  returnedCount: number;
  totalCount: number;
  hasNextPage: boolean;
  nextPageToken: string | null;
  hasPreviousPage: boolean;
  previousPageToken: string | null;
}

export interface PageParams {
  pageSize?: number;
  pageToken?: string;
  [key: string]: string | number | undefined;
}

/** Generic shape for gateway error bodies (Spring `ProblemDetail`-style). */
export interface ApiErrorBody {
  status?: number;
  title?: string;
  message?: string;
  detail?: string;
  errors?: Record<string, string>;
}

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------

export type UserStatus =
  | "PENDING_VERIFICATION"
  | "ACTIVE"
  | "SUSPENDED"
  | "DEACTIVATED";

export interface UserInfo {
  id: string;
  firstName: string;
  lastName: string;
  displayName: string;
  phone: string | null;
  email: string;
  status: UserStatus;
  statusReason: string | null;
  profilePhotoUrl: string | null;
  createTime: string;
  updateTime: string;
}

export interface AuthSession {
  accessToken: string;
  refreshToken: string;
  user: UserInfo;
}

/** What the client actually receives from our own BFF routes - the refresh
 * token is stripped server-side and stored as an httpOnly cookie instead. */
export interface ClientSession {
  accessToken: string;
  user: UserInfo;
}

export interface RegisterPayload {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  displayName?: string;
  phone?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export type OAuthProvider = "GOOGLE" | "GITHUB";

export interface OAuthPayload {
  provider: OAuthProvider;
  authorizationCode: string;
  redirectUri: string;
}

// ---------------------------------------------------------------------------
// Entrepreneurs
// ---------------------------------------------------------------------------

export type EntrepreneurStatus = "ACTIVE" | "SUSPENDED" | "INACTIVE";

export interface SocialLinks {
  github?: string | null;
  linkedin?: string | null;
  facebook?: string | null;
  x?: string | null;
  website?: string | null;
}

export interface EntrepreneurIdentity {
  firstName: string;
  lastName: string;
  pronoun?: string | null;
  profilePhotoUrl?: string | null;
  gender?: string | null;
  dateOfBirth?: string | null;
  nationality?: string | null;
  district?: string | null;
  chiefdom?: string | null;
  currentLocation?: string | null;
}

export interface ContactInfo {
  email?: string | null;
  phone?: string | null;
  address?: string | null;
}

export interface StoryImpactStats {
  jobsCreated?: number;
  revenueGenerated?: Money;
  peopleImpacted?: number;
  [key: string]: unknown;
}

export interface EntrepreneurStory {
  aboutMe?: string | null;
  yearStarted?: number | null;
  impact?: StoryImpactStats | null;
  successStory?: string | null;
}

export interface SkillEntry {
  id?: string;
  name: string;
  level?: string | null;
}

export interface EducationEntry {
  id?: string;
  institution: string;
  credential?: string | null;
  fieldOfStudy?: string | null;
  startYear?: number | null;
  endYear?: number | null;
}

export interface ReferenceEntry {
  id?: string;
  name: string;
  relationship?: string | null;
  contact?: string | null;
}

export interface MembershipEntry {
  id?: string;
  organization: string;
  role?: string | null;
  startYear?: number | null;
  endYear?: number | null;
}

export interface AwardEntry {
  id?: string;
  title: string;
  issuer?: string | null;
  year?: number | null;
  description?: string | null;
}

export interface PublicLinkEntry {
  id?: string;
  label: string;
  url: string;
}

export interface FundingInfo {
  received?: Money | null;
  needAmount?: Money | null;
  needNote?: string | null;
  supportNeeded?: string[] | null;
}

export interface SectionVisibility {
  story?: boolean;
  skills?: boolean;
  education?: boolean;
  references?: boolean;
  memberships?: boolean;
  awards?: boolean;
  funding?: boolean;
  publicLinks?: boolean;
  [key: string]: boolean | undefined;
}

export interface EntrepreneurProfile {
  id: string;
  userId: string;
  identity: EntrepreneurIdentity;
  contactInfo?: ContactInfo | null;
  socialLinks?: SocialLinks | null;
  status: EntrepreneurStatus;
  suspensionReason?: string | null;
  story?: EntrepreneurStory | null;
  skills: SkillEntry[];
  education: EducationEntry[];
  references: ReferenceEntry[];
  memberships: MembershipEntry[];
  awards: AwardEntry[];
  publicLinks: PublicLinkEntry[];
  profileScore: number;
  funding?: FundingInfo | null;
  visibility?: SectionVisibility | null;
  vetted: boolean;
  featured: boolean;
  hasReceivedFunding: boolean;
  needFunding: boolean;
  createTime: string;
  updateTime: string;
}

export interface JourneyEntry {
  id: string;
  title: string;
  description?: string | null;
  date: string;
  createTime: string;
}

export interface VentureEntry {
  id: string;
  name: string;
  role?: string | null;
  description?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  active: boolean;
}

// ---------------------------------------------------------------------------
// Big Ideas
// ---------------------------------------------------------------------------

export type BigIdeaStatus =
  | "SUBMITTED"
  | "IN_REVIEW"
  | "APPROVED"
  | "DECLINED";

export interface BigIdea {
  id: string;
  entrepreneurId: string;
  title: string;
  summary: string;
  problem?: string | null;
  solution?: string | null;
  category?: string | null;
  status: BigIdeaStatus;
  reviewNote?: string | null;
  supportingMaterialUrls?: string[];
  createTime: string;
  updateTime: string;
}

// ---------------------------------------------------------------------------
// Businesses
// ---------------------------------------------------------------------------

export type BusinessStatus =
  | "PENDING"
  | "IN_REVIEW"
  | "AWAITING_PAYMENT"
  | "APPROVED"
  | "REJECTED";

export interface Business {
  id: string;
  trackingId: string;
  ownerId: string;
  name: string;
  sector?: string | null;
  description?: string | null;
  district?: string | null;
  status: BusinessStatus;
  rejectionReason?: string | null;
  createTime: string;
  updateTime: string;
}

export interface BusinessMeta {
  name: string;
  sector?: string;
  description?: string;
  district?: string;
  chiefdom?: string;
  contactPhone?: string;
  contactEmail?: string;
}

// ---------------------------------------------------------------------------
// Opportunities
// ---------------------------------------------------------------------------

export type OpportunityStatus =
  | "SUBMITTED"
  | "IN_REVIEW"
  | "APPROVED"
  | "DECLINED";

export interface Opportunity {
  id: string;
  title: string;
  organization?: string | null;
  category?: string | null;
  description?: string | null;
  amount?: Money | null;
  deadline?: string | null;
  flierUrl?: string | null;
  status: OpportunityStatus;
  createTime: string;
  updateTime: string;
}

export interface OpportunityAnalysis {
  totalOpportunities: number;
  byCategory: Array<{ category: string; count: number }>;
}

// ---------------------------------------------------------------------------
// Resources
// ---------------------------------------------------------------------------

export interface ResourceAttachment {
  bucketName: string;
  objectName: string;
  fileName: string;
  contentType?: string | null;
  sizeBytes?: number | null;
}

export interface Resource {
  id: string;
  title: string;
  description?: string | null;
  category?: string | null;
  tags: string[];
  folder?: string | null;
  attachments: ResourceAttachment[];
  createTime: string;
  updateTime: string;
}

// ---------------------------------------------------------------------------
// Payments
// ---------------------------------------------------------------------------

export interface CheckoutSessionRequest {
  purpose: string;
  referenceId: string;
  amount: Money;
  successUrl: string;
  cancelUrl: string;
}

export interface CheckoutSessionResponse {
  sessionId: string;
  checkoutUrl: string;
}
