/**
 * ATS resume scoring utilities.
 * Pure scoring helpers stay side-effect free; only semantic + orchestrator hit the network.
 */

import { env } from "@/lib/env";
import { supabase } from "@/lib/supabase";
import type { AppResume } from "@/types/app-resume";
import { APP_RESUME_SECTION_TYPE } from "./enums/resume";
import { differenceInMonths } from "date-fns";
import { flattenResumeSectionsText } from "@/components/applications/resume-builder/app-resume-utils";

export interface ExtractedKeyword {
  term: string;
  category:
    | "hard_skill"
    | "tool"
    | "certification"
    | "soft_skill"
    | "responsibility";
  frequency: number;
  isRequired: boolean;
  weight: number;
}

export interface KeywordMatchResult {
  /** 0-100 */
  subscore: number;
  matchedKeywords: (ExtractedKeyword & { found: true })[];
  missingKeywords: (ExtractedKeyword & { found: false })[];
}

export interface ParseabilityCheck {
  check: string;
  passed: boolean;
  penalty: number;
}

export interface QualificationResult {
  /** 0-100 */
  score: number;
  flags: string[];
}

export interface ATSScoreResult {
  overallScore: number;
  breakdown: {
    keywordMatch: number;
    parseability: number;
    qualifications: number;
  };
  missingKeywords: ExtractedKeyword[];
  suggestions: string[];
}

export interface ResumeMetadata {
  hasTables?: boolean;
  hasImages?: boolean;
  fileFormat?: string;
}

type KeywordCategory = ExtractedKeyword["category"];

interface TaxonomyEntry {
  term: string;
  category: KeywordCategory;
  aliases?: string[];
}

const CATEGORY_MULTIPLIER: Record<KeywordCategory, number> = {
  hard_skill: 1.2,
  tool: 1.1,
  certification: 1.3,
  soft_skill: 0.6,
  responsibility: 0.8,
};

const BASE_WEIGHT = 1;

/** Common synonym / abbreviation map for fuzzy matching across industries. */
const SYNONYM_MAP: Record<string, string[]> = {
  // Tech
  javascript: ["js", "ecmascript"],
  js: ["javascript"],
  typescript: ["ts"],
  ts: ["typescript"],
  "machine learning": ["ml"],
  ml: ["machine learning"],
  "artificial intelligence": ["ai"],
  ai: ["artificial intelligence"],
  kubernetes: ["k8s"],
  k8s: ["kubernetes"],
  postgresql: ["postgres", "psql"],
  postgres: ["postgresql"],
  "ci/cd": ["cicd", "continuous integration", "continuous delivery"],
  "rest api": ["restful", "rest apis", "restful apis"],
  "node.js": ["nodejs", "node"],
  nodejs: ["node.js", "node"],
  "react.js": ["react", "reactjs"],
  react: ["react.js", "reactjs"],
  aws: ["amazon web services"],
  "amazon web services": ["aws"],
  gcp: ["google cloud", "google cloud platform"],
  "google cloud": ["gcp", "google cloud platform"],
  // Health
  emr: ["electronic medical records", "ehr", "electronic health records"],
  ehr: ["electronic health records", "emr", "electronic medical records"],
  hipaa: ["health insurance portability and accountability act"],
  cpr: ["cardiopulmonary resuscitation"],
  bls: ["basic life support"],
  acls: ["advanced cardiac life support"],
  rn: ["registered nurse"],
  lpn: ["licensed practical nurse"],
  "patient care": ["direct patient care", "bedside care"],
  // Finance
  gaap: ["generally accepted accounting principles"],
  ifrs: ["international financial reporting standards"],
  cpa: ["certified public accountant"],
  cfa: ["chartered financial analyst"],
  erp: ["enterprise resource planning"],
  quickbooks: ["quick books"],
  "financial modeling": ["financial models", "financial model"],
  "accounts payable": ["ap"],
  "accounts receivable": ["ar"],
  ap: ["accounts payable"],
  ar: ["accounts receivable"],
  // Marketing
  seo: ["search engine optimization"],
  sem: ["search engine marketing"],
  crm: ["customer relationship management"],
  "google analytics": ["ga4", "google analytics 4"],
  ga4: ["google analytics", "google analytics 4"],
  "social media marketing": ["smm", "social media"],
  "content marketing": ["content strategy"],
  "email marketing": ["email campaigns"],
  // Customer service / business
  kpi: ["key performance indicators", "key performance indicator"],
  sla: ["service level agreement", "service level agreements"],
  "customer success": ["client success"],
  "account management": ["client management"],
  "project management": ["program management"],
  okrs: ["objectives and key results", "okr"],
  okr: ["okrs", "objectives and key results"],
};

