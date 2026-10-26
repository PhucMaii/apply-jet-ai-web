import { supabase } from "@/lib/supabase"
import { getInsertableSuggestion } from "@/types/tailor-feedback"
import type {
	TailorFeedbackItem,
	TailorFeedbackPayload,
} from "@/types/tailor-feedback"
import type { AppResumeBlock, AppResumeBlockContent } from "@/types/app-resume"

function stringList(value: unknown): string[] {
	if (!Array.isArray(value)) return []
	return value
		.map((item) => (typeof item === "string" ? item : ""))
		.filter(Boolean)
}

function markFeedbackApplied(
	feedback: TailorFeedbackPayload,
	itemId: string,
): TailorFeedbackPayload {
	return {
		...feedback,
		items: feedback.items.map((item) =>
			item.id === itemId ? { ...item, status: "applied" } : item,
		),
	}
}

async function persistBlockAndFeedback(input: {
	block: AppResumeBlock
	feedback: TailorFeedbackPayload
	userId: string
	applicationId: string
}): Promise<{ block: AppResumeBlock; feedback: TailorFeedbackPayload }> {
	const { error: updateError } = await supabase
		.from("app_resume_blocks")
		.update({
			content_json: input.block.content_json,
			updated_at: input.block.updated_at,
		})
		.eq("id", input.block.id)

	if (updateError) {
		console.error(
			"Something went wrong saving feedback suggestion:",
			updateError,
		)
		throw new Error(updateError.message)
	}

	const { error: feedbackError } = await supabase
		.from("applications")
		.update({
			tailor_feedback: input.feedback,
			updated_at: new Date().toISOString(),
		})
		.eq("id", input.applicationId)
		.eq("user_id", input.userId)

	if (feedbackError) {
		console.error(
			"Something went wrong saving tailor feedback status:",
			feedbackError,
		)
	}

	return { block: input.block, feedback: input.feedback }
}

function applyToDescriptionBullets(
	content: AppResumeBlockContent,
	quote: string,
	suggestion: string,
): AppResumeBlockContent {
	if (!("description" in content)) {
		throw new Error("This section has no bullets to update.")
	}

	const bullets = stringList(content.description)
	const targetIndex = quote
		? bullets.findIndex((bullet) =>
				bullet.toLowerCase().includes(quote.toLowerCase()),
			)
		: -1

	const nextBullets =
		targetIndex >= 0
			? bullets.map((bullet, index) =>
					index === targetIndex ? suggestion : bullet,
				)
			: [...bullets, suggestion]

	return {
		...content,
		description: nextBullets,
	}
}

function applyToRichText(
	content: AppResumeBlockContent,
	quote: string,
	suggestion: string,
): AppResumeBlockContent {
	if (!("text" in content) || typeof content.text !== "string") {
		throw new Error("This section has no summary text to update.")
	}

	if (quote && content.text.includes(quote)) {
		return {
			...content,
			text: content.text.replace(quote, suggestion),
		}
	}

	return {
		...content,
		text: suggestion,
	}
}

function applyToSkillCategory(
	content: AppResumeBlockContent,
	suggestion: string,
): AppResumeBlockContent {
	if (!("skills" in content)) {
		throw new Error("This section has no skills list to update.")
	}

	const skills = stringList(content.skills)
	const key = suggestion.trim().toLowerCase()
	const alreadyHas = skills.some(
		(skill) => skill.trim().toLowerCase() === key,
	)
	if (alreadyHas) {
		return content
	}

	return {
		...content,
		skills: [...skills, suggestion.trim()],
	}
}

function applyToBulletList(
	content: AppResumeBlockContent,
	quote: string,
	suggestion: string,
): AppResumeBlockContent {
	if (!("items" in content)) {
		throw new Error("This section has no list items to update.")
	}

	const items = stringList(content.items)
	const targetIndex = quote
		? items.findIndex((item) =>
				item.toLowerCase().includes(quote.toLowerCase()),
			)
		: -1

	const nextItems =
		targetIndex >= 0
			? items.map((item, index) =>
					index === targetIndex ? suggestion : item,
				)
			: [...items, suggestion]

	return {
		...content,
		items: nextItems,
	}
}

/**
 * One-click insert of the feedback suggestion into the linked resume block.
 */
export async function applySuggestionToFeedbackItem(input: {
	item: TailorFeedbackItem
	userId: string
	applicationId: string
	feedback: TailorFeedbackPayload
}): Promise<{ block: AppResumeBlock; feedback: TailorFeedbackPayload }> {
	const suggestion = getInsertableSuggestion(input.item)
	if (!suggestion) {
		throw new Error("This note has no insertable suggestion.")
	}
	if (!input.item.blockId) {
		throw new Error("This note is not linked to a resume section.")
	}

	const { data: block, error: blockError } = await supabase
		.from("app_resume_blocks")
		.select("*")
		.eq("id", input.item.blockId)
		.single()

	if (blockError || !block) {
		console.error(
			"Something went wrong loading block for feedback:",
			blockError,
		)
		throw new Error("Could not find that resume section.")
	}

	const typed = block as AppResumeBlock
	const quote = input.item.quote?.trim() ?? ""
	let nextContent: AppResumeBlockContent

	switch (typed.block_type) {
		case "job_entry":
		case "project_entry":
			nextContent = applyToDescriptionBullets(
				typed.content_json,
				quote,
				suggestion,
			)
			break
		case "rich_text":
			nextContent = applyToRichText(typed.content_json, quote, suggestion)
			break
		case "skill_category_entry":
			nextContent = applyToSkillCategory(typed.content_json, suggestion)
			break
		case "bullet_list":
			nextContent = applyToBulletList(
				typed.content_json,
				quote,
				suggestion,
			)
			break
		default:
			throw new Error(
				"This note can’t be inserted into that section type automatically.",
			)
	}

	const nextBlock: AppResumeBlock = {
		...typed,
		content_json: nextContent,
		updated_at: new Date().toISOString(),
	}
	const nextFeedback = markFeedbackApplied(input.feedback, input.item.id)

	return persistBlockAndFeedback({
		block: nextBlock,
		feedback: nextFeedback,
		userId: input.userId,
		applicationId: input.applicationId,
	})
}

/** @deprecated Use applySuggestionToFeedbackItem */
export async function applyMetricToFeedbackItem(input: {
	item: TailorFeedbackItem
	metric: string
	userId: string
	applicationId: string
	feedback: TailorFeedbackPayload
}): Promise<{ block: AppResumeBlock; feedback: TailorFeedbackPayload }> {
	return applySuggestionToFeedbackItem({
		item: {
			...input.item,
			suggestion: input.metric,
		},
		userId: input.userId,
		applicationId: input.applicationId,
		feedback: input.feedback,
	})
}

export async function dismissTailorFeedbackItem(input: {
	itemId: string
	userId: string
	applicationId: string
	feedback: TailorFeedbackPayload
}): Promise<TailorFeedbackPayload> {
	const nextFeedback: TailorFeedbackPayload = {
		...input.feedback,
		items: input.feedback.items.map((item) =>
			item.id === input.itemId ? { ...item, status: "dismissed" } : item,
		),
	}

	const { error } = await supabase
		.from("applications")
		.update({
			tailor_feedback: nextFeedback,
			updated_at: new Date().toISOString(),
		})
		.eq("id", input.applicationId)
		.eq("user_id", input.userId)

	if (error) {
		console.error("Something went wrong dismissing tailor feedback:", error)
		throw new Error(error.message)
	}

	return nextFeedback
}
