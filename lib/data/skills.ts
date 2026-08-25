/**
 * Mirrors the `Skill` enum in entrepreneur-service's own proto
 * (entrepreneurdata/skill.proto) - skills are NOT free text on the wire,
 * despite being a plain string on the REST DTO (UpdateSkillsDto): the
 * gateway parses each string against this exact enum
 * (ProtoEnums.parse(Skill.class, "SKILL_", ...)), so an arbitrary
 * user-typed value 400s.
 */
export interface SkillOption {
  value: string;
  label: string;
  group: string;
}

export const SKILLS: SkillOption[] = [
  // Executive & Business Strategy
  { value: "BUSINESS_STRATEGY", label: "Business Strategy", group: "Executive & Business Strategy" },
  { value: "BUSINESS_MODELING", label: "Business Modeling", group: "Executive & Business Strategy" },
  { value: "LEADERSHIP", label: "Leadership", group: "Executive & Business Strategy" },
  { value: "FUNDRAISING", label: "Fundraising", group: "Executive & Business Strategy" },
  { value: "PITCHING_PRESENTING", label: "Pitching & Presenting", group: "Executive & Business Strategy" },
  { value: "OPERATIONS_MANAGEMENT", label: "Operations Management", group: "Executive & Business Strategy" },
  { value: "LEGAL_COMPLIANCE", label: "Legal & Compliance", group: "Executive & Business Strategy" },
  { value: "GOVERNANCE", label: "Governance", group: "Executive & Business Strategy" },

  // Product, Design & UX
  { value: "PRODUCT_MANAGEMENT", label: "Product Management", group: "Product, Design & UX" },
  { value: "PRODUCT_DESIGN_UI_UX", label: "Product Design (UI/UX)", group: "Product, Design & UX" },
  { value: "USER_RESEARCH", label: "User Research", group: "Product, Design & UX" },
  { value: "PROTOTYPING", label: "Prototyping", group: "Product, Design & UX" },
  { value: "AGILE_SCRUM", label: "Agile / Scrum", group: "Product, Design & UX" },

  // Technology & Engineering
  { value: "SOFTWARE_DEVELOPMENT", label: "Software Development", group: "Technology & Engineering" },
  { value: "WEB_DEVELOPMENT", label: "Web Development", group: "Technology & Engineering" },
  { value: "MOBILE_DEVELOPMENT", label: "Mobile Development", group: "Technology & Engineering" },
  { value: "AI_MACHINE_LEARNING", label: "AI / Machine Learning", group: "Technology & Engineering" },
  { value: "DATA_SCIENCE_ANALYTICS", label: "Data Science & Analytics", group: "Technology & Engineering" },
  { value: "CLOUD_INFRASTRUCTURE", label: "Cloud Infrastructure", group: "Technology & Engineering" },
  { value: "CYBERSECURITY", label: "Cybersecurity", group: "Technology & Engineering" },
  { value: "HARDWARE_IOT", label: "Hardware / IoT", group: "Technology & Engineering" },

  // Growth, Marketing & Sales
  { value: "DIGITAL_MARKETING", label: "Digital Marketing", group: "Growth, Marketing & Sales" },
  { value: "GROWTH_HACKING", label: "Growth Hacking", group: "Growth, Marketing & Sales" },
  { value: "CONTENT_CREATION", label: "Content Creation", group: "Growth, Marketing & Sales" },
  { value: "SOCIAL_MEDIA_MANAGEMENT", label: "Social Media Management", group: "Growth, Marketing & Sales" },
  { value: "SEO_SEM", label: "SEO / SEM", group: "Growth, Marketing & Sales" },
  { value: "BRANDING", label: "Branding", group: "Growth, Marketing & Sales" },
  { value: "PUBLIC_RELATIONS", label: "Public Relations", group: "Growth, Marketing & Sales" },
  { value: "B2B_SALES", label: "B2B Sales", group: "Growth, Marketing & Sales" },
  { value: "B2C_SALES", label: "B2C Sales", group: "Growth, Marketing & Sales" },

  // Finance & Economics
  { value: "FINANCIAL_MODELING", label: "Financial Modeling", group: "Finance & Economics" },
  { value: "ACCOUNTING", label: "Accounting", group: "Finance & Economics" },
  { value: "VALUATION", label: "Valuation", group: "Finance & Economics" },
  { value: "BUDGETING_FORECASTING", label: "Budgeting & Forecasting", group: "Finance & Economics" },
  { value: "UNIT_ECONOMICS", label: "Unit Economics", group: "Finance & Economics" },

  // Social Impact & Field Operations
  { value: "IMPACT_MEASUREMENT", label: "Impact Measurement", group: "Social Impact & Field Operations" },
  { value: "COMMUNITY_ENGAGEMENT", label: "Community Engagement", group: "Social Impact & Field Operations" },
  { value: "SUPPLY_CHAIN_LOGISTICS", label: "Supply Chain & Logistics", group: "Social Impact & Field Operations" },
  { value: "PARTNERSHIP_BUILDING", label: "Partnership Building", group: "Social Impact & Field Operations" },
  { value: "GRANT_WRITING", label: "Grant Writing", group: "Social Impact & Field Operations" },

  // Soft Skills & Execution
  { value: "NEGOTIATION", label: "Negotiation", group: "Soft Skills & Execution" },
  { value: "TEAM_BUILDING_RECRUITING", label: "Team Building & Recruiting", group: "Soft Skills & Execution" },
  { value: "PROBLEM_SOLVING", label: "Problem Solving", group: "Soft Skills & Execution" },
  { value: "TIME_MANAGEMENT", label: "Time Management", group: "Soft Skills & Execution" },
];

export const SKILL_GROUPS: string[] = Array.from(new Set(SKILLS.map((s) => s.group)));

export function skillLabel(value: string): string {
  return SKILLS.find((s) => s.value === value)?.label ?? value;
}
