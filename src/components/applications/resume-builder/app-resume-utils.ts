import type {
	AppResumeBlock,
	AppResumeBlockContent,
	AppResumeSection,
} from "@/types/app-resume"

export function sortSections(sections: AppResumeSection[]) {
	return [...sections].sort((a, b) => a.sort_key - b.sort_key)
}

export function sortBlocks(blocks: AppResumeBlock[]) {
	return [...blocks].sort((a, b) => a.sort_key - b.sort_key)
}

export function getBlockPreviewText(block: AppResumeBlock): string {
	const content = block.content_json
	if ("text" in content && typeof content.text === "string") {
		return content.text
	}
	if ("texts" in content && Array.isArray(content.texts)) {
		return content.texts.map((item) => item.text).join(" ")
	}
	if ("title" in content && "company" in content) {
		return `${content.title} — ${content.company}`
	}
	if ("school" in content && "degree" in content) {
		return `${content.degree} — ${content.school}`
	}
	if (block.block_type === "skill_category_entry" && "skills" in content) {
		const skills = stringListValue(content.skills)
		if (skills.length === 0) return content.name
		return `${content.name}: ${skills.join(", ")}`
	}
	if (block.block_type === "bullet_list" && "items" in content) {
		const items = stringListValue(content.items).filter(Boolean)
		if (items.length === 0) return "(empty bullet list)"
		return items.map((item) => `• ${item}`).join(" ")
	}
	if ("name" in content && "categoryId" in content) {
		return content.name
	}
	if ("name" in content && "description" in content) {
		return content.name
	}
	return `(empty ${block.block_type})`
}

/** Flatten structured resume sections into plain text for ATS scoring. */
export function flattenResumeSectionsText(
	sections: AppResumeSection[],
): string {
	return sortSections(sections)
		.flatMap((section) => {
			const heading =
				section.section_type === "header"
					? []
					: [section.display_name]
			const blockLines = sortBlocks(section.blocks).flatMap((block) => {
				const content = block.content_json
				if (block.block_type === "job_entry" && "title" in content) {
					return [
						`${content.title} — ${content.company}`,
						formatDateRange(content.start_date, content.end_date),
						...stringListValue(content.description),
					]
				}
				if (
					block.block_type === "project_entry" &&
					"name" in content &&
					"description" in content
				) {
					return [
						content.name,
						formatDateRange(
							"start_date" in content
								? (content.start_date ?? null)
								: null,
							"end_date" in content ? (content.end_date ?? null) : null,
						),
						...stringListValue(content.description),
					]
				}
				if (
					block.block_type === "education_entry" &&
					"school" in content
				) {
					return [
						`${content.degree} — ${content.school}`,
						formatEducationDates(content.start_date, content.end_date),
					]
				}
				if (
					block.block_type === "skill_category_entry" &&
					"skills" in content
				) {
					return [
						`${content.name}: ${stringListValue(content.skills).join(", ")}`,
					]
				}
				if (block.block_type === "bullet_list" && "items" in content) {
					return stringListValue(content.items)
				}
				return [getBlockPreviewText(block)]
			})
			return [...heading, ...blockLines]
		})
		.filter(Boolean)
		.join("\n")
}

export function getEditableText(block: AppResumeBlock): string {
	const content = block.content_json
	if ("text" in content && typeof content.text === "string") {
		return content.text
	}
	if ("texts" in content && Array.isArray(content.texts)) {
		return content.texts.map((item) => item.text).join(" ")
	}
	if ("title" in content && "company" in content) {
		const bullets = stringListValue(content.description)
			.map((line) => `• ${line}`)
			.join("\n")
		return `${content.title} — ${content.company}\n${formatDateRange(content.start_date, content.end_date)}\n${bullets}`
	}
	if ("school" in content && "degree" in content) {
		return `${content.degree}\n${content.school}\n${formatEducationDates(content.start_date, content.end_date)}`
	}
	if (block.block_type === "skill_category_entry" && "skills" in content) {
		const bullets = stringListValue(content.skills)
			.map((line) => `• ${line}`)
			.join("\n")
		return `${content.name}\n${bullets}`
	}
	if (block.block_type === "bullet_list" && "items" in content) {
		return stringListValue(content.items)
			.map((line) => `• ${line}`)
			.join("\n")
	}
	if ("name" in content && "categoryId" in content) {
		return content.name
	}
	if ("name" in content && "description" in content) {
		const bullets = stringListValue(content.description)
			.map((line) => `• ${line}`)
			.join("\n")
		return `${content.name}\n${bullets}`
	}
	return ""
}

