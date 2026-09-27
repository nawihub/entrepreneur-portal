/**
 * Option lists for the list-page filters. Values are the exact enum names the
 * web-api-gateway parses (ProtoEnums.parse strips/adds the proto prefix), so they
 * are sent as-is; labels are what entrepreneurs see.
 */
export interface FilterOption {
  value: string;
  label: string;
}

const option = (value: string, label: string): FilterOption => ({ value, label });

// opportunity-service domain/opportunity/vo/Category
export const OPPORTUNITY_CATEGORIES: FilterOption[] = [
  option("GRANTS", "Grants"),
  option("COMPETITIONS", "Competitions"),
  option("EVENTS", "Events"),
  option("TRAINING", "Training"),
  option("FELLOWSHIPS", "Fellowships"),
  option("SCHOLARSHIPS", "Scholarships"),
  option("INCUBATORS", "Incubators & accelerators"),
  option("JOBS", "Jobs"),
  option("CLIMATE", "Climate"),
  option("WOMEN", "Women"),
  option("YOUTH", "Youth"),
  option("OTHER", "Other"),
];

// opportunity-service domain/opportunity/vo/TargetBeneficiary
export const OPPORTUNITY_BENEFICIARIES: FilterOption[] = [
  option("ENTREPRENEURS", "Entrepreneurs"),
  option("STARTUPS", "Startups"),
  option("SMES", "SMEs"),
  option("WOMEN_LED_BUSINESSES", "Women-led businesses"),
  option("YOUTH", "Youth"),
  option("STUDENTS", "Students"),
  option("INNOVATORS", "Innovators"),
  option("RESEARCHERS", "Researchers"),
  option("FARMERS", "Farmers"),
  option("PERSONS_WITH_DISABILITIES", "Persons with disabilities"),
  option("OTHER", "Other"),
];

// opportunity-service domain/opportunity/vo/GeographicScope
export const OPPORTUNITY_SCOPES: FilterOption[] = [
  option("SIERRA_LEONE_ONLY", "Sierra Leone only"),
  option("AFRICA", "Africa"),
  option("GLOBAL", "Global"),
  option("OTHER", "Other"),
];

export const IDEA_STAGES: FilterOption[] = [
  option("CONCEPT_ONLY", "Concept only"),
  option("RESEARCH_COMPLETED", "Research completed"),
  option("PROTOTYPE_DEVELOPED", "Prototype developed"),
  option("TESTING_PILOT", "Testing / pilot"),
  option("ALREADY_OPERATING", "Already operating"),
];

export const IDEA_SUBMISSION_TYPES: FilterOption[] = [
  option("INDIVIDUAL", "Individual"),
  option("TEAM", "Team"),
  option("EXISTING_BUSINESS", "Existing business"),
  option("ORGANISATION", "Organisation"),
];

// Labels are written for the idea's owner: PENDING is their private draft, PUBLISHED means
// it has been submitted and is waiting for an admin to pick it up.
export const IDEA_STATUSES: FilterOption[] = [
  option("PENDING", "Draft"),
  option("PUBLISHED", "Submitted"),
  option("IN_REVIEW", "In review"),
  option("APPROVED", "Approved"),
  option("DECLINED", "Declined"),
];

export const BUSINESS_CATEGORIES: FilterOption[] = [
  option("AGRICULTURE", "Agriculture"),
  option("TECHNOLOGY", "Technology"),
  option("FASHION_TEXTILES", "Fashion & textiles"),
  option("FOOD_BEVERAGE", "Food & beverage"),
  option("HEALTHCARE", "Healthcare"),
  option("EDUCATION", "Education"),
  option("CONSTRUCTION", "Construction"),
  option("TRANSPORTATION", "Transportation"),
  option("RETAIL", "Retail"),
  option("MANUFACTURING", "Manufacturing"),
  option("SERVICES", "Services"),
  option("TOURISM", "Tourism"),
  option("MINING", "Mining"),
  option("ENERGY", "Energy"),
  option("OTHER", "Other"),
];

export const BUSINESS_STATUSES: FilterOption[] = [
  option("PENDING", "Pending"),
  option("IN_REVIEW", "In review"),
  option("PAYMENT_PENDING", "Payment pending"),
  option("PROCESSING", "Processing"),
  option("APPROVED", "Approved"),
  option("REJECTED", "Rejected"),
];

export const RESOURCE_TYPES: FilterOption[] = [
  option("DOCUMENT", "Documents"),
  option("VIDEO", "Videos"),
];

// Document formats; videos are always NOT_APPLICABLE so it isn't offered as a filter.
export const RESOURCE_FORMATS: FilterOption[] = [
  option("TEMPLATE", "Templates"),
  option("GUIDE", "Guides"),
  option("CHECKLIST", "Checklists"),
  option("CASE_STUDY", "Case studies"),
  option("COURSE", "Courses"),
  option("FRAMEWORK", "Frameworks"),
];

/** Label for a value from one of the lists above, falling back to a readable enum. */
export function labelFor(options: FilterOption[], value: string | null | undefined) {
  if (!value) return "";
  return options.find((o) => o.value === value)?.label ?? value.toLowerCase().replaceAll("_", " ").replace(/^\w/, (c) => c.toUpperCase());
}
