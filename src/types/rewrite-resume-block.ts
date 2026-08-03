export interface RewriteBulletChange {
	from: string
	to: string
}

export interface RewriteChanges {
	summary: string
	added_bullets?: string[]
	removed_bullets?: string[]
	rewritten_bullets?: RewriteBulletChange[]
}

export interface RewriteResumeBlockResult {
	blockId: string
	blockType: string
	sectionType: string
	content_json: Record<string, unknown>
	changes: RewriteChanges
}

export const REWRITE_SUPPORTED_BLOCK_TYPES = [
	"rich_text",
	"job_entry",
] as const

export type RewriteSupportedBlockType =
	(typeof REWRITE_SUPPORTED_BLOCK_TYPES)[number]

export function isRewriteSupportedBlockType(
	blockType: string,
): blockType is RewriteSupportedBlockType {
	return REWRITE_SUPPORTED_BLOCK_TYPES.includes(
		blockType as RewriteSupportedBlockType,
	)
}