// TODO: expand taxonomy further by industry niche (legal, education, trades, etc.)
const KNOWN_SKILLS: TaxonomyEntry[] = [
  // —— Tech: languages & frameworks ——
  { term: "JavaScript", category: "hard_skill", aliases: ["js"] },
  { term: "TypeScript", category: "hard_skill", aliases: ["ts"] },
  { term: "Python", category: "hard_skill" },
  { term: "Java", category: "hard_skill" },
  { term: "C++", category: "hard_skill", aliases: ["cpp", "c plus plus"] },
  { term: "C#", category: "hard_skill", aliases: ["csharp", "c sharp"] },
  { term: "Go", category: "hard_skill", aliases: ["golang"] },
  { term: "Rust", category: "hard_skill" },
  { term: "Ruby", category: "hard_skill" },
  { term: "PHP", category: "hard_skill" },
  { term: "Swift", category: "hard_skill" },
  { term: "Kotlin", category: "hard_skill" },
  { term: "SQL", category: "hard_skill" },
  { term: "HTML", category: "hard_skill", aliases: ["html5"] },
  { term: "CSS", category: "hard_skill", aliases: ["css3"] },
  { term: "React", category: "hard_skill", aliases: ["react.js", "reactjs"] },
  { term: "Next.js", category: "hard_skill", aliases: ["nextjs", "next"] },
  { term: "Vue.js", category: "hard_skill", aliases: ["vue", "vuejs"] },
  { term: "Angular", category: "hard_skill", aliases: ["angularjs"] },
  { term: "Node.js", category: "hard_skill", aliases: ["nodejs", "node"] },
  { term: "Express", category: "hard_skill", aliases: ["express.js"] },
  { term: "Django", category: "hard_skill" },
  { term: "Flask", category: "hard_skill" },
  { term: "Spring Boot", category: "hard_skill", aliases: ["spring"] },
  { term: "GraphQL", category: "hard_skill" },
  { term: "REST API", category: "hard_skill", aliases: ["rest", "restful"] },
  { term: "Redux", category: "hard_skill" },
  { term: "Tailwind CSS", category: "hard_skill", aliases: ["tailwind"] },
  { term: "Machine Learning", category: "hard_skill", aliases: ["ml"] },
  {
    term: "Artificial Intelligence",
    category: "hard_skill",
    aliases: ["ai"],
  },
  { term: "Data Structures", category: "hard_skill" },
  { term: "Algorithms", category: "hard_skill" },
  { term: "System Design", category: "hard_skill" },
  {
    term: "Object Oriented Programming",
    category: "hard_skill",
    aliases: [
      "oop",
      "object-oriented",
      "object oriented",
      "object-oriented programming",
      "object oriented programming",
      "object-oriented languages",
      "object oriented languages",
    ],
  },
  { term: "Microservices", category: "hard_skill" },
  { term: "Cybersecurity", category: "hard_skill", aliases: ["infosec"] },
  {
    term: "Data Analysis",
    category: "hard_skill",
    aliases: ["data analytics"],
  },
  { term: "Data Visualization", category: "hard_skill" },

  // —— Tech tools ——
  { term: "Docker", category: "tool" },
  { term: "Kubernetes", category: "tool", aliases: ["k8s"] },
  { term: "AWS", category: "tool", aliases: ["amazon web services"] },
  { term: "Azure", category: "tool", aliases: ["microsoft azure"] },
  {
    term: "GCP",
    category: "tool",
    aliases: ["google cloud", "google cloud platform"],
  },
  { term: "Terraform", category: "tool" },
  { term: "Jenkins", category: "tool" },
  { term: "GitHub Actions", category: "tool" },
  { term: "GitLab CI", category: "tool" },
  { term: "CI/CD", category: "tool", aliases: ["cicd"] },
  { term: "PostgreSQL", category: "tool", aliases: ["postgres"] },
  { term: "MySQL", category: "tool" },
  { term: "MongoDB", category: "tool" },
  { term: "Redis", category: "tool" },
  { term: "Elasticsearch", category: "tool" },
  { term: "Kafka", category: "tool", aliases: ["apache kafka"] },
  { term: "RabbitMQ", category: "tool" },
  { term: "Git", category: "tool" },
  { term: "GitHub", category: "tool" },
  { term: "Jira", category: "tool" },
  { term: "Confluence", category: "tool" },
  { term: "Figma", category: "tool" },
  { term: "Webpack", category: "tool" },
  { term: "Vite", category: "tool" },
  { term: "Jest", category: "tool" },
  { term: "Cypress", category: "tool" },
  { term: "Playwright", category: "tool" },
  { term: "Selenium", category: "tool" },
  { term: "Linux", category: "tool" },
  { term: "Nginx", category: "tool" },
  { term: "Prometheus", category: "tool" },
  { term: "Grafana", category: "tool" },
  { term: "Datadog", category: "tool" },
  { term: "Sentry", category: "tool" },
  { term: "Supabase", category: "tool" },
  { term: "Firebase", category: "tool" },
  { term: "Tableau", category: "tool" },
  { term: "Power BI", category: "tool", aliases: ["powerbi"] },
  { term: "Excel", category: "tool", aliases: ["microsoft excel"] },
  { term: "Salesforce", category: "tool" },
  { term: "HubSpot", category: "tool" },
  { term: "Slack", category: "tool" },
  { term: "Asana", category: "tool" },
  { term: "Trello", category: "tool" },
  { term: "Notion", category: "tool" },
  { term: "Zapier", category: "tool" },

  // —— Health / clinical ——
  {
    term: "Patient Care",
    category: "hard_skill",
    aliases: ["direct patient care"],
  },
  { term: "Clinical Documentation", category: "hard_skill" },
  { term: "Medication Administration", category: "hard_skill" },
  { term: "Vital Signs", category: "hard_skill" },
  { term: "Care Planning", category: "hard_skill", aliases: ["care plans"] },
  { term: "Triage", category: "hard_skill" },
  { term: "Wound Care", category: "hard_skill" },
  { term: "Infection Control", category: "hard_skill" },
  { term: "HIPAA", category: "hard_skill", aliases: ["hipaa compliance"] },
  { term: "Phlebotomy", category: "hard_skill" },
  { term: "Medical Terminology", category: "hard_skill" },
  {
    term: "Electronic Medical Records",
    category: "tool",
    aliases: ["emr", "ehr", "electronic health records"],
  },
  { term: "Epic", category: "tool", aliases: ["epic systems"] },
  { term: "Cerner", category: "tool" },
  { term: "Meditech", category: "tool" },
  {
    term: "CPR",
    category: "certification",
    aliases: ["cardiopulmonary resuscitation"],
  },
  { term: "BLS", category: "certification", aliases: ["basic life support"] },
  {
    term: "ACLS",
    category: "certification",
    aliases: ["advanced cardiac life support"],
  },
  { term: "Registered Nurse", category: "certification", aliases: ["rn"] },
  {
    term: "Licensed Practical Nurse",
    category: "certification",
    aliases: ["lpn"],
  },
  {
    term: "CNA",
    category: "certification",
    aliases: ["certified nursing assistant"],
  },
  { term: "Patient Education", category: "responsibility" },
  { term: "Care Coordination", category: "responsibility" },
  { term: "Discharge Planning", category: "responsibility" },

  // —— Finance / accounting ——
  { term: "Financial Analysis", category: "hard_skill" },
  {
    term: "Financial Modeling",
    category: "hard_skill",
    aliases: ["financial models"],
  },
  { term: "Budgeting", category: "hard_skill", aliases: ["budget management"] },
  {
    term: "Forecasting",
    category: "hard_skill",
    aliases: ["financial forecasting"],
  },
  { term: "Bookkeeping", category: "hard_skill" },
  { term: "Accounts Payable", category: "hard_skill", aliases: ["ap"] },
  { term: "Accounts Receivable", category: "hard_skill", aliases: ["ar"] },
  { term: "General Ledger", category: "hard_skill" },
  {
    term: "Reconciliation",
    category: "hard_skill",
    aliases: ["bank reconciliation"],
  },
  { term: "GAAP", category: "hard_skill" },
  { term: "IFRS", category: "hard_skill" },
  { term: "Tax Preparation", category: "hard_skill", aliases: ["tax filing"] },
  { term: "Risk Management", category: "hard_skill" },
  { term: "Auditing", category: "hard_skill", aliases: ["internal audit"] },
  { term: "QuickBooks", category: "tool", aliases: ["quick books"] },
  { term: "SAP", category: "tool" },
  { term: "Oracle NetSuite", category: "tool", aliases: ["netsuite"] },
  { term: "Xero", category: "tool" },
  { term: "Bloomberg Terminal", category: "tool", aliases: ["bloomberg"] },
  {
    term: "CPA",
    category: "certification",
    aliases: ["certified public accountant"],
  },
  {
    term: "CFA",
    category: "certification",
    aliases: ["chartered financial analyst"],
  },
  { term: "Financial Reporting", category: "responsibility" },
  {
    term: "Month-End Close",
    category: "responsibility",
    aliases: ["month end close"],
  },
  { term: "Variance Analysis", category: "responsibility" },

  // —— Marketing / growth ——
  {
    term: "SEO",
    category: "hard_skill",
    aliases: ["search engine optimization"],
  },
  { term: "SEM", category: "hard_skill", aliases: ["search engine marketing"] },
  {
    term: "Content Marketing",
    category: "hard_skill",
    aliases: ["content strategy"],
  },
  {
    term: "Social Media Marketing",
    category: "hard_skill",
    aliases: ["smm", "social media"],
  },
  {
    term: "Email Marketing",
    category: "hard_skill",
    aliases: ["email campaigns"],
  },
  { term: "Copywriting", category: "hard_skill" },
  { term: "Brand Strategy", category: "hard_skill", aliases: ["branding"] },
  { term: "Market Research", category: "hard_skill" },
  { term: "Campaign Management", category: "hard_skill" },
  { term: "Paid Media", category: "hard_skill", aliases: ["paid ads", "ppc"] },
  { term: "Google Ads", category: "tool", aliases: ["adwords"] },
  {
    term: "Meta Ads",
    category: "tool",
    aliases: ["facebook ads", "instagram ads"],
  },
  {
    term: "Google Analytics",
    category: "tool",
    aliases: ["ga4", "google analytics 4"],
  },
  { term: "Mailchimp", category: "tool" },
  { term: "Klaviyo", category: "tool" },
  { term: "Canva", category: "tool" },
  { term: "Adobe Photoshop", category: "tool", aliases: ["photoshop"] },
  { term: "Adobe Illustrator", category: "tool", aliases: ["illustrator"] },
  { term: "Google Tag Manager", category: "tool", aliases: ["gtm"] },
  {
    term: "A/B Testing",
    category: "responsibility",
    aliases: ["ab testing", "split testing"],
  },
  { term: "Lead Generation", category: "responsibility" },
  {
    term: "Conversion Optimization",
    category: "responsibility",
    aliases: ["cro"],
  },

  // —— Customer service / support ——
  {
    term: "Customer Service",
    category: "hard_skill",
    aliases: ["client service"],
  },
  {
    term: "Customer Support",
    category: "hard_skill",
    aliases: ["tech support", "technical support"],
  },
  { term: "Conflict Resolution", category: "hard_skill" },
  { term: "De-escalation", category: "hard_skill", aliases: ["deescalation"] },
  { term: "Active Listening", category: "soft_skill" },
  { term: "Empathy", category: "soft_skill" },
  { term: "Zendesk", category: "tool" },
  { term: "Intercom", category: "tool" },
  { term: "Freshdesk", category: "tool" },
  { term: "ServiceNow", category: "tool" },
  { term: "Live Chat", category: "tool", aliases: ["chat support"] },
  {
    term: "Call Center",
    category: "responsibility",
    aliases: ["contact center"],
  },
  {
    term: "Ticket Management",
    category: "responsibility",
    aliases: ["case management"],
  },
  { term: "Customer Retention", category: "responsibility" },
  { term: "SLA Management", category: "responsibility", aliases: ["sla"] },
  { term: "Upselling", category: "responsibility", aliases: ["upsell"] },
  {
    term: "Cross-selling",
    category: "responsibility",
    aliases: ["cross sell"],
  },

  // —— Business / operations / sales ——
  {
    term: "Project Management",
    category: "hard_skill",
    aliases: ["program management"],
  },
  { term: "Product Management", category: "hard_skill" },
  {
    term: "Business Analysis",
    category: "hard_skill",
    aliases: ["business analyst"],
  },
  {
    term: "Process Improvement",
    category: "hard_skill",
    aliases: ["process optimization"],
  },
  { term: "Strategic Planning", category: "hard_skill" },
  { term: "Operations Management", category: "hard_skill" },
  {
    term: "Supply Chain",
    category: "hard_skill",
    aliases: ["supply chain management"],
  },
  { term: "Vendor Management", category: "hard_skill" },
  { term: "Contract Negotiation", category: "hard_skill" },
  {
    term: "Sales",
    category: "hard_skill",
    aliases: ["b2b sales", "b2c sales"],
  },
  { term: "Business Development", category: "hard_skill", aliases: ["bizdev"] },
  {
    term: "Account Management",
    category: "hard_skill",
    aliases: ["client management"],
  },
  {
    term: "Customer Success",
    category: "hard_skill",
    aliases: ["client success"],
  },
  {
    term: "CRM",
    category: "tool",
    aliases: ["customer relationship management"],
  },
  {
    term: "Microsoft Office",
    category: "tool",
    aliases: ["ms office", "office 365", "microsoft 365"],
  },
  {
    term: "Google Workspace",
    category: "tool",
    aliases: ["g suite", "gsuite"],
  },
  { term: "ERP", category: "tool", aliases: ["enterprise resource planning"] },
  { term: "PMP", category: "certification" },
  { term: "Scrum Master", category: "certification", aliases: ["csm"] },
  { term: "Six Sigma", category: "certification", aliases: ["lean six sigma"] },
  {
    term: "KPI Tracking",
    category: "responsibility",
    aliases: ["kpi", "kpis"],
  },
  { term: "OKRs", category: "responsibility", aliases: ["okr"] },
  { term: "Stakeholder Communication", category: "responsibility" },
  {
    term: "Go-to-Market",
    category: "responsibility",
    aliases: ["gtm", "go to market"],
  },
  {
    term: "Pipeline Management",
    category: "responsibility",
    aliases: ["sales pipeline"],
  },

  // —— Shared certifications ——
  { term: "AWS Certified Solutions Architect", category: "certification" },
  { term: "AWS Certified Developer", category: "certification" },
  { term: "Google Cloud Professional", category: "certification" },
  {
    term: "CKA",
    category: "certification",
    aliases: ["certified kubernetes administrator"],
  },
  {
    term: "CompTIA Security+",
    category: "certification",
    aliases: ["security+"],
  },
  { term: "CISSP", category: "certification" },
  { term: "Google Analytics Certification", category: "certification" },
  { term: "HubSpot Certification", category: "certification" },

  // —— Shared soft skills ——
  { term: "Communication", category: "soft_skill" },
  { term: "Leadership", category: "soft_skill" },
  {
    term: "Problem Solving",
    category: "soft_skill",
    aliases: ["problem-solving"],
  },
  { term: "Collaboration", category: "soft_skill", aliases: ["teamwork"] },
  { term: "Mentoring", category: "soft_skill", aliases: ["mentorship"] },
  { term: "Stakeholder Management", category: "soft_skill" },
  { term: "Time Management", category: "soft_skill" },
  { term: "Critical Thinking", category: "soft_skill" },
  { term: "Adaptability", category: "soft_skill" },
  { term: "Ownership", category: "soft_skill" },
  { term: "Attention to Detail", category: "soft_skill" },
  { term: "Multitasking", category: "soft_skill" },
  { term: "Presentation Skills", category: "soft_skill" },
  { term: "Negotiation", category: "soft_skill" },
  { term: "Organizational Skills", category: "soft_skill" },

  // —— Shared responsibilities ——
  { term: "Agile", category: "responsibility", aliases: ["scrum", "kanban"] },
  { term: "Code Review", category: "responsibility" },
  { term: "Technical Writing", category: "responsibility" },
  { term: "Cross-functional Collaboration", category: "responsibility" },
  { term: "Product Development", category: "responsibility" },
  { term: "Software Architecture", category: "responsibility" },
  { term: "Performance Optimization", category: "responsibility" },
  { term: "Debugging", category: "responsibility" },
  { term: "Unit Testing", category: "responsibility" },
  { term: "API Design", category: "responsibility" },
  { term: "Incident Response", category: "responsibility" },
  { term: "On-call", category: "responsibility", aliases: ["on call"] },
  { term: "Team Leadership", category: "responsibility" },
  {
    term: "Training & Onboarding",
    category: "responsibility",
    aliases: ["training", "onboarding"],
  },
  { term: "Quality Assurance", category: "responsibility", aliases: ["qa"] },
  {
    term: "Compliance",
    category: "responsibility",
    aliases: ["regulatory compliance"],
  },
];