export function applyEditableText(
	block: AppResumeBlock,
	text: string,
): AppResumeBlockContent {
	const content = block.content_json

	if (block.block_type === "rich_text" && "text" in content) {
		return { text }
	}

	if (block.block_type === "group_text" && "texts" in content) {
		const parts = text.split("|").map((part) => part.trim()).filter(Boolean)
		return {
			texts: parts.map((part, index) => ({
				text: index === 0 ? part : `| ${part}`,
				style_json: content.texts[index]?.style_json ?? {
					color: "black",
					fontSize: 8,
				},
			})),
		}
	}

	if (block.block_type === "skill_entry" && "name" in content) {
		return {
			...content,
			name: text.trim(),
		}
	}

	if (block.block_type === "skill_category_entry" && "skills" in content) {
		const lines = text.split("\n").map((line) => line.trim()).filter(Boolean)
		return {
			...content,
			name: lines[0] || content.name,
			skills: lines
				.slice(1)
				.map((line) => line.replace(/^•\s*/, ""))
				.filter(Boolean),
		}
	}

	if (block.block_type === "bullet_list" && "items" in content) {
		return {
			items: text
				.split("\n")
				.map((line) => line.replace(/^•\s*/, "").trim())
				.filter(Boolean),
		}
	}

	if (block.block_type === "job_entry" && "title" in content) {
		const lines = text.split("\n").map((line) => line.trim()).filter(Boolean)
		const header = lines[0] ?? `${content.title} — ${content.company}`
		const [titlePart, companyPart] = header.split("—").map((part) => part.trim())
		const description = lines
			.slice(2)
			.map((line) => line.replace(/^•\s*/, ""))
			.filter(Boolean)
		return {
			...content,
			title: titlePart || content.title,
			company: companyPart || content.company,
			description: description.length > 0 ? description : content.description,
		}
	}

	if (block.block_type === "education_entry" && "school" in content) {
		const lines = text.split("\n").map((line) => line.trim()).filter(Boolean)
		return {
			...content,
			degree: lines[0] || content.degree,
			school: lines[1] || content.school,
		}
	}

	if (block.block_type === "project_entry" && "name" in content) {
		const lines = text.split("\n").map((line) => line.trim()).filter(Boolean)
		return {
			...content,
			name: lines[0] || content.name,
			description: lines
				.slice(1)
				.map((line) => line.replace(/^•\s*/, ""))
				.filter(Boolean),
		}
	}

	return content
}

export function formatDateRange(
	startDate: string | null,
	endDate: string | null,
): string {
	const start = formatMonthYear(startDate)
	const end = endDate ? formatMonthYear(endDate) : "Present"
	if (!start) return end
	return `${start} - ${end}`
}

/**
 * Education dates: full range, graduation-only (end), or in-progress
 * (start → Present). Empty when neither date is set.
 */
export function formatEducationDates(
	startDate: string | null,
	endDate: string | null,
): string {
	const start = formatMonthYear(startDate)
	const end = formatMonthYear(endDate)
	if (start && end) return `${start} - ${end}`
	if (end) return end
	if (start) return `${start} - Present`
	return ""
}

function formatMonthYear(value: string | null): string {
	if (!value) return ""
	const date = new Date(value)
	if (Number.isNaN(date.getTime())) return value
	return date.toLocaleDateString(undefined, {
		month: "long",
		year: "numeric",
	})
}

export function stringValue(value: unknown): string {
	if (typeof value === "string") return value
	return ""
}

export function nullableStringValue(value: unknown): string | null {
	const next = stringValue(value).trim()
	return next.length > 0 ? next : null
}

export function numberValue(value: unknown): number {
	if (typeof value === "number" && Number.isFinite(value)) return value
	const parsed = Number(value)
	return Number.isFinite(parsed) ? parsed : 0
}

