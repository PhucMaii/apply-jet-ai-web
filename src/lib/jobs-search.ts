const JOB_SEARCH_STOP_WORDS = new Set([
	"a",
	"an",
	"and",
	"or",
	"the",
	"of",
	"for",
	"to",
	"in",
	"on",
	"at",
	"by",
	"with",
	"from",
	"as",
	"is",
	"are",
	"be",
	"job",
	"jobs",
	"role",
	"roles",
])

const MAX_SEARCH_TOKENS = 6
const MIN_TOKEN_LENGTH = 2

/**
 * Split a job search into meaningful tokens.
 * "Software Developer" → ["software", "developer"]
 */
export function tokenizeJobSearch(query: string): string[] {
	const seen = new Set<string>()
	const tokens: string[] = []

	for (const raw of query.toLowerCase().split(/[^a-z0-9+#.]/i)) {
		const token = raw.trim()
		if (token.length < MIN_TOKEN_LENGTH) continue
		if (JOB_SEARCH_STOP_WORDS.has(token)) continue
		if (seen.has(token)) continue
		seen.add(token)
		tokens.push(token)
		if (tokens.length >= MAX_SEARCH_TOKENS) break
	}

	return tokens
}
