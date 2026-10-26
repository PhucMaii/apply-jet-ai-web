/**
 * Shared craft rules + sanitizers so AI resume text reads like a human CV.
 * No em/en dashes, no AI buzzwords, plain professional wording.
 */

/** Inject into prompts for rewrite / tailor / trial generation. */
export const HUMAN_CV_VOICE_RULES = `HUMAN CV VOICE (non-negotiable)
Write like a careful person drafting their own CV: plain, specific, professional.
Prefer short sentences and concrete verbs (built, led, shipped, cut, designed, ran).

NEVER use em dashes (—) or en dashes (–) in any output text.
Use commas, periods, parentheses, or a plain hyphen only for true compounds
(e.g. full-stack) or date ranges (2020-2023).

Banned AI tells / filler (and close cousins) — delete on sight:
results-driven, proven track record, leverage/leveraging, synergy/synergies,
utilize/utilizing (prefer use), passionate about, dedicated professional,
highly motivated, self-starter, go-getter, spearheaded (prefer led/built/ran),
drove operational excellence, deliver impactful outcomes, paradigm shift,
seamless, robust solution, cutting-edge, innovative thinker, dynamic environment,
fast-paced environments (as filler), excel at communication, team player,
detail-oriented (alone), delve, landscape, testament, underscore, pivotal,
meticulous, foster, elevate, empower, streamline (as fluff), showcase (as fluff),
orchestrated a multi-stakeholder initiative (unless literally true and needed).

Also avoid: stacked adjectives with no proof; identical sentence rhythms;
keyword dumps; upgrading "helped organize" into corporate theater.
If a line would sound embarrassing read aloud in an interview, rewrite it plainer.
Never mention AI, GPT, ChatGPT, LLM, or "generated" wording in resume content.`

/**
 * Strip AI-style dashes and tidy spacing so saved CV text looks human-written.
 */
export function sanitizeHumanResumeText(raw: string): string {
	let text = raw.replace(/\u00a0/g, " ").trim()
	if (!text) return ""

	// Em dash separators → comma
	text = text.replace(/\s*\u2014\s*/g, ", ")
	// En dash between numbers (dates/ranges) → hyphen
	text = text.replace(/(\d)\s*\u2013\s*(\d)/g, "$1-$2")
	// Remaining en dashes → comma
	text = text.replace(/\s*\u2013\s*/g, ", ")
	// Fancy dashes sometimes copied as --
	text = text.replace(/\s+--\s+/g, ", ")

	text = text.replace(/\s+,/g, ",")
	text = text.replace(/,{2,}/g, ",")
	text = text.replace(/,\s*/g, ", ")
	text = text.replace(/\s{2,}/g, " ")
	text = text.replace(/\s+([.;:!?])/g, "$1")

	return text.trim()
}

export function sanitizeHumanResumeStrings(
	value: unknown,
): unknown {
	if (typeof value === "string") return sanitizeHumanResumeText(value)
	if (Array.isArray(value)) {
		return value.map((item) => sanitizeHumanResumeStrings(item))
	}
	if (value && typeof value === "object") {
		const out: Record<string, unknown> = {}
		for (const [key, child] of Object.entries(
			value as Record<string, unknown>,
		)) {
			out[key] = sanitizeHumanResumeStrings(child)
		}
		return out
	}
	return value
}
