import { sortBlocks, sortSections } from "@/components/applications/resume-builder/app-resume-utils"
import type {
	AppResumeBlock,
	AppResumeBlockStyle,
	AppResumeSection,
} from "@/types/app-resume"

export type ResumeFontStyleMode = "regular" | "bold" | "italic"
export type ResumeTextAlign = NonNullable<AppResumeBlockStyle["textAlign"]>
export type ResumeHeaderLayout = NonNullable<
	AppResumeBlockStyle["headerLayout"]
>

export const RESUME_FONT_SIZE_OPTIONS = [
	8, 9, 10, 11, 12, 13, 14, 16, 18, 20, 24,
] as const

export const RESUME_LINE_HEIGHT_OPTIONS = [
	{ value: 1.15, label: "Tight" },
	{ value: 1.25, label: "Snug" },
	{ value: 1.35, label: "Normal" },
	{ value: 1.5, label: "Relaxed" },
	{ value: 1.75, label: "Loose" },
] as const

export const RESUME_TEXT_ALIGN_OPTIONS: Array<{
	value: ResumeTextAlign
	label: string
}> = [
	{ value: "left", label: "Left" },
	{ value: "center", label: "Center" },
	{ value: "right", label: "Right" },
]

export const DEFAULT_BLOCK_STYLE: Required<
	Pick<
		AppResumeBlockStyle,
		| "fontSize"
		| "lineHeight"
		| "bold"
		| "italic"
		| "textAlign"
		| "headerLayout"
	>
> &
	AppResumeBlockStyle = {
	fontSize: 12,
	lineHeight: 1.35,
	bold: false,
	italic: false,
	textAlign: "left",
	headerLayout: "inline",
	color: "black",
}

export function getTextAlign(
	style?: AppResumeBlockStyle | null,
): ResumeTextAlign {
	const align = style?.textAlign
	if (align === "center" || align === "right" || align === "left") {
		return align
	}
	return "left"
}

export function getHeaderLayout(
	style?: AppResumeBlockStyle | null,
	sectionType?: AppResumeSection["section_type"],
): ResumeHeaderLayout {
	const layout = style?.headerLayout
	if (
		layout === "inline" ||
		layout === "stacked" ||
		layout === "inverted"
	) {
		return layout
	}
	// Education historically stacks degree over school.
	if (sectionType === "education") return "stacked"
	return "inline"
}

export function sectionSupportsHeaderLayout(
	sectionType: AppResumeSection["section_type"],
	blocks: AppResumeBlock[] = [],
): boolean {
	if (
		sectionType === "experience" ||
		sectionType === "education" ||
		sectionType === "projects"
	) {
		return true
	}

	if (sectionType !== "custom") return false

	return blocks.some(
		(block) =>
			block.block_type === "job_entry" ||
			block.block_type === "education_entry" ||
			block.block_type === "project_entry",
	)
}

export function headerLayoutOptions(
	sectionType: AppResumeSection["section_type"],
): Array<{ value: ResumeHeaderLayout; label: string; hint: string }> {
	if (sectionType === "education") {
		return [
			{
				value: "inline",
				label: "Inline",
				hint: "Degree — School",
			},
			{
				value: "stacked",
				label: "Stacked",
				hint: "Degree above school",
			},
			{
				value: "inverted",
				label: "Inverted",
				hint: "School above degree",
			},
		]
	}

	if (sectionType === "projects") {
		return [
			{
				value: "inline",
				label: "Inline",
				hint: "Name — Org",
			},
			{
				value: "stacked",
				label: "Stacked",
				hint: "Name above org",
			},
			{
				value: "inverted",
				label: "Inverted",
				hint: "Org above name",
			},
		]
	}

	if (sectionType === "custom") {
		return [
			{
				value: "inline",
				label: "Inline",
				hint: "Primary — Secondary",
			},
			{
				value: "stacked",
				label: "Stacked",
				hint: "Primary above secondary",
			},
			{
				value: "inverted",
				label: "Inverted",
				hint: "Secondary above primary",
			},
		]
	}

	return [
		{
			value: "inline",
			label: "Inline",
			hint: "Title — Company",
		},
		{
			value: "stacked",
			label: "Stacked",
			hint: "Title above company",
		},
		{
			value: "inverted",
			label: "Inverted",
			hint: "Company above title",
		},
	]
}

