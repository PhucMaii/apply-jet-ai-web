/**
 * Types for the job-description skill extraction pipeline.
 */
export interface ExtractedSkillsResult {
  hardSkills: string[];
  softSkills: string[];
  tools: string[];
  qualifications: string[];
  keywords: string[];
  normalizedSkills: string[];
  confidence: Record<string, number>;
}
export interface DetectedSection {
  title: string;
  weight: number;
  startIndex: number;
  endIndex: number;
  content: string;
}
export interface SkillMatch {
  canonical: string;
  raw: string;
  category: SkillCategory;
  confidence: number;
  sectionWeight: number;
  matchType: "exact" | "alias" | "fuzzy";
}
export type SkillCategory =
  | "hardSkills"
  | "softSkills"
  | "tools"
  | "qualifications"
  | "keywords";
export interface SkillDictionaryEntry {
  canonical: string;
  aliases: string[];
  category: SkillCategory;
}

export interface CoverLetter {
  header: CoverLetterHeader;
  recipient: CoverLetterRecipient;
  subject_line: string;
  opening: string;
  body_paragraphs: string[];
  closing: string;
  signature: string;
  keywords_used: string[];
  job_requirements_addressed: string[];
}

export interface CoverLetterHeader {
  full_name: string;
  email: string;
  phone: string;
  location: string;
  links: string[];
  date: string;
}

export interface CoverLetterRecipient {
  company: string;
  hiring_manager: string;
  role_title: string;
}
