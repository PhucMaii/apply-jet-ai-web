/**
 * Section patterns, weights, noise phrases, and boost phrases for skill extraction.
 */

/** Section heading patterns (lowercase) and their weight (higher = more important for skills). */
export const SECTION_PATTERNS: Array<{ pattern: RegExp; weight: number }> = [
	{ pattern: /^\s*(requirements?|required qualifications?|must have)\s*$/im, weight: 1.0 },
	{ pattern: /^\s*(qualifications?|minimum qualifications?)\s*$/im, weight: 0.95 },
	{ pattern: /^\s*(preferred qualifications?|nice to have|pluses?)\s*$/im, weight: 0.9 },
	{ pattern: /^\s*(skills?|technical skills?|what you['']ll bring)\s*$/im, weight: 0.92 },
	{ pattern: /^\s*(experience with|proficiency in|knowledge of)\s*$/im, weight: 0.88 },
	{ pattern: /^\s*(responsibilities?|what you['']ll do|key responsibilities?)\s*$/im, weight: 0.6 },
	{ pattern: /^\s*(about the role|the role|overview)\s*$/im, weight: 0.5 },
	{ pattern: /^\s*(about us|company overview|who we are)\s*$/im, weight: 0.2 },
	{ pattern: /^\s*(benefits?|perks?|what we offer)\s*$/im, weight: 0.15 },
	{ pattern: /^\s*(culture|our culture|values?)\s*$/im, weight: 0.1 }
]

/** Default weight when no section is detected. */
export const DEFAULT_SECTION_WEIGHT = 0.5

/** Phrases to exclude from extraction (marketing fluff). */
export const NOISE_PHRASES = new Set([
	"great opportunity", "join our team", "fast-paced environment", "we are looking for",
	"responsible for", "looking for", "exciting opportunity", "dynamic environment",
	"competitive salary", "full time", "part time", "remote", "hybrid", "in office",
	"equal opportunity", "diversity", "inclusive", "passionate about", "love to",
	"team player", "self-starter", "detail oriented", "able to", "willing to",
	"strong communication", "excellent communication", "effective communication", "or equivalent",
	"etc", "e.g", "i.e", "including but not limited to"
])

/** Context phrases that boost confidence when a skill appears near them. */
export const BOOST_PHRASES = [
	/required/i, /must have/i, /preferred/i, /experience with/i, /proficiency in/i,
	/knowledge of/i, /familiarity with/i, /working knowledge/i, /expertise in/i,
	/strong .* (in|with)/i, /demonstrated .* (in|with)/i
]

/** Max phrase length (words) for candidate extraction. */
export const MAX_PHRASE_WORDS = 5

/** Min confidence to include in output. */
export const MIN_CONFIDENCE = 0.3

/** Confidence factors. */
export const CONFIDENCE_EXACT = 0.95
export const CONFIDENCE_ALIAS = 0.88
export const CONFIDENCE_FUZZY = 0.67
export const CONFIDENCE_KEYWORD_UNKNOWN = 0.45
export const CONFIDENCE_BOOST_NEAR = 0.08