export interface EntryHeadlineParts {
	primary: string
	secondary: string | null
}

/** Resolve the two headline strings for a dual-field entry block. */
export function getEntryHeadlineParts(
	block: AppResumeBlock,
): EntryHeadlineParts | null {
	const content = block.content_json

	if (block.block_type === "job_entry" && "title" in content) {
		return {
			primary: content.title,
			secondary: content.company || null,
		}
	}

	if (block.block_type === "education_entry" && "school" in content) {
		return {
			primary: content.degree,
			secondary: content.school || null,
		}
	}

	if (block.block_type === "project_entry" && "name" in content) {
		const organization =
			"organization" in content &&
			typeof content.organization === "string"
				? content.organization.trim()
				: ""
		return {
			primary: content.name,
			secondary: organization || null,
		}
	}

	return null
}

/**
 * Order headline fields for rendering based on headerLayout.
 * inline → same-line primary + secondary
 * stacked → primary then secondary
 * inverted → secondary then primary
 */
export function orderHeadlineFields(
	parts: EntryHeadlineParts,
	layout: ResumeHeaderLayout,
): { first: string; second: string | null; inline: boolean } {
	if (layout === "inline") {
		return {
			first: parts.primary,
			second: parts.secondary,
			inline: true,
		}
	}

	if (layout === "inverted" && parts.secondary) {
		return {
			first: parts.secondary,
			second: parts.primary,
			inline: false,
		}
	}

	return {
		first: parts.primary,
		second: parts.secondary,
		inline: false,
	}
}

/**
 * A style group is what the Style tab edits as one unit.
 * Usually one group per section; header splits into name / title / contact.
 */
export interface ResumeStyleGroup {
	id: string
	sectionId: string
	sectionType: AppResumeSection["section_type"]
	sectionLabel: string
	label: string
	description: string
	blockIds: string[]
	supportsHeaderLayout: boolean
	/** Representative style shown in the editor (from the first block). */
	style: AppResumeBlockStyle
}

export function getFontStyleMode(
	style?: AppResumeBlockStyle | null,
): ResumeFontStyleMode {
	if (style?.italic) return "italic"
	if (style?.bold) return "bold"
	return "regular"
}

export function fontStylePatch(
	mode: ResumeFontStyleMode,
): Pick<AppResumeBlockStyle, "bold" | "italic"> {
	switch (mode) {
		case "bold":
			return { bold: true, italic: false }
		case "italic":
			return { bold: false, italic: true }
		case "regular":
		default:
			return { bold: false, italic: false }
	}
}

export function mergeBlockStyle(
	current: AppResumeBlockStyle | null | undefined,
	patch: Partial<AppResumeBlockStyle>,
): AppResumeBlockStyle {
	return {
		...DEFAULT_BLOCK_STYLE,
		...(current ?? {}),
		...patch,
	}
}

export function normalizeBlockStyle(
	style?: AppResumeBlockStyle | null,
): AppResumeBlockStyle {
	return mergeBlockStyle(style, {})
}

/** Build ordered style groups matching document/preview section order. */
export function buildResumeStyleGroups(
	sections: AppResumeSection[],
): ResumeStyleGroup[] {
	const groups: ResumeStyleGroup[] = []

	for (const section of sortSections(sections)) {
		const blocks = sortBlocks(section.blocks)
		if (blocks.length === 0) continue

		if (section.section_type === "header") {
			groups.push(...buildHeaderStyleGroups(section, blocks))
			continue
		}

		groups.push({
			id: `section-${section.id}`,
			sectionId: section.id,
			sectionType: section.section_type,
			sectionLabel: section.display_name,
			label: section.display_name,
			description: styleGroupDescription(section, blocks.length),
			blockIds: blocks.map((block) => block.id),
			supportsHeaderLayout: sectionSupportsHeaderLayout(
				section.section_type,
				blocks,
			),
			style: normalizeBlockStyle(blocks[0]?.style_json),
		})
	}

	return groups
}