const REQUIRED_HEADING =
  /\b(required|must[- ]haves?|qualifications|minimum qualifications|requirements|you bring|what you(?:'ll| will)? (?:need|bring)|what we(?:'re| are) looking for)\b/i;
const PREFERRED_HEADING =
  /\b(preferred(?: qualifications)?|nice[- ]to[- ]have|bonus(?: points)?|pluses?|optional|desired)\b/i;

/**
 * Only treat a line as a section heading when the keyword is a real header,
 * not an inline mention like "(C# preferred)" or "(Vue preferred)".
 */
function lineMatchesHeading(line: string, pattern: RegExp): boolean {
  const trimmed = line.trim();
  if (!trimmed) return false;
  const match = pattern.exec(trimmed);
  if (!match || match.index == null) return false;

  const wordCount = trimmed.split(/\s+/).filter(Boolean).length;
  const endsWithColon = /:\s*$/.test(trimmed);
  const matchNearStart = match.index <= 24;

  // Short header lines: "Bonus Points", "Preferred Qualifications"
  if (wordCount <= 8 && matchNearStart) return true;
  // Explicit section labels: "Requirements:", "You Bring:"
  if (endsWithColon && wordCount <= 12 && matchNearStart) return true;
  return false;
}

const STOP_WORDS = new Set([
  "a",
  "an",
  "the",
  "and",
  "or",
  "to",
  "of",
  "in",
  "on",
  "for",
  "with",
  "as",
  "by",
  "at",
  "from",
  "is",
  "are",
  "be",
  "this",
  "that",
  "will",
  "our",
  "you",
  "your",
  "we",
  "us",
  "have",
  "has",
  "can",
  "ability",
  "experience",
  "years",
  "year",
  "using",
  "including",
  "such",
  "etc",
  "strong",
  "solid",
  "working",
  "knowledge",
  "proficient",
  "familiarity",
  "understanding",
]);

