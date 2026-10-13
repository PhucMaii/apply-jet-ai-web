import { stringListValue } from "@/components/applications/resume-builder/app-resume-utils"
import type { ExtractedKeyword } from "@/lib/atsScoring"
import { SUGGESTED_SKILL_CATEGORIES } from "@/lib/skill-categories"
import { supabase } from "@/lib/supabase"
import type { AppResumeBlock, AppResumeSection } from "@/types/app-resume"

export const KEYWORD_SKILL_CATEGORY_BY_TYPE = {
	hard_skill: "Technical Skills",
	tool: "Tools & Platforms",
	soft_skill: "Soft Skills",
	certification: "Certifications",
	responsibility: "Skills",
} as const satisfies Record<ExtractedKeyword["category"], string>

export const ADDABLE_KEYWORD_CATEGORIES = new Set<
	ExtractedKeyword["category"]
>(["hard_skill", "tool", "soft_skill", "certification"])

const DEFAULT_SKILL_CATEGORY_NAME = SUGGESTED_SKILL_CATEGORIES[2]

export function normalizeSkillName(value: string): string {
	return value.trim().toLowerCase()
}

export function preferredCategoryNameForKeyword(
	keyword: Pick<ExtractedKeyword, "category">,
): string {
	return KEYWORD_SKILL_CATEGORY_BY_TYPE[keyword.category]
}

export function collectResumeSkillNames(
	sections: AppResumeSection[],
): Set<string> {
	const names = new Set<string>()

	for (const section of sections) {
		for (const block of section.blocks) {
			const content = block.content_json
			if (block.block_type === "skill_category_entry" && "skills" in content) {
				for (const skill of stringListValue(content.skills)) {
					names.add(normalizeSkillName(skill))
				}
			}
			if (block.block_type === "skill_entry" && "name" in content) {
				const name = typeof content.name === "string" ? content.name : ""
				if (name.trim()) names.add(normalizeSkillName(name))
			}
		}
	}

	return names
}

export function listSkillCategoryBlocks(
	sections: AppResumeSection[],
): AppResumeBlock[] {
	return sections
		.filter((section) => section.section_type === "skills")
		.flatMap((section) =>
			section.blocks.filter(
				(block) => block.block_type === "skill_category_entry",
			),
		)
}

export function findSkillCategoryBlock(
	sections: AppResumeSection[],
	preferredName: string,
): AppResumeBlock | null {
	const preferredKey = normalizeSkillName(preferredName)
	const categoryBlocks = listSkillCategoryBlocks(sections)

	return (
		categoryBlocks.find((block) => {
			const content = block.content_json
			if (!("name" in content)) return false
			return normalizeSkillName(String(content.name ?? "")) === preferredKey
		}) ?? null
	)
}

export function withSkillAddedToCategoryBlock(
	block: AppResumeBlock,
	skillName: string,
	categoryName?: string,
): AppResumeBlock {
	const content = block.content_json
	if (block.block_type !== "skill_category_entry" || !("skills" in content)) {
		return block
	}

	const existing = stringListValue(content.skills)
	const alreadyHas = existing.some(
		(skill) => normalizeSkillName(skill) === normalizeSkillName(skillName),
	)
	const nextSkills = alreadyHas ? existing : [...existing, skillName.trim()]

	return {
		...block,
		content_json: {
			...content,
			name: categoryName?.trim() || content.name,
			skills: nextSkills,
		},
		updated_at: new Date().toISOString(),
	}
}

/**
 * Ensures the skill exists on the user's profile under a matching category
 * so future application resumes can inherit it.
 */
export async function ensureUserSkillSaved(input: {
	userId: string
	skillName: string
	categoryName: string
}): Promise<{ created: boolean; alreadyOwned: boolean }> {
	const skillName = input.skillName.trim()
	const categoryName =
		input.categoryName.trim() || DEFAULT_SKILL_CATEGORY_NAME
	if (!skillName) {
		return { created: false, alreadyOwned: false }
	}

	const { data: existingSkills, error: skillsError } = await supabase
		.from("user_skills")
		.select("id, name")
		.eq("user_id", input.userId)

	if (skillsError) {
		console.error(
			"Something went wrong loading user skills:",
			skillsError,
		)
		throw new Error(skillsError.message)
	}

	const alreadyOwned = (existingSkills ?? []).some(
		(skill) => normalizeSkillName(skill.name) === normalizeSkillName(skillName),
	)
	if (alreadyOwned) {
		return { created: false, alreadyOwned: true }
	}

	const { data: categories, error: categoriesError } = await supabase
		.from("user_skill_categories")
		.select("id, name")
		.eq("user_id", input.userId)

	if (categoriesError) {
		console.error(
			"Something went wrong loading skill categories:",
			categoriesError,
		)
		throw new Error(categoriesError.message)
	}

	let categoryId =
		(categories ?? []).find(
			(category) =>
				normalizeSkillName(category.name) ===
				normalizeSkillName(categoryName),
		)?.id ?? null

	if (!categoryId) {
		const { data: createdCategory, error: createCategoryError } =
			await supabase
				.from("user_skill_categories")
				.insert({
					user_id: input.userId,
					name: categoryName,
				})
				.select("id")
				.single()

		if (createCategoryError || !createdCategory) {
			console.error(
				"Something went wrong creating skill category:",
				createCategoryError,
			)
			throw new Error(
				createCategoryError?.message ?? "Failed to create skill category",
			)
		}
		categoryId = createdCategory.id
	}

	const { error: insertError } = await supabase.from("user_skills").insert({
		user_id: input.userId,
		name: skillName,
		category_id: categoryId,
		is_from_org_resume: false,
	})

	if (insertError) {
		console.error("Something went wrong saving user skill:", insertError)
		throw new Error(insertError.message)
	}

	return { created: true, alreadyOwned: false }
}