function buildHeaderStyleGroups(
	section: AppResumeSection,
	blocks: AppResumeBlock[],
): ResumeStyleGroup[] {
	const groups: ResumeStyleGroup[] = []

	const nameBlock = blocks.find(
		(block) => block.block_type === "rich_text" && block.sort_key === 0,
	)
	const titleBlock = blocks.find(
		(block) => block.block_type === "rich_text" && block.sort_key === 1,
	)
	const contactBlocks = blocks.filter(
		(block) => block.block_type === "group_text",
	)
	const otherBlocks = blocks.filter(
		(block) =>
			block.id !== nameBlock?.id &&
			block.id !== titleBlock?.id &&
			!contactBlocks.some((contact) => contact.id === block.id),
	)

	if (nameBlock) {
		groups.push({
			id: `header-name-${section.id}`,
			sectionId: section.id,
			sectionType: "header",
			sectionLabel: section.display_name,
			label: "Name",
			description: "Your name at the top of the resume",
			blockIds: [nameBlock.id],
			supportsHeaderLayout: false,
			style: normalizeBlockStyle(nameBlock.style_json),
		})
	}

	if (titleBlock) {
		groups.push({
			id: `header-title-${section.id}`,
			sectionId: section.id,
			sectionType: "header",
			sectionLabel: section.display_name,
			label: "Job title",
			description: "Headline under your name",
			blockIds: [titleBlock.id],
			supportsHeaderLayout: false,
			style: normalizeBlockStyle(titleBlock.style_json),
		})
	}

	if (contactBlocks.length > 0) {
		groups.push({
			id: `header-contact-${section.id}`,
			sectionId: section.id,
			sectionType: "header",
			sectionLabel: section.display_name,
			label: "Contact line",
			description: "Location, phone, email, and links",
			blockIds: contactBlocks.map((block) => block.id),
			supportsHeaderLayout: false,
			style: normalizeBlockStyle(contactBlocks[0]?.style_json),
		})
	}

	if (otherBlocks.length > 0) {
		groups.push({
			id: `header-other-${section.id}`,
			sectionId: section.id,
			sectionType: "header",
			sectionLabel: section.display_name,
			label: "Other header text",
			description: "Additional header content",
			blockIds: otherBlocks.map((block) => block.id),
			supportsHeaderLayout: false,
			style: normalizeBlockStyle(otherBlocks[0]?.style_json),
		})
	}

	return groups
}

function styleGroupDescription(
	section: AppResumeSection,
	blockCount: number,
): string {
	switch (section.section_type) {
		case "summary":
			return "Professional summary paragraph"
		case "experience":
			return blockCount === 1
				? "1 experience entry"
				: `${blockCount} experience entries`
		case "education":
			return blockCount === 1
				? "1 education entry"
				: `${blockCount} education entries`
		case "projects":
			return blockCount === 1
				? "1 project"
				: `${blockCount} projects`
		case "skills":
			return blockCount === 1
				? "1 skill group"
				: `${blockCount} skill groups`
		case "custom":
			return blockCount === 1
				? "1 custom block"
				: `${blockCount} custom blocks`
		default:
			return blockCount === 1 ? "1 block" : `${blockCount} blocks`
	}
}

export function applyStylePatchToBlocks(
	sections: AppResumeSection[],
	blockIds: string[],
	patch: Partial<AppResumeBlockStyle>,
): { nextSections: AppResumeSection[]; updatedBlocks: AppResumeBlock[] } {
	const idSet = new Set(blockIds)
	const updatedBlocks: AppResumeBlock[] = []

	const nextSections = sections.map((section) => ({
		...section,
		blocks: section.blocks.map((block) => {
			if (!idSet.has(block.id)) return block
			const nextBlock: AppResumeBlock = {
				...block,
				style_json: mergeBlockStyle(block.style_json, patch),
			}
			updatedBlocks.push(nextBlock)
			return nextBlock
		}),
	}))

	return { nextSections, updatedBlocks }
}
