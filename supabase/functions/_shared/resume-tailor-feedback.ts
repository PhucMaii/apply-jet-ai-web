/**
 * Mentor-style resume review after tailor rewrites.
 * Asks for real metrics / missing proof instead of inventing them.
 */

import {
	HUMAN_CV_VOICE_RULES,
	sanitizeHumanResumeText,
} from "./humanize-resume-text.ts"

// deno-lint-ignore no-explicit-any
type SupabaseClient = any

export type TailorFeedbackKind =
	| "add_metric"
	| "replace_claim"
	| "strengthen_summary"
	| "add_missing_proof"
	| "writing_tip"

export interface TailorFeedbackItem {
	id: string
	kind: TailorFeedbackKind
	sectionType: "summary" | "experience" | "skills" | "general"
	blockId: string | null
	title: string
	message: string
	quote: string | null
	/** Exact text the UI inserts on one click. */
	suggestion: string | null
	example: string | null
	status: "open" | "dismissed" | "applied"
}

export interface TailorFeedbackPayload {
	items: TailorFeedbackItem[]
	generatedAt: string
}

const GEMINI_PRIMARY_MODEL = "gemini-3.8-flash"
const GEMINI_FAILOVER_MODEL = "gemini-3.1-flash-lite"

function geminiUrl(model: string, apiKey: string) {
	return `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`
}

function sleep(ms: number) {
	return new Promise((resolve) => setTimeout(resolve, ms))
}

function newId() {
	return crypto.randomUUID()
}

function buildReviewPrompt(jdText: string, resumeContext: unknown): string {
	return `You are a senior hiring mentor reviewing a resume against one job posting.
Tone: direct, warm, specific, like a sharp colleague giving feedback after work. Not corporate. Not AI-hype.

<job_description>
${jdText}
</job_description>

<resume>
${JSON.stringify(resumeContext)}
</resume>

Write 3-6 concrete feedback items. Prefer quality over quantity.

${HUMAN_CV_VOICE_RULES}

RULES
1. Never invent employers, tools, or projects the resume does not already support.
2. Every item MUST include a ready-to-insert "suggestion" the UI can apply in one click.
3. "suggestion" must be the exact replacement text, written as human CV copy:
   - experience/project: one full bullet (or the rewritten bullet)
   - summary: the improved summary sentence/paragraph fragment to use
   - skills: one skill name to add
4. Prefer rewriting with grounded facts. If a metric is unknown, strengthen the line with real tools/scope already on the resume. Do NOT invent fake percentages.
5. Always set blockId to the exact target block id from <resume>.
6. "quote" should be the exact substring/bullet phrase being replaced when applicable (so the UI can find it).
7. Suggestions and messages must follow HUMAN CV VOICE. No em dashes, no en dashes, no AI buzzwords.

OUTPUT: return ONLY valid JSON:
{
  "items": [
    {
      "kind": "add_metric" | "replace_claim" | "strengthen_summary" | "add_missing_proof" | "writing_tip",
      "sectionType": "summary" | "experience" | "skills" | "general",
      "blockId": "exact block id from resume",
      "title": "short label, max 8 words",
      "message": "2-4 sentences of mentor feedback",
      "quote": "exact phrase/bullet from the resume to replace, or null",
      "suggestion": "exact text to insert on one click"
    }
  ]
}`
}

async function callGeminiJson(
	apiKey: string,
	prompt: string,
): Promise<Record<string, unknown> | null> {
	const body = JSON.stringify({
		contents: [{ role: "user", parts: [{ text: prompt }] }],
		generationConfig: {
			temperature: 0.3,
			maxOutputTokens: 4096,
			responseMimeType: "application/json",
		},
	})

	for (const model of [GEMINI_PRIMARY_MODEL, GEMINI_FAILOVER_MODEL]) {
		for (let attempt = 0; attempt < 2; attempt++) {
			if (attempt > 0) await sleep(400 * 2 ** attempt)
			try {
				const response = await fetch(geminiUrl(model, apiKey), {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body,
				})
				if (!response.ok) {
					const details = await response.text()
					console.error("Something went wrong calling Gemini for feedback:", {
						model,
						attempt,
						status: response.status,
						details,
					})
					if (response.status === 429 || response.status >= 500) continue
					break
				}
				const payload = await response.json()
				const text =
					payload?.candidates?.[0]?.content?.parts
						?.map((part: { text?: string }) => part.text ?? "")
						.join("") ?? ""
				if (!text.trim()) continue
				return JSON.parse(text) as Record<string, unknown>
			} catch (error) {
				console.error("Something went wrong parsing Gemini feedback:", error)
			}
		}
	}
	return null
}