const STANDARD_SECTION_HEADERS = [
  "experience",
  "work experience",
  "clinical experience",
  "education",
  "skills",
  "summary",
  "projects",
  "certifications",
  "licenses",
];

const VALID_FILE_FORMATS = new Set(["docx", "pdf-text", "txt"]);

function normalizeTerm(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^\w+#./\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function simpleStem(value: string): string {
  const normalized = normalizeTerm(value);
  if (normalized.endsWith("ing") && normalized.length > 5) {
    return normalized.slice(0, -3);
  }
  if (normalized.endsWith("ies") && normalized.length > 4) {
    return `${normalized.slice(0, -3)}y`;
  }
  if (normalized.endsWith("es") && normalized.length > 4) {
    return normalized.slice(0, -2);
  }
  if (normalized.endsWith("s") && normalized.length > 3) {
    return normalized.slice(0, -1);
  }
  return normalized;
}

function expandVariants(term: string): string[] {
  const normalized = normalizeTerm(term);
  const variants = new Set<string>([normalized, simpleStem(normalized)]);
  const synonyms = SYNONYM_MAP[normalized] ?? [];
  for (const synonym of synonyms) {
    variants.add(normalizeTerm(synonym));
    variants.add(simpleStem(synonym));
  }
  return [...variants];
}

