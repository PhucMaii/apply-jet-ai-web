export type TailorFeedbackKind =
	| "add_metric"
	| "replace_claim"
	| "strengthen_summary"
	| "add_missing_proof"
	| "writing_tip"

export type TailorFeedbackItemStatus = "open" | "dismissed" | "applied"

export interface TailorFeedbackItem {
	id: string
	kind: TailorFeedbackKind
	sectionType: "summary" | "experience" | "skills" | "general"
	blockId: string | null
	title: string
	message: string
	quote: string | null
	/** Ready-to-insert text shown as preview and applied on one click. */
	suggestion: string | null
	/** @deprecated Prefer suggestion; kept for older stored feedback rows. */
	example: string | null
	status: TailorFeedbackItemStatus
}

export interface TailorFeedbackPayload {
	items: TailorFeedbackItem[]
	generatedAt: string
}

export function isTailorFeedbackPayload(
	value: unknown,
): value is TailorFeedbackPayload {
	if (!value || typeof value !== "object") return false
	const row = value as TailorFeedbackPayload
	return Array.isArray(row.items)
}

/** Prefer suggestion; fall back to example for older feedback payloads. */
export function getInsertableSuggestion(
	item: Pick<TailorFeedbackItem, "suggestion" | "example">,
): string | null {
	const suggestion = item.suggestion?.trim()
	if (suggestion) return suggestion
	const example = item.example?.trim()
	return example || null
}
