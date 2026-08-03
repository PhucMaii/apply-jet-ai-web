import { sortBlocks, sortSections } from "@/components/applications/resume-builder/app-resume-utils"
import type {
	AppResumeBlock,
	AppResumeBlockStyle,
	AppResumeSection,
} from "@/types/app-resume"

export type ResumeFontStyleMode = "regular" | "bold" | "italic"

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

export const DEFAULT_BLOCK_STYLE: Required<
	Pick<AppResumeBlockStyle, "fontSize" | "lineHeight" | "bold" | "italic">
> &
	AppResumeBlockStyle = {
	fontSize: 12,
	lineHeight: 1.35,
	bold: false,
	italic: false,
	color: "black",
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
