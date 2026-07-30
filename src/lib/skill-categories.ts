import type { UserSkillCategoryRow, UserSkillRow } from "@/types/database"

export const UNCATEGORIZED_CATEGORY_ID = "uncategorized"

export const SUGGESTED_SKILL_CATEGORIES = [
	"Programming Languages",
	"Frameworks & Libraries",
	"Tools & Platforms",
	"Soft Skills",
] as const

export interface SkillCategoryGroup {
	id: string
	name: string
	isUncategorized: boolean
	skills: UserSkillRow[]
}

export function groupSkillsByCategory(
	categories: UserSkillCategoryRow[],
	skills: UserSkillRow[],
): SkillCategoryGroup[] {
	const sortedCategories = [...categories].sort((left, right) =>
		left.name.localeCompare(right.name),
	)

	const groups: SkillCategoryGroup[] = sortedCategories.map((category) => ({
		id: category.id,
		name: category.name,
		isUncategorized: false,
		skills: skills
			.filter((skill) => skill.category_id === category.id)
			.sort((left, right) => left.name.localeCompare(right.name)),
	}))

	const uncategorizedSkills = skills
		.filter((skill) => !skill.category_id)
		.sort((left, right) => left.name.localeCompare(right.name))

	if (uncategorizedSkills.length > 0) {
		groups.push({
			id: UNCATEGORIZED_CATEGORY_ID,
			name: "Uncategorized",
			isUncategorized: true,
			skills: uncategorizedSkills,
		})
	}

	return groups
}

export function collectSkillNames(skills: UserSkillRow[]): Set<string> {
	return new Set(
		skills.map((skill) => skill.name.trim().toLowerCase()).filter(Boolean),
	)
}