export function stringListValue(value: unknown): string[] {
	if (Array.isArray(value)) {
		return value
			.map((item) => (typeof item === "string" ? item.trim() : ""))
			.filter(Boolean)
	}
	if (typeof value === "string") {
		return value
			.split("\n")
			.map((item) => item.trim())
			.map((item) => item.replace(/^•\s*/, ""))
			.filter(Boolean)
	}
	return []
}

/** Keeps empty strings so editors can hold draft bullets. */
export function toEditableStringList(value: unknown): string[] {
	if (Array.isArray(value)) {
		return value.map((item) => (typeof item === "string" ? item : ""))
	}
	if (typeof value === "string") {
		return descriptionStringToBullets(value)
	}
	return []
}

/**
 * Split prose into sentences without breaking abbreviations like Node.js,
 * U.S., e.g., or initials.
 */
function splitIntoSentences(text: string): string[] {
	const protectedText = text
		.replace(/\b(e\.g|i\.e|vs|etc|mr|mrs|ms|dr|prof|inc|ltd|jr|sr)\./gi, (
			match,
		) => match.replace(/\./g, "\u0000"))
		.replace(/([A-Za-z])\.([A-Za-z])/g, "$1\u0000$2")

	const parts = protectedText
		.split(/(?<=[.!?])\s+(?=[A-Z0-9"“(])/)
		// eslint-disable-next-line no-control-regex
		.map((part) => part.replace(/\u0000/g, ".").trim())
		.filter(Boolean)

	return parts.length > 0 ? parts : [text.trim()].filter(Boolean)
}

/** Profile/DB stores description as one string; prefer newlines, then bullets. */
export function descriptionStringToBullets(
	value: string | null | undefined,
): string[] {
	if (!value) return []
	const trimmed = value.trim()
	if (!trimmed) return []

	if (trimmed.includes("\n")) {
		return trimmed
			.split("\n")
			.map((line) => line.replace(/^•\s*/, "").trimEnd())
			.filter(Boolean)
	}

	if (trimmed.includes("•")) {
		return trimmed
			.split("•")
			.map((part) => part.trim())
			.filter(Boolean)
	}

	return splitIntoSentences(trimmed)
}

export function bulletsToDescriptionString(bullets: string[]): string {
	return bullets
		.map((bullet) => bullet.trim())
		.filter(Boolean)
		.join("\n")
}

export function hasCompleteJobDetails(form: {
	jobTitle: string
	companyName: string
	jobDescription: string
}): boolean {
	return (
		form.jobTitle.trim().length > 0 &&
		form.companyName.trim().length > 0 &&
		form.jobDescription.trim().length > 0
	)
}

export function buildBlockContentFromForm(
	block: AppResumeBlock,
	formData: Record<string, unknown>,
): AppResumeBlockContent | null {
	if (block.block_type === "job_entry") {
		return {
			title: stringValue(formData.title),
			company: stringValue(formData.company),
			start_date: nullableStringValue(formData.start_date),
			end_date: nullableStringValue(formData.end_date),
			description: stringListValue(formData.description),
		}
	}
	if (block.block_type === "education_entry") {
		return {
			school: stringValue(formData.school),
			degree: stringValue(formData.degree),
			start_date: nullableStringValue(formData.start_date),
			end_date: nullableStringValue(formData.end_date),
		}
	}
	if (block.block_type === "skill_entry") {
		return {
			name: stringValue(formData.name),
			categoryId: numberValue(formData.categoryId),
			categoryName: stringValue(formData.categoryName),
		}
	}
	if (block.block_type === "skill_category_entry") {
		return {
			category_id: stringValue(formData.category_id),
			name: stringValue(formData.name),
			skills: stringListValue(formData.skills),
		}
	}
	if (block.block_type === "project_entry") {
		return {
			name: stringValue(formData.name),
			organization: stringValue(formData.organization) || undefined,
			description: stringListValue(formData.description),
			start_date: nullableStringValue(formData.start_date),
			end_date: nullableStringValue(formData.end_date),
		}
	}
	if (block.block_type === "bullet_list") {
		return {
			items: stringListValue(formData.items),
		}
	}
	return null
}