function buildTaxonomyIndex(): Map<string, TaxonomyEntry> {
  const index = new Map<string, TaxonomyEntry>();
  for (const entry of KNOWN_SKILLS) {
    index.set(normalizeTerm(entry.term), entry);
    for (const alias of entry.aliases ?? []) {
      index.set(normalizeTerm(alias), entry);
    }
  }
  return index;
}

const TAXONOMY_INDEX = buildTaxonomyIndex();

const REQUIRED_WEIGHT_MULTIPLIER = 1.5
/** Preferred / nice-to-have skills still count, just weigh a bit less. */
const PREFERRED_WEIGHT_MULTIPLIER = 0.9

function computeKeywordWeight(
  category: KeywordCategory,
  isRequired: boolean,
  frequency: number,
): number {
  return (
    BASE_WEIGHT *
    (isRequired
      ? REQUIRED_WEIGHT_MULTIPLIER
      : PREFERRED_WEIGHT_MULTIPLIER) *
    (1 + Math.log(1 + frequency)) *
    CATEGORY_MULTIPLIER[category]
  )
}

function splitJdSections(jdText: string): {
  requiredText: string;
  preferredText: string;
  generalText: string;
} {
  const lines = jdText.split(/\r?\n/);
  let mode: "general" | "required" | "preferred" = "general";
  const buckets = {
    general: [] as string[],
    required: [] as string[],
    preferred: [] as string[],
  };

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    if (lineMatchesHeading(trimmed, REQUIRED_HEADING)) {
      mode = "required";
      continue;
    }
    if (lineMatchesHeading(trimmed, PREFERRED_HEADING)) {
      mode = "preferred";
      continue;
    }
    buckets[mode].push(trimmed);
  }

  return {
    requiredText: buckets.required.join("\n"),
    preferredText: buckets.preferred.join("\n"),
    generalText: buckets.general.join("\n"),
  };
}

