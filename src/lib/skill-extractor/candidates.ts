/**
 * Extract candidate phrases from section content (n-grams, technical tokens).
 */

import { NOISE_PHRASES } from "./constants";
import { MAX_PHRASE_WORDS } from "./constants";

/** Technical terms that are often single-word or hyphenated (regex to find in text). */
const TECHNICAL_PATTERNS = [
  /\b(?:React|Vue|Angular|Node\.?js|TypeScript|JavaScript|Next\.?js|GraphQL|REST|gRPC)\b/gi,
  /\b(?:AWS|GCP|Azure|SQL|NoSQL|API|APIs|CI\/CD|Docker|Kubernetes|K8s|Terraform|Jenkins)\b/gi,
  /\b(?:Python|Java|Go|Rust|Ruby|PHP|Swift|Kotlin|C\+\+|C#|\.NET|Scala)\b/gi,
  /\b(?:PostgreSQL|MongoDB|Redis|MySQL|Elasticsearch|Databricks|Snowflake)\b/gi,
  /\b(?:Git|GitHub|Jira|Figma|Slack|Salesforce|Tableau|Looker)\b/gi,
  /\b(?:SaaS|REST|GraphQL|Redux|Webpack|Agile|Scrum)\b/gi,
  /\b(?:end-to-end|problem-solving|cross-functional|front-end|back-end|full-stack)\b/gi,
  /\b(?:machine learning|data analysis|stakeholder management|product management)\b/gi,
];

export interface CandidateWithWeight {
  phrase: string;
  sectionWeight: number;
}

/**
 * Extract candidate phrases from section content.
 * Returns deduplicated lowercase phrases with section weight.
 */
export function extractCandidates(
  content: string,
  sectionWeight: number,
): CandidateWithWeight[] {
  const seen = new Set<string>();
  const candidates: CandidateWithWeight[] = [];

  // 1. Technical patterns (preserve original casing for matching)
  for (const re of TECHNICAL_PATTERNS) {
    let m: RegExpExecArray | null;
    const copy = new RegExp(re.source, re.flags);
    while ((m = copy.exec(content)) !== null) {
      const phrase = m[0].trim();
      const key = phrase.toLowerCase();
      if (phrase.length >= 2 && !NOISE_PHRASES.has(key) && !seen.has(key)) {
        seen.add(key);
        candidates.push({ phrase, sectionWeight });
      }
    }
  }

  // 2. Word n-grams (1 to MAX_PHRASE_WORDS) from cleaned text
  const words = content.split(/[\s,;:()\[\]\/\-]+/).filter((w) => w.length > 1);
  for (let n = 1; n <= MAX_PHRASE_WORDS && n <= words.length; n++) {
    for (let i = 0; i <= words.length - n; i++) {
      const phrase = words
        .slice(i, i + n)
        .join(" ")
        .trim();
      const key = phrase.toLowerCase();
      if (phrase.length >= 2 && !NOISE_PHRASES.has(key) && !seen.has(key)) {
        seen.add(key);
        candidates.push({ phrase, sectionWeight });
      }
    }
  }

  return candidates;
}
