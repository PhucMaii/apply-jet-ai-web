import type {
	AppResume,
	AppResumeBlock,
	AppResumeSection,
	AppResumeSectionType,
	AppResumeBlockType,
} from "@/types/app-resume"

export function sortByOrder<T extends { order: number }>(items: T[]): T[] {
	return [...items].sort((a, b) => a.order - b.order)
}

export function flattenAppResumeText(resume: AppResume | null): string {
	if (!resume) return ""
	return sortByOrder(resume.sections)
		.flatMap((section) => {
			const title = section.title?.trim()
			const blocks = sortByOrder(section.blocks)
				.filter((block) => !block.is_hidden && !block.is_removed)
				.map((block) => block.content.trim())
				.filter(Boolean)
			return [title, ...blocks].filter(Boolean) as string[]
		})
		.join("\n")
}

export function extractKeywords(jobDescription: string): string[] {
	const stop = new Set([
		"a", "an", "the", "and", "or", "to", "of", "in", "on", "for", "with",
		"as", "by", "at", "from", "is", "are", "be", "this", "that", "will",
		"our", "you", "your", "we", "us", "their", "have", "has", "can",
	])
	const matches = jobDescription.toLowerCase().match(/[a-z][a-z0-9+.#-]{2,}/g) ?? []
	const counts = new Map<string, number>()
	for (const word of matches) {
		if (stop.has(word)) continue
		counts.set(word, (counts.get(word) ?? 0) + 1)
	}
	return [...counts.entries()]
		.sort((a, b) => b[1] - a[1])
		.slice(0, 24)
		.map(([word]) => word)
}

export function computeKeywordMatch(
	resumeText: string,
	keywords: string[],
): { found: string[]; missing: string[] } {
	const haystack = resumeText.toLowerCase()
	const found: string[] = []
	const missing: string[] = []
	for (const keyword of keywords) {
		if (haystack.includes(keyword.toLowerCase())) found.push(keyword)
		else missing.push(keyword)
	}
	return { found, missing }
}

export function estimateMatchScore(
	resumeText: string,
	jobDescription: string,
): number {
	const keywords = extractKeywords(jobDescription)
	if (keywords.length === 0) return resumeText.trim() ? 55 : 0
	const { found } = computeKeywordMatch(resumeText, keywords)
	const ratio = found.length / keywords.length
	return Math.round(Math.min(95, Math.max(20, ratio * 100)))
}

export function createLocalId(): string {
	if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
		return crypto.randomUUID()
	}
	return `local-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

export function sectionTypeLabel(type: AppResumeSectionType): string {
	switch (type) {
		case "header":
			return "Header"
		case "summary":
			return "Summary"
		case "experience_entry":
			return "Experience"
		case "education_entry":
			return "Education"
		case "skills":
			return "Skills"
		case "projects":
			return "Projects"
		default:
			return "Custom"
	}
}

export function defaultBlockTypeForSection(
	type: AppResumeSectionType,
): AppResumeBlockType {
	switch (type) {
		case "header":
			return "contact_line"
		case "summary":
			return "text"
		case "skills":
			return "bullet"
		case "experience_entry":
		case "projects":
			return "bullet"
		case "education_entry":
			return "heading"
		default:
			return "text"
	}
}

export function mapBlocksByKey(
	resume: AppResume | null,
): Map<string, AppResumeBlock> {
	const map = new Map<string, AppResumeBlock>()
	if (!resume) return map
	for (const section of resume.sections) {
		for (const block of section.blocks) {
			map.set(block.block_key, block)
		}
	}
	return map
}

export function findSectionByKey(
	resume: AppResume | null,
	sectionKey: string,
): AppResumeSection | undefined {
	return resume?.sections.find((section) => section.section_key === sectionKey)
}
