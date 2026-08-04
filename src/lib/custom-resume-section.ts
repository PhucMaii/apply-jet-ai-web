import type {
	AppResumeBlockContent,
	AppResumeBlockStyle,
	AppResumeBlockType,
	CustomSectionBlockType,
} from "@/types/app-resume"

export const CUSTOM_SECTION_BLOCK_OPTIONS: Array<{
	value: CustomSectionBlockType
	label: string
	description: string
}> = [
	{
		value: "education_entry",
		label: "Education entry",
		description: "School, degree, and dates",
	},
	{
		value: "bullet_list",
		label: "Bullet list",
		description: "A list of bullet points",
	},
	{
		value: "job_entry",
		label: "Experience entry",
		description: "Title, company, dates, and bullets",
	},
	{
		value: "rich_text",
		label: "Rich text",
		description: "A free-form paragraph",
	},
	{
		value: "skill_category_entry",
		label: "Skills entry",
		description: "Category name with comma-separated skills",
	},
]

const DEFAULT_BODY_STYLE: AppResumeBlockStyle = {
	color: "black",
	fontSize: 12,
}

const DEFAULT_ENTRY_STYLE: AppResumeBlockStyle = {
	color: "black",
	fontSize: 12,
	headerLayout: "inline",
}

export function defaultContentForCustomBlock(
	blockType: CustomSectionBlockType,
): AppResumeBlockContent {
	switch (blockType) {
		case "education_entry":
			return {
				school: "",
				degree: "",
				start_date: null,
				end_date: null,
			}
		case "bullet_list":
			return {
				items: [""],
			}
		case "job_entry":
			return {
				title: "",
				company: "",
				start_date: null,
				end_date: null,
				description: [],
			}
		case "rich_text":
			return {
				text: "",
			}
		case "skill_category_entry":
			return {
				category_id: crypto.randomUUID(),
				name: "New category",
				skills: [],
			}
	}
}

export function defaultStyleForCustomBlock(
	blockType: CustomSectionBlockType,
): AppResumeBlockStyle {
	if (blockType === "job_entry" || blockType === "education_entry") {
		return { ...DEFAULT_ENTRY_STYLE }
	}
	return { ...DEFAULT_BODY_STYLE }
}

export function customBlockTypeLabel(blockType: AppResumeBlockType): string {
	const option = CUSTOM_SECTION_BLOCK_OPTIONS.find(
		(item) => item.value === blockType,
	)
	if (option) return option.label
	if (blockType === "skill_category_entry") return "Skill category"
	return blockType.replaceAll("_", " ")
}

export function isCustomSectionBlockType(
	value: string,
): value is CustomSectionBlockType {
	return CUSTOM_SECTION_BLOCK_OPTIONS.some((option) => option.value === value)
}