function extractNounPhraseCandidates(text: string): string[] {
  const cleaned = text
    .toLowerCase()
    .replace(/[•|*]/g, " ")
    .replace(/[^a-z0-9+#./\s-]/g, " ");
  const tokens = cleaned
    .split(/\s+/)
    .map((token) => token.trim())
    .filter(Boolean);

  const phrases: string[] = [];
  for (let index = 0; index < tokens.length; index += 1) {
    for (let size = 1; size <= 3; size += 1) {
      const slice = tokens.slice(index, index + size);
      if (slice.length < size) continue;
      if (slice.every((token) => STOP_WORDS.has(token))) continue;
      if (STOP_WORDS.has(slice[0]) || STOP_WORDS.has(slice[slice.length - 1])) {
        continue;
      }
      const phrase = slice.join(" ");
      phrases.push(phrase);
      // Also index hyphenated forms as spaced phrases:
      // "object-oriented" → "object oriented"
      const dehyphenated = phrase.replace(/-/g, " ").replace(/\s+/g, " ").trim();
      if (dehyphenated !== phrase) phrases.push(dehyphenated);
    }
  }
  return phrases;
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

/**
 * True when a skill is marked preferred inline, e.g. "(C# preferred)"
 * or "Vue preferred", even inside a required section.
 */
function termIsInlinePreferred(
  line: string,
  entry: TaxonomyEntry,
): boolean {
  if (!/\bpreferred\b/i.test(line)) return false

  const variants = [entry.term, ...(entry.aliases ?? [])]
  for (const variant of variants) {
    const escaped = escapeRegExp(variant)
    if (
      new RegExp(`${escaped}\\s*[)\\]]?\\s*preferred\\b`, "i").test(line)
    ) {
      return true
    }
    if (
      new RegExp(`\\bpreferred\\b[^\\n.]{0,48}${escaped}`, "i").test(line)
    ) {
      return true
    }
  }
  return false
}

/**
 * Extract weighted JD keywords using required/preferred section detection
 * and a local known-skills taxonomy.
 * Preferred skills (bonus sections or "(X preferred)") stay in the list
 * with a slightly lower weight.
 */
export function extractJDKeywords(jdText: string): ExtractedKeyword[] {
  const { requiredText, preferredText, generalText } = splitJdSections(jdText)
  const segments: Array<{ text: string; sectionRequired: boolean }> = [
    { text: requiredText, sectionRequired: true },
    { text: preferredText, sectionRequired: false },
    {
      text: generalText,
      sectionRequired: requiredText.trim().length === 0,
    },
  ]

  const aggregated = new Map<
    string,
    {
      term: string
      category: KeywordCategory
      frequency: number
      isRequired: boolean
    }
  >()

  for (const segment of segments) {
    if (!segment.text.trim()) continue
    for (const line of segment.text.split(/\n/)) {
      const trimmed = line.trim()
      if (!trimmed) continue
      const candidates = extractNounPhraseCandidates(trimmed)
      for (const candidate of candidates) {
        const entry = TAXONOMY_INDEX.get(normalizeTerm(candidate))
        if (!entry) continue

        const isRequired =
          segment.sectionRequired && !termIsInlinePreferred(trimmed, entry)
        const key = normalizeTerm(entry.term)
        const existing = aggregated.get(key)
        if (existing) {
          aggregated.set(key, {
            ...existing,
            frequency: existing.frequency + 1,
            isRequired: existing.isRequired || isRequired,
          })
        } else {
          aggregated.set(key, {
            term: entry.term,
            category: entry.category,
            frequency: 1,
            isRequired,
          })
        }
      }
    }
  }

  return [...aggregated.values()]
    .map((item) => ({
      term: item.term,
      category: item.category,
      frequency: item.frequency,
      isRequired: item.isRequired,
      weight: computeKeywordWeight(
        item.category,
        item.isRequired,
        item.frequency,
      ),
    }))
    .sort((left, right) => right.weight - left.weight)
}

function keywordFoundInResume(
  keyword: ExtractedKeyword,
  resumeNormalized: string,
  resumeStemmedTokens: Set<string>,
): boolean {
  const variants = expandVariants(keyword.term);
  for (const variant of variants) {
    if (!variant) continue;
    if (resumeNormalized.includes(variant)) return true;
    if (resumeStemmedTokens.has(simpleStem(variant))) return true;
  }
  return false;
}

/**
 * Fuzzy-match JD keywords against flattened resume text and score coverage.
 */
export function matchKeywords(
  jdKeywords: ExtractedKeyword[],
  resumeText: string,
): KeywordMatchResult {
  const resumeNormalized = normalizeTerm(resumeText);
  const resumeStemmedTokens = new Set(
    resumeNormalized
      .split(/\s+/)
      .filter(Boolean)
      .map((token) => simpleStem(token)),
  );

  const matchedKeywords: (ExtractedKeyword & { found: true })[] = [];
  const missingKeywords: (ExtractedKeyword & { found: false })[] = [];

  for (const keyword of jdKeywords) {
    if (keywordFoundInResume(keyword, resumeNormalized, resumeStemmedTokens)) {
      matchedKeywords.push({ ...keyword, found: true });
    } else {
      missingKeywords.push({ ...keyword, found: false });
    }
  }

  const totalWeight = jdKeywords.reduce((sum, item) => sum + item.weight, 0);
  const matchedWeight = matchedKeywords.reduce(
    (sum, item) => sum + item.weight,
    0,
  );
  const subscore =
    totalWeight <= 0
      ? resumeText.trim()
        ? 55
        : 0
      : (matchedWeight / totalWeight) * 100;

  return {
    subscore: clampScore(subscore),
    matchedKeywords,
    missingKeywords,
  };
}

/**
 * Run lightweight ATS parseability checks for AI-generated resume text.
 * Returns the check list; use {@link structuralScore} for a numeric score.
 */
export function scoreParseability(
  resumeText: string,
  resumeMetadata?: ResumeMetadata,
): ParseabilityCheck[] {
  const normalized = resumeText.toLowerCase();
  const hasStandardSection = STANDARD_SECTION_HEADERS.some((header) =>
    new RegExp(`\\b${header}\\b`, "i").test(normalized),
  );
  const hasConsistentDates =
    /(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+\d{4}/i.test(
      resumeText,
    ) || /\b(19|20)\d{2}\s*[-–—]\s*(present|(19|20)\d{2})\b/i.test(resumeText);
  const hasContactInfo =
    /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i.test(resumeText) ||
    /(\+?\d[\d\s().-]{7,}\d)/.test(resumeText) ||
    /\b(linkedin\.com|github\.com)\b/i.test(resumeText);

  const fileFormat = resumeMetadata?.fileFormat ?? "pdf-text";
  const fileFormatOk = VALID_FILE_FORMATS.has(fileFormat);
  const noTables = !(resumeMetadata?.hasTables ?? false);
  const noImages = !(resumeMetadata?.hasImages ?? false);

  return [
    {
      check: "Standard section headers present",
      passed: hasStandardSection,
      penalty: 15,
    },
    {
      check: "Consistent date formatting",
      passed: hasConsistentDates,
      penalty: 10,
    },
    {
      check: "Contact information present",
      passed: hasContactInfo,
      penalty: 15,
    },
    {
      check: "ATS-friendly file format",
      passed: fileFormatOk,
      penalty: 20,
    },
    {
      check: "No complex tables",
      passed: noTables,
      penalty: 10,
    },
    {
      check: "No embedded images of text",
      passed: noImages,
      penalty: 10,
    },
  ];
}

/**
 * Convert parseability checks into a 0-100 structural score.
 */
export function structuralScore(checks: ParseabilityCheck[]): number {
  const penaltyTotal = checks
    .filter((check) => !check.passed)
    .reduce((sum, check) => sum + check.penalty, 0);
  return Math.max(0, 100 - penaltyTotal);
}

const WORD_TO_NUM: Record<string, number> = {
  one: 1,
  two: 2,
  three: 3,
  four: 4,
  five: 5,
  six: 6,
  seven: 7,
  eight: 8,
  nine: 9,
  ten: 10,
  eleven: 11,
  twelve: 12,
  thirteen: 13,
  fourteen: 14,
  fifteen: 15,
};

function parseNumberToken(token: string): number | null {
  if (!token) return null;
  const cleaned = token.trim().toLowerCase().replace(/\s+/g, " ");
  if (/^a\s+decade$/.test(cleaned)) return 10;
  if (/^(a\s+)?couple(\s+of)?$/.test(cleaned)) return 2;
  if (WORD_TO_NUM[cleaned] != null) return WORD_TO_NUM[cleaned];
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
}

function extractRequiredYears(jdText: string): number | null {
  if (!jdText) return null;

  const text = jdText.replace(/[–—]/g, "-"); // normalize en/em dash to hyphen

  const wordNums = Object.keys(WORD_TO_NUM).join("|");
  const numToken = `(\\d+(?:\\.\\d+)?|${wordNums})`;
  const yearsWord = `(?:years?|yrs?)`;
  // allow up to 3 filler words between "of" and "experience" (e.g. "related", "hands-on")
  const filler = `(?:of\\s+)?(?:[\\w-]+\\s+){0,3}?`;
  const expWord = `(?:experience|exp\\b)`;

  const patterns: RegExp[] = [
    // "3-5 years", "3 to 5 years", "5-7 yrs" -> takes lower bound
    new RegExp(
      `${numToken}\\s*(?:-|to)\\s*${numToken}\\+?\\s*${yearsWord}`,
      "i",
    ),
    // "minimum of 2+ years", "at least 5 years", "over 5 years", "more than 5 years"
    new RegExp(
      `(?:minimum|at least|over|more than)\\s+(?:of\\s+)?${numToken}\\+?\\s*${yearsWord}`,
      "i",
    ),
    // "5+ years", "10+ yrs" (with or without "experience" nearby)
    new RegExp(`${numToken}\\s*\\+\\s*${yearsWord}`, "i"),
    // "5 years of related experience", "three years experience"
    new RegExp(`${numToken}\\+?\\s*${yearsWord}\\s+${filler}${expWord}`, "i"),
    // "a decade of experience", "a couple of years"
    new RegExp(
      `(a\\s+decade|a\\s+couple(?:\\s+of)?)\\s+(?:of\\s+)?${yearsWord}?\\s*(?:of\\s+)?${expWord}?`,
      "i",
    ),
  ];

  let best: { index: number; value: number } | null = null;

  for (const pattern of patterns) {
    const match = pattern.exec(text);
    if (!match?.[1]) continue;
    const value = parseNumberToken(match[1]);
    if (value == null) continue;
    if (best === null || match.index < best.index) {
      best = { index: match.index, value };
    }
  }

  return best ? best.value : null;
}
type DegreeLevel =
	| "PhD"
	| "Master's"
	| "Bachelor's"
	| "Associate's"
	| "High School"

/** Highest education first (index 0 = strongest). */
const DEGREE_LEVEL_ORDER: DegreeLevel[] = [
	"PhD",
	"Master's",
	"Bachelor's",
	"Associate's",
	"High School",
]

interface DegreePatternSet {
	level: DegreeLevel
	safe: RegExp[]
	ambiguous: RegExp[]
}

const DEGREE_PATTERNS: DegreePatternSet[] = [
	{
		level: "PhD",
		safe: [
			/\bph\.?\s?d\.?s?\b/i,
			/\bdoctorate\b/i,
			/\bdoctoral\s+degree\b/i,
			/\bterminal\s+degree\b/i,
		],
		ambiguous: [],
	},
	{
		level: "Master's",
		safe: [
			/\bmaster'?s\b/i,
			/\bmasters\b/i,
			/\bmaster\s+(?:of|degree)\b/i,
			/\bmba\b/i,
			/\bm\.?eng\.?\b/i,
			/\bgraduate\s+degree\b/i,
			/\badvanced\s+degree\b/i,
		],
		ambiguous: [/\bm\.?s\.?c?\.?\b/i, /\bm\.?a\.?\b/i],
	},
	{
		level: "Bachelor's",
		safe: [
			/\bbachelor'?s\b/i,
			/\bbachelors\b/i,
			/\bbachelor\s+(?:of|degree)\b/i,
			/\bundergraduate\s+degree\b/i,
			/\b4[\s-]year\s+degree\b/i,
			/\bfour[\s-]year\s+degree\b/i,
		],
		ambiguous: [
			/\bb\.?s\.?c?\.?\b/i,
			/\bb\.?a\.?\b/i,
			/\bb\.?eng\.?\b/i,
		],
	},
	{
		level: "Associate's",
		safe: [
			/\bassociate'?s\b/i,
			/\bassociates\b/i,
			/\bassociate\s+(?:of|degree)\b/i,
			/\b2[\s-]year\s+degree\b/i,
			/\btwo[\s-]year\s+degree\b/i,
		],
		ambiguous: [/\ba\.?a\.?\b/i, /\ba\.?s\.?\b/i],
	},
	{
		level: "High School",
		safe: [
			/\bhigh\s+school\s+diploma\b/i,
			/\bged\b/i,
			/\bsecondary\s+school\s+diploma\b/i,
		],
		ambiguous: [],
	},
]

// Words that make a bare "diploma" mean *high school* level rather than
// a post-secondary/college/technical diploma (Associate's-equivalent).
const HIGH_SCHOOL_DIPLOMA_CONTEXT =
	/\bhigh\s*school\b|\bsecondary\s*school\b|\bged\b|\bhs\s+diploma\b/i

function classifyDiplomaSentence(sentence: string): DegreeLevel {
	return HIGH_SCHOOL_DIPLOMA_CONTEXT.test(sentence)
		? "High School"
		: "Associate's"
}

function normalizeJdText(jdText: string): string {
	return jdText
		.replace(/[\u2018\u2019\u02BC]/g, "'") // curly single quotes -> straight
		.replace(/[\u201C\u201D]/g, '"') // curly double quotes -> straight
		.replace(/[\u2013\u2014]/g, "-") // en/em dash -> hyphen
		.replace(/\u00A0/g, " ") // non-breaking space -> regular space
}

function degreeRank(level: DegreeLevel): number {
	return DEGREE_LEVEL_ORDER.indexOf(level)
}

function highestDegreeLevel(
	levels: Iterable<DegreeLevel>,
): DegreeLevel | null {
	let best: DegreeLevel | null = null
	for (const level of levels) {
		if (best === null || degreeRank(level) < degreeRank(best)) {
			best = level
		}
	}
	return best
}

/**
 * Map free-form education text (JD or resume) to a canonical degree level.
 * Patterns are case-insensitive; punctuation is normalized first.
 */
function classifyDegreeText(
	rawText: string,
	options: { allowAmbiguousWithoutContext?: boolean } = {},
): DegreeLevel | null {
	const text = normalizeJdText(rawText).trim()
	if (!text) return null

	const allowAmbiguousWithoutContext =
		options.allowAmbiguousWithoutContext ?? false

	// Patterns are ordered highest → lowest; first hit wins.
	for (const { level, safe, ambiguous } of DEGREE_PATTERNS) {
		if (safe.some((pattern) => pattern.test(text))) return level
		if (ambiguous.length === 0) continue
		const hasContext = /\bdegree\b|\bdiploma\b/i.test(text)
		if (
			ambiguous.some((pattern) => pattern.test(text)) &&
			(hasContext || allowAmbiguousWithoutContext)
		) {
			return level
		}
	}

	if (/\bdiploma\b/i.test(text)) {
		return classifyDiplomaSentence(text)
	}

	return null
}

/**
 * Extract the single highest degree requirement from a JD.
 * e.g. "Bachelor's or Master's" → "Master's"
 */
function extractDegreeRequirements(jdText: string): DegreeLevel | null {
	if (!jdText) return null

	const text = normalizeJdText(jdText)
	const sentences = text.split(/(?<=[.!?\n])\s*/)
	const found = new Set<DegreeLevel>()

	for (const { level, safe, ambiguous } of DEGREE_PATTERNS) {
		if (safe.some((pattern) => pattern.test(text))) {
			found.add(level)
			continue
		}
		if (ambiguous.length === 0) continue
		for (const sentence of sentences) {
			const hasContext = /\bdegree\b|\bdiploma\b/i.test(sentence)
			if (
				hasContext &&
				ambiguous.some((pattern) => pattern.test(sentence))
			) {
				found.add(level)
				break
			}
		}
	}

	// Bare "diploma" → High School or Associate's from surrounding words.
	for (const sentence of sentences) {
		if (!/\bdiploma\b/i.test(sentence)) continue
		found.add(classifyDiplomaSentence(sentence))
	}

	return highestDegreeLevel(found)
}

/**
 * Score years-of-experience and degree requirements against the resume.
 */
export function scoreQualifications(
  jdText: string,
  appResume: AppResume,
): QualificationResult {
  let score = 100;
  const flags: string[] = [];

  const requiredYears = extractRequiredYears(jdText);
  if (requiredYears !== null) {
    const experienceSection = appResume.sections.find(
      (section) => section.section_type === APP_RESUME_SECTION_TYPE.EXPERIENCE,
    );
    if (experienceSection) {
		const candidateWorkRanges = experienceSection.blocks.map((block) => {
			const content = block.content_json;
			if (block.block_type === "job_entry" && "start_date" in content && "end_date" in content) {
				const startDate = content.start_date ? new Date(content.start_date) : new Date();
				const endDate = content.end_date ? new Date(content.end_date) : new Date();
				return {
					startDate,
					endDate,
					differenceInMonths: differenceInMonths(endDate, startDate),
				};
			}
			return null
		}).filter((range) => range !== null);
      const candidateTotalMonths = candidateWorkRanges.reduce((sum, range) => sum + range.differenceInMonths, 0);
	  const candidateYears = Math.floor(candidateTotalMonths / 12);
      const gap = requiredYears - candidateYears;
      if (gap > 0) {
        const penalty = Math.min(30, Math.ceil(gap) * 10);
        score -= penalty;
        flags.push(
          `Job asks for ~${requiredYears} years; resume shows ~${candidateYears.toFixed(1)} years (−${penalty}).`,
        );
      }
    }
  }

  const requiredDegree = extractDegreeRequirements(jdText)
  if (requiredDegree) {
	const educationSection = appResume.sections.find(
		(section) =>
			section.section_type === APP_RESUME_SECTION_TYPE.EDUCATION,
	)
	const candidateLevels: DegreeLevel[] = []
	if (educationSection) {
		for (const block of educationSection.blocks) {
			const content = block.content_json
			if (
				block.block_type !== "education_entry" ||
				!("degree" in content) ||
				typeof content.degree !== "string"
			) {
				continue
			}
			const level = classifyDegreeText(content.degree, {
				allowAmbiguousWithoutContext: true,
			})
			if (level) candidateLevels.push(level)
		}
	}

	const candidateDegree = highestDegreeLevel(candidateLevels)
	const meetsRequirement =
		candidateDegree !== null &&
		degreeRank(candidateDegree) <= degreeRank(requiredDegree)

	if (!meetsRequirement) {
		const gap = candidateDegree
			? degreeRank(candidateDegree) - degreeRank(requiredDegree)
			: DEGREE_LEVEL_ORDER.length
		const penalty = Math.min(30, Math.max(10, gap * 10))
		score -= penalty
		const candidateLabel = candidateDegree ?? "none detected"
		flags.push(
			`Job asks for ${requiredDegree}+; resume shows ${candidateLabel} (−${penalty}).`,
		)
	}
  }

  return {
    score: clampScore(score),
    flags,
  };
}

function clampScore(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.min(100, Math.max(0, value));
}

/**
 * Combine component scores into a weighted overall ATS score payload.
 */
export function computeOverallScore(
  keywordMatch: number,
  parseability: number,
  qualifications: number,
  missingKeywords: ExtractedKeyword[] = [],
): ATSScoreResult {
  const overallScore = Math.round(
    keywordMatch * 0.45 +
      parseability * 0.2 +
      qualifications * 0.15,
  );

  const suggestions = [...missingKeywords]
    .sort((left, right) => right.weight - left.weight)
    .slice(0, 5)
    .map((keyword) => {
      const section = keyword.isRequired ? "required" : "preferred";
      return `Add '${keyword.term}' — appears ${keyword.frequency}x in the job description's ${section} section`;
    });

  return {
    overallScore: clampScore(overallScore),
    breakdown: {
      keywordMatch: clampScore(keywordMatch),
      parseability: clampScore(parseability),
      qualifications: clampScore(qualifications),
    },
    missingKeywords,
    suggestions,
  };
}

interface SemanticScoreResponse {
  score?: number;
  error?: string;
}

/**
 * Ask the resume-generation edge function for a semantic alignment score.
 * Falls back to 50 on any network/parse failure so the gauge still renders.
 */
export async function getSemanticSimilarity(
  jdText: string,
  resumeText: string,
): Promise<number> {
  try {
    const { data, error } =
      await supabase.functions.invoke<SemanticScoreResponse>(
        "generate-resume",
        {
          body: {
            mode: "ats_semantic_score",
            jdText,
            resumeText,
            prompt:
              'Compare the job description requirements to the resume bullets and return JSON only: { "score": number } where score is 0-100 semantic alignment.',
          },
          headers: env.xsecretkey
            ? {
                "X-Secret-Key": env.xsecretkey,
              }
            : undefined,
        },
      );

    if (error) {
      console.warn(
        "ATS semantic similarity call failed; using fallback 50.",
        error,
      );
      return 50;
    }

    const rawScore = data?.score;
    if (typeof rawScore !== "number" || !Number.isFinite(rawScore)) {
      console.warn(
        "ATS semantic similarity returned invalid payload; using fallback 50.",
        data,
      );
      return 50;
    }

    return clampScore(rawScore);
  } catch (error) {
    console.warn(
      "ATS semantic similarity unexpected error; using fallback 50.",
      error,
    );
    return 50;
  }
}

/**
 * Orchestrate keyword, parseability, qualifications, and semantic scoring.
 */
export async function calculateATSScore(
  jdText: string,
  appResume: AppResume,
  resumeMetadata?: ResumeMetadata,
): Promise<ATSScoreResult> {
	const resumeText = flattenResumeSectionsText(appResume.sections);
  const jdKeywords = extractJDKeywords(jdText);
  console.log("jdKeywords", jdKeywords);
  const qualifications = scoreQualifications(jdText, appResume);
  console.log("qualifications", qualifications);
  const keywordResult = matchKeywords(jdKeywords, resumeText);
  console.log("keywordResult", keywordResult);
  const parseabilityChecks = scoreParseability(resumeText, resumeMetadata);
  console.log("parseabilityChecks", parseabilityChecks);
  const parseability = structuralScore(parseabilityChecks);
  console.log("parseability", parseability);

  const score = computeOverallScore(
    keywordResult.subscore,
    parseability,
    qualifications.score,
    keywordResult.missingKeywords,
  );
  console.log("score", score);

  return score
}
