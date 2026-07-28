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
	if ("name" in content && "categoryId" in content) {
		return content.name
	}
	if ("name" in content && "description" in content) {
		return content.name
	}
	return `(empty ${block.block_type})`
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
		const bullets = content.description.map((line) => `• ${line}`).join("\n")
		return `${content.title} — ${content.company}\n${formatDateRange(content.start_date, content.end_date)}\n${bullets}`
	}
	if ("school" in content && "degree" in content) {
		return `${content.degree}\n${content.school}\n${formatDateRange(content.start_date, content.end_date)}`
	}
	if ("name" in content && "categoryId" in content) {
		return content.name
	}
	if ("name" in content && "description" in content) {
		const bullets = content.description.map((line) => `• ${line}`).join("\n")
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

function formatMonthYear(value: string | null): string {
	if (!value) return ""
	const date = new Date(value)
	if (Number.isNaN(date.getTime())) return value
	return date.toLocaleDateString(undefined, {
		month: "long",
		year: "numeric",
	})
}
