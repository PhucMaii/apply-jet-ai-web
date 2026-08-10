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