function normalizeItems(
	raw: unknown,
	validBlockIds: Set<string>,
): TailorFeedbackItem[] {
	if (!raw || typeof raw !== "object") return []
	const items = (raw as { items?: unknown }).items
	if (!Array.isArray(items)) return []

	const kinds = new Set<TailorFeedbackKind>([
		"add_metric",
		"replace_claim",
		"strengthen_summary",
		"add_missing_proof",
		"writing_tip",
	])
	const sections = new Set([
		"summary",
		"experience",
		"skills",
		"general",
	])

	const normalized: TailorFeedbackItem[] = []
	for (const item of items.slice(0, 8)) {
		if (!item || typeof item !== "object") continue
		const row = item as Record<string, unknown>
		const kind = typeof row.kind === "string" ? row.kind : ""
		const sectionType =
			typeof row.sectionType === "string" ? row.sectionType : "general"
		const title =
			typeof row.title === "string"
				? sanitizeHumanResumeText(row.title)
				: ""
		const message =
			typeof row.message === "string"
				? sanitizeHumanResumeText(row.message)
				: ""
		const suggestionRaw =
			typeof row.suggestion === "string"
				? sanitizeHumanResumeText(row.suggestion)
				: typeof row.example === "string"
					? sanitizeHumanResumeText(row.example)
					: ""
		if (!kinds.has(kind as TailorFeedbackKind) || !title || !message) continue
		if (!sections.has(sectionType)) continue
		if (!suggestionRaw) continue

		let blockId: string | null =
			typeof row.blockId === "string" && row.blockId.trim()
				? row.blockId.trim()
				: null
		if (blockId && !validBlockIds.has(blockId)) blockId = null
		// Skip notes we can't one-click insert.
		if (!blockId) continue

		normalized.push({
			id: newId(),
			kind: kind as TailorFeedbackKind,
			sectionType: sectionType as TailorFeedbackItem["sectionType"],
			blockId,
			title: title.slice(0, 80),
			message: message.slice(0, 600),
			quote:
				typeof row.quote === "string" && row.quote.trim()
					? row.quote.trim().slice(0, 240)
					: null,
			suggestion: suggestionRaw.slice(0, 500),
			example: suggestionRaw.slice(0, 500),
			status: "open",
		})
	}
	return normalized
}

export async function generateTailorFeedback(input: {
	supabase: SupabaseClient
	appResumeId: string
	jdText: string
	apiKey: string
}): Promise<TailorFeedbackPayload | null> {
	const { data: sections, error: sectionsError } = await input.supabase
		.from("app_resume_sections")
		.select("id, display_name, section_type, sort_key")
		.eq("app_resume_id", input.appResumeId)
		.order("sort_key", { ascending: true })

	if (sectionsError) {
		console.error(
			"Something went wrong loading sections for feedback:",
			sectionsError,
		)
		return null
	}

	const { data: blocks, error: blocksError } = await input.supabase
		.from("app_resume_blocks")
		.select("id, block_type, content_json, section_id, sort_key")
		.eq("app_resume_id", input.appResumeId)
		.order("sort_key", { ascending: true })

	if (blocksError) {
		console.error(
			"Something went wrong loading blocks for feedback:",
			blocksError,
		)
		return null
	}

	const validBlockIds = new Set(
		(blocks ?? []).map((block: { id: string }) => block.id),
	)

	const resumeContext = (sections ?? []).map(
		(section: {
			id: string
			display_name: string
			section_type: string
			sort_key: number
		}) => ({
			id: section.id,
			display_name: section.display_name,
			section_type: section.section_type,
			blocks: (blocks ?? [])
				.filter(
					(block: { section_id: string }) => block.section_id === section.id,
				)
				.map(
					(block: {
						id: string
						block_type: string
						content_json: unknown
						sort_key: number
					}) => ({
						id: block.id,
						block_type: block.block_type,
						sort_key: block.sort_key,
						content_json: block.content_json,
					}),
				),
		}),
	)

	const parsed = await callGeminiJson(
		input.apiKey,
		buildReviewPrompt(input.jdText, resumeContext),
	)
	if (!parsed) return null

	const items = normalizeItems(parsed, validBlockIds)
	if (items.length === 0) return null

	return {
		items,
		generatedAt: new Date().toISOString(),
	}
}

/** After skill rewrites, remove the same skill appearing in multiple categories. */
export async function dedupeSkillsAcrossResume(
	supabase: SupabaseClient,
	appResumeId: string,
): Promise<void> {
	const { data: sections } = await supabase
		.from("app_resume_sections")
		.select("id")
		.eq("app_resume_id", appResumeId)
		.eq("section_type", "skills")

	const sectionIds = (sections ?? []).map((section: { id: string }) => section.id)
	if (sectionIds.length === 0) return

	const { data: blocks, error } = await supabase
		.from("app_resume_blocks")
		.select("id, content_json, sort_key")
		.in("section_id", sectionIds)
		.eq("block_type", "skill_category_entry")
		.order("sort_key", { ascending: true })

	if (error || !blocks?.length) {
		if (error) {
			console.error("Something went wrong loading skills for dedupe:", error)
		}
		return
	}

	const seen = new Set<string>()
	for (const block of blocks) {
		const content =
			block.content_json && typeof block.content_json === "object"
				? (block.content_json as Record<string, unknown>)
				: {}
		const rawSkills = Array.isArray(content.skills) ? content.skills : []
		const nextSkills: string[] = []
		for (const skill of rawSkills) {
			if (typeof skill !== "string") continue
			const trimmed = skill.trim()
			const key = trimmed.toLowerCase().replace(/\s+/g, " ")
			if (!key || seen.has(key)) continue
			seen.add(key)
			nextSkills.push(trimmed)
		}

		const previous = rawSkills
			.filter((skill: unknown) => typeof skill === "string")
			.map((skill: string) => skill.trim())
		const changed =
			previous.length !== nextSkills.length ||
			previous.some(
				(skill: string, index: number) => skill !== nextSkills[index],
			)
		if (!changed) continue

		const { error: updateError } = await supabase
			.from("app_resume_blocks")
			.update({
				content_json: { ...content, skills: nextSkills },
				updated_at: new Date().toISOString(),
			})
			.eq("id", block.id)

		if (updateError) {
			console.error(
				"Something went wrong saving deduped skills:",
				updateError,
			)
		}
	}
}
