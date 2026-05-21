/**
 * Match candidates against the skill dictionary (exact, alias, fuzzy) and score confidence.
 */

import type { SkillCategory, SkillMatch } from "@/lib/skill-extractor/type"
import { lookupSkill } from "@/lib/skill-extractor/dictionary"
import { BOOST_PHRASES, CONFIDENCE_EXACT, CONFIDENCE_ALIAS, CONFIDENCE_BOOST_NEAR, CONFIDENCE_KEYWORD_UNKNOWN, MIN_CONFIDENCE } from "./constants"
import type { CandidateWithWeight } from "./candidates"

/**
 * Simple fuzzy: phrase is contained in or contains a dictionary term (for close variants).
 */
function fuzzyMatch(phrase: string): { canonical: string; category: SkillCategory } | null {
	const key = phrase.toLowerCase().trim()
	const exact = lookupSkill(key)
	if (exact) return exact
	// Try without trailing 's' or common suffixes
	const base = key.replace(/\s*(?:skills?|experience|knowledge|proficiency)\s*$/i, "").trim()
	if (base !== key) {
		const found = lookupSkill(base)
		if (found) return found
	}
	return null
}

/**
 * Check if phrase appears near a boost phrase in the full context (optional).
 */
function getBoost(context: string, phrase: string): number {
	const lower = context.toLowerCase()
	const idx = lower.indexOf(phrase.toLowerCase())
	if (idx === -1) return 0
	const window = lower.slice(Math.max(0, idx - 80), idx + phrase.length + 80)
	return BOOST_PHRASES.some((re) => re.test(window)) ? CONFIDENCE_BOOST_NEAR : 0
}

/**
 * Match a candidate and return SkillMatch or null if below threshold.
 */
export function matchCandidate(
	candidate: CandidateWithWeight,
	context: string
): SkillMatch | null {
	const { phrase, sectionWeight } = candidate
	const trimmed = phrase.trim()
	if (!trimmed || trimmed.length < 2) return null

	const exact = lookupSkill(trimmed)
	if (exact) {
		let conf = CONFIDENCE_EXACT * sectionWeight
		conf += getBoost(context, trimmed)
		conf = Math.min(1, conf)
		if (conf < MIN_CONFIDENCE) return null
		return {
			canonical: exact.canonical,
			raw: trimmed,
			category: exact.category,
			confidence: conf,
			sectionWeight,
			matchType: "exact"
		}
	}

	const fuzzy = fuzzyMatch(trimmed)
	if (fuzzy) {
		let conf = CONFIDENCE_ALIAS * sectionWeight
		conf += getBoost(context, trimmed)
		conf = Math.min(1, conf)
		if (conf < MIN_CONFIDENCE) return null
		return {
			canonical: fuzzy.canonical,
			raw: trimmed,
			category: fuzzy.category,
			confidence: conf,
			sectionWeight,
			matchType: "alias"
		}
	}

	// Unknown phrase: keep as keyword if it looks skill-like (no generic words, 2+ chars)
	const wordCount = trimmed.split(/\s+/).length
	const looksSkill = wordCount <= 3 && /[a-z0-9+#.]/i.test(trimmed)
	if (looksSkill) {
		let conf = CONFIDENCE_KEYWORD_UNKNOWN * sectionWeight
		conf += getBoost(context, trimmed)
		conf = Math.min(1, conf)
		if (conf < MIN_CONFIDENCE) return null
		return {
			canonical: trimmed,
			raw: trimmed,
			category: "keywords",
			confidence: conf,
			sectionWeight,
			matchType: "fuzzy"
		}
	}
	return null
}
