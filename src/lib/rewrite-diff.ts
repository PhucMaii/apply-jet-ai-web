import type { AppResumeBlock } from "@/types/app-resume"
import type { RewriteResumeBlockResult } from "@/types/rewrite-resume-block"

export type RewriteDiffStatus = "unchanged" | "added" | "removed"

export interface RewriteTextSegment {
	id: string
	text: string
	status: RewriteDiffStatus
}

export interface RewriteBulletLine {
	id: string
	text: string
	status: RewriteDiffStatus
}

export interface BlockRewriteDiff {
	blockId: string
	blockType: string
	sectionType: string
	mode: "rewrite" | "generate"
	summary: string
	kind: "text" | "bullets"
	textSegments: RewriteTextSegment[]
	bulletLines: RewriteBulletLine[]
}

function asText(value: unknown): string {
	return typeof value === "string" ? value : ""
}

function asStringList(value: unknown): string[] {
	if (!Array.isArray(value)) return []
	return value
		.map((item) => (typeof item === "string" ? item.trim() : ""))
		.filter(Boolean)
}

function tokenizeWords(text: string): string[] {
	return text.split(/(\s+)/).filter((token) => token.length > 0)
}

/**
 * Word-level LCS diff for prose (summary). Keeps whitespace tokens intact.
 */
export function diffWords(before: string, after: string): RewriteTextSegment[] {
	if (before === after) {
		return before
			? [{ id: "unchanged-0", text: before, status: "unchanged" }]
			: []
	}
	if (!before.trim()) {
		return after
			? [{ id: "added-0", text: after, status: "added" }]
			: []
	}
	if (!after.trim()) {
		return [{ id: "removed-0", text: before, status: "removed" }]
	}

	const a = tokenizeWords(before)
	const b = tokenizeWords(after)
	const n = a.length
	const m = b.length
	const dp: number[][] = Array.from({ length: n + 1 }, () =>
		Array.from({ length: m + 1 }, () => 0),
	)

	for (let i = n - 1; i >= 0; i -= 1) {
		for (let j = m - 1; j >= 0; j -= 1) {
			if (a[i] === b[j]) dp[i][j] = dp[i + 1][j + 1] + 1
			else dp[i][j] = Math.max(dp[i + 1][j], dp[i][j + 1])
		}
	}

	const raw: Array<{ text: string; status: RewriteDiffStatus }> = []
	let i = 0
	let j = 0
	while (i < n && j < m) {
		if (a[i] === b[j]) {
			raw.push({ text: a[i], status: "unchanged" })
			i += 1
			j += 1
		} else if (dp[i + 1][j] >= dp[i][j + 1]) {
			raw.push({ text: a[i], status: "removed" })
			i += 1
		} else {
			raw.push({ text: b[j], status: "added" })
			j += 1
		}
	}
	while (i < n) {
		raw.push({ text: a[i], status: "removed" })
		i += 1
	}
	while (j < m) {
		raw.push({ text: b[j], status: "added" })
		j += 1
	}

	// Merge adjacent same-status tokens for cleaner rendering/debugging.
	const merged: RewriteTextSegment[] = []
	for (const part of raw) {
		const last = merged[merged.length - 1]
		if (last && last.status === part.status) {
			last.text += part.text
		} else {
			merged.push({
				id: `${part.status}-${merged.length}`,
				text: part.text,
				status: part.status,
			})
		}
	}
	return merged
}

/**
 * Build bullet diff lines in a Cursor-like order:
 * removed → added (for rewrites), then added-only, with unchanged kept in place.
 */
export function diffBullets(input: {
	original: string[]
	suggested: string[]
	added?: string[]
	removed?: string[]
	rewritten?: Array<{ from: string; to: string }>
}): RewriteBulletLine[] {
	const addedSet = new Set(input.added ?? [])
	const removedSet = new Set(input.removed ?? [])
	const rewriteByTo = new Map(
		(input.rewritten ?? []).map((item) => [item.to, item.from]),
	)
	const rewriteFromSet = new Set(
		(input.rewritten ?? []).map((item) => item.from),
	)
	const originalSet = new Set(input.original)
	const usedOriginal = new Set<string>()
	const lines: RewriteBulletLine[] = []

	for (const bullet of input.suggested) {
		const from = rewriteByTo.get(bullet)
		if (from) {
			lines.push({
				id: `removed-${lines.length}`,
				text: from,
				status: "removed",
			})
			lines.push({
				id: `added-${lines.length}`,
				text: bullet,
				status: "added",
			})
			usedOriginal.add(from)
			continue
		}

		const isExplicitAdd = addedSet.has(bullet)
		const isNew = !originalSet.has(bullet)
		if (isExplicitAdd || isNew) {
			lines.push({
				id: `added-${lines.length}`,
				text: bullet,
				status: "added",
			})
			continue
		}

		lines.push({
			id: `unchanged-${lines.length}`,
			text: bullet,
			status: "unchanged",
		})
		usedOriginal.add(bullet)
	}

	for (const bullet of input.original) {
		if (usedOriginal.has(bullet)) continue
		if (rewriteFromSet.has(bullet)) continue
		if (removedSet.has(bullet) || !input.suggested.includes(bullet)) {
			lines.push({
				id: `removed-${lines.length}`,
				text: bullet,
				status: "removed",
			})
		}
	}

	return lines
}

export function buildBlockRewriteDiff(input: {
	originalBlock: AppResumeBlock
	suggestion: RewriteResumeBlockResult
	mode?: "rewrite" | "generate"
}): BlockRewriteDiff {
	const { originalBlock, suggestion } = input
	const mode = input.mode ?? "rewrite"
	const summary =
		suggestion.changes.summary?.trim() ||
		(mode === "generate"
			? "Generated a professional summary tailored to this job."
			: "Suggested edits for stronger job-description alignment.")

	if (
		suggestion.blockType === "rich_text" ||
		originalBlock.block_type === "rich_text"
	) {
		const before = asText(
			"text" in originalBlock.content_json
				? originalBlock.content_json.text
				: "",
		)
		const after = asText(suggestion.content_json.text)
		return {
			blockId: suggestion.blockId,
			blockType: suggestion.blockType,
			sectionType: suggestion.sectionType,
			mode,
			summary,
			kind: "text",
			textSegments: diffWords(before, after),
			bulletLines: [],
		}
	}

	const originalBullets = asStringList(
		"description" in originalBlock.content_json
			? originalBlock.content_json.description
			: [],
	)
	const suggestedBullets = asStringList(suggestion.content_json.description)

	return {
		blockId: suggestion.blockId,
		blockType: suggestion.blockType,
		sectionType: suggestion.sectionType,
		mode,
		summary,
		kind: "bullets",
		textSegments: [],
		bulletLines: diffBullets({
			original: originalBullets,
			suggested: suggestedBullets,
			added: suggestion.changes.added_bullets,
			removed: suggestion.changes.removed_bullets,
			rewritten: suggestion.changes.rewritten_bullets,
		}),
	}
}
