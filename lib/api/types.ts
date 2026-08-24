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

// Adds PENDING, missing from the original hand-typed version - this is the
// status every entrepreneur starts in (see entrepreneur-service's
// AuthEventHandlerService, which auto-creates a PENDING shell profile via
// Kafka the instant any user registers, email or OAuth) until they finish
// onboarding and call POST /{id}/activate.
export type EntrepreneurStatus = "PENDING" | "ACTIVE" | "SUSPENDED" | "INACTIVE";

// NOTE: socialLinks/story/education/references/memberships/awards/
// funding/visibility/publicLinks below are NOT yet verified against the
// real gateway response (EntrepreneurModel.EntrepreneurProfile) - only
// the top-level identity/contact/status/skills fields have been fixed so
// far (needed to unblock onboarding + the nav rails). Treat those nested
// shapes as still-unverified same as everywhere else in this file.
export interface SocialLinks {
  github?: string | null;
  linkedin?: string | null;
  facebook?: string | null;
  x?: string | null;
  website?: string | null;
}

export interface ContactInfo {
  email?: string | null;
  phoneNumber?: string | null;
  whatsappNumber?: string | null;
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
  contactInfo?: ContactInfo | null;
  socialLinks?: SocialLinks | null;
  status: EntrepreneurStatus;
  suspensionReason?: string | null;
  story?: EntrepreneurStory | null;
  skills: string[];
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

// Idea.Gender (big-idea-service's own enum, distinct from the shared
// commonapis Gender used elsewhere - different value set).
export type IdeaGender = "MALE" | "FEMALE" | "OTHER" | "PREFER_NOT_TO_SAY";

export type IdeaSubmissionType =
  | "INDIVIDUAL"
  | "TEAM"
  | "EXISTING_BUSINESS"
  | "ORGANISATION";

export type IdeaStage =
  | "CONCEPT_ONLY"
  | "RESEARCH_COMPLETED"
  | "PROTOTYPE_DEVELOPED"
  | "TESTING_PILOT"
  | "ALREADY_OPERATING";

export type MaterialType =
  | "PROTOTYPE_PHOTO"
  | "VIDEO"
  | "BUSINESS_PLAN"
  | "PITCH_DECK"
  | "OTHER";

export type BigIdeaStatus = "PENDING" | "IN_REVIEW" | "APPROVED" | "DECLINED";

export interface IdeaApplicant {
  fullName: string;
  gender: IdeaGender;
  age: number;
  phone: string;
  email: string;
  location: string;
  occupation: string;
  submissionType: IdeaSubmissionType;
}

// Response shape only omits the applicant's phone/email (see IdeaModel.ApplicantSummary
// on the gateway) - everything else on CreateIdeaPayload is echoed back verbatim.
export type IdeaApplicantSummary = Omit<IdeaApplicant, "phone" | "email">;

export interface SupportingMaterial {
  type: MaterialType;
  url: string;
  uploadedAt: string;
}

export interface BigIdea {
  id: string;
  applicant: IdeaApplicantSummary;
  ideaName: string;
  oneLineDescription: string;
  description: string;
  problemStatement: string;
  problemAudience?: string | null;
  currentSolution?: string | null;
  proposedSolution: string;
  innovationDescription?: string | null;
  inspiration?: string | null;
  targetCustomers: string;
  customerLocation?: string | null;
  marketSize?: string | null;
  competitors?: string | null;
  competitiveAdvantage?: string | null;
  revenueModel: string;
  productOrService?: string | null;
  pricingStrategy?: string | null;
  mainCosts?: string | null;
  startupCapitalNeeded?: string | null;
  firstYearRevenueEstimate?: string | null;
  potentialPartners?: string | null;
  stage: IdeaStage;
  testedWithCustomers: boolean;
  testingLearnings?: string | null;
  existingResources?: string | null;
  challengesAndRisks?: string | null;
  riskMitigationPlan?: string | null;
  socialImpact?: string | null;
  environmentalImpact?: string | null;
  estimatedJobsCreated?: string | null;
  growthPlan?: string | null;
  whySelected?: string | null;
  supportingMaterials: SupportingMaterial[];
  status: BigIdeaStatus;
  declineReason?: string | null;
  createTime: string;
  updateTime: string;
}

// ---------------------------------------------------------------------------
// Businesses
// ---------------------------------------------------------------------------

// nawehub.commonapis.type.v1.Gender - shared across Business/Entrepreneur,
// NOT the same value set as IdeaGender above.
export type CommonGender = "MALE" | "FEMALE" | "PREFER_NOT_SAY";

export type BusinessCategory =
  | "AGRICULTURE"
  | "TECHNOLOGY"
  | "FASHION_TEXTILES"
  | "FOOD_BEVERAGE"
  | "HEALTHCARE"
  | "EDUCATION"
  | "CONSTRUCTION"
  | "TRANSPORTATION"
  | "RETAIL"
  | "MANUFACTURING"
  | "SERVICES"
  | "TOURISM"
  | "MINING"
  | "ENERGY"
  | "OTHER";

export type BusinessDocType = "NATIONAL_ID" | "PASSPORT";

export type BusinessStatus =
  | "PENDING"
  | "IN_REVIEW"
  | "PAYMENT_PENDING"
  | "PROCESSING"
  | "APPROVED"
  | "REJECTED";

// Response shape (BusinessModel.BusinessSummary on the gateway) - deliberately
// narrower than the create request: KYC-grade personal data (DOB, place of
// birth, mother's name, NIN/passport, gender, contact info, ID scan) is
// collected for verification but never echoed back over this API.
export interface Business {
  id: string;
  trackingId: string;
  ownerId?: string | null;
  businessName: string;
  businessAddress: string;
  ownerName: string;
  businessCategory: BusinessCategory;
  otherCategory?: string | null;
  businessEntityType: string;
  businessActivities: string;
  registrationNumber?: string | null;
  registerDate?: string | null;
  status: BusinessStatus;
  rejectionReason?: string | null;
  createTime: string;
  updateTime: string;
}

// POST /api/v1/businesses request shape (BusinessDto.BusinessMetaDto) - all
// fields below marked required are @NotBlank on the backend and will 400
// without them.
export interface BusinessMeta {
  ownerId?: string;
  businessName: string;
  businessAddress: string;
  ownerName: string;
  ownerAddress: string;
  placeOfBirth: string;
  dateOfBirth: string; // ISO yyyy-MM-dd
  gender: CommonGender;
  nationality: string;
  mothersName: string;
  contactNumber: string;
  email: string;
  businessCategory: BusinessCategory;
  registerDate?: string; // ISO yyyy-MM-dd, optional
  businessActivities: string;
  businessEntityType: string;
  registrationNumber?: string;
  isPublicRegister: boolean;
  createNawehubAccount: boolean;
  isAlreadyRegistered: boolean;
  ninPassport: string;
  occupation?: string;
  docType?: BusinessDocType;
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

// GET /api/v1/opportunities/analysis returns a bare JSON array of these -
// not an object wrapper (there's no totalOpportunities from the backend,
// derive it client-side from the array if needed).
export interface CategoryAnalysisSummary {
  category: string;
  opportunityCount: number;
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
