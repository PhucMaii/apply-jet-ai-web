import { useEffect, useState } from "react"
import {
	applyEditableText,
	formatDateRange,
	getEditableText,
	stringListValue,
} from "@/components/applications/resume-builder/app-resume-utils"
import type { AppResumeBlock } from "@/types/app-resume"
import { cn } from "@/lib/utils"

export function EditableBlock({
	block,
	isName,
	editing,
	onStartEdit,
	onCommit,
	onCancel,
}: {
	block: AppResumeBlock
	isName?: boolean
	editing: boolean
	onStartEdit: () => void
	onCommit: (block: AppResumeBlock) => void
	onCancel: () => void
}) {
	const editableText = getEditableText(block)
	const [draft, setDraft] = useState(editableText)

	useEffect(() => {
		if (editing) {
			setDraft(getEditableText(block))
		}
	}, [editing, block])

	if (!editing) {
		return (
			<button
				type="button"
				className="mb-2 block w-full rounded px-1 py-0.5 text-left hover:bg-neutral-50"
				onClick={onStartEdit}
			>
				<BlockPreview block={block} isName={isName} />
			</button>
		)
	}

	return (
		<textarea
			autoFocus
			value={draft}
			onChange={(event) => setDraft(event.target.value)}
			onBlur={() =>
				onCommit({
					...block,
					content_json: applyEditableText(block, draft),
				})
			}
			onKeyDown={(event) => {
				if (event.key === "Escape") {
					event.preventDefault()
					setDraft(editableText)
					onCancel()
				}
				if (
					event.key === "Enter" &&
					!event.shiftKey &&
					block.block_type !== "rich_text" &&
					block.block_type !== "job_entry" &&
					block.block_type !== "project_entry" &&
					block.block_type !== "skill_category_entry"
				) {
					event.preventDefault()
					onCommit({
						...block,
						content_json: applyEditableText(block, draft),
					})
				}
			}}
			className={cn(
				"mb-2 w-full resize-y rounded border border-primary/40 bg-white px-2 py-1 text-neutral-900 outline-none ring-2 ring-primary/15 caret-neutral-900",
				isName
					? "min-h-12 font-display text-3xl font-semibold"
					: "min-h-16 text-sm",
			)}
		/>
	)
}

function BlockPreview({
	block,
	isName,
}: {
	block: AppResumeBlock
	isName?: boolean
}) {
	const content = block.content_json
	const fontSize = block.style_json.fontSize
	const isBold = block.style_json.bold

	if (block.block_type === "rich_text" && "text" in content) {
		return (
			<p
				className={cn(
					"leading-relaxed text-neutral-800",
					isName &&
						"font-display text-3xl font-semibold tracking-tight text-neutral-900",
					!isName && isBold && "font-semibold",
					!isName && fontSize && fontSize <= 12 && "text-sm text-neutral-700",
				)}
			>
				{content.text}
			</p>
		)
	}

	if (block.block_type === "group_text" && "texts" in content) {
		return (
			<p className="text-sm text-neutral-600">
				{content.texts.map((item) => item.text).join(" ")}
			</p>
		)
	}

	if (block.block_type === "job_entry" && "title" in content) {
		return (
			<div className="space-y-1">
				<div className="flex flex-wrap items-baseline justify-between gap-2">
					<p className="text-sm font-semibold text-neutral-900">
						{content.title}
						<span className="font-normal text-neutral-600">
							{" "}
							— {content.company}
						</span>
					</p>
					<p className="text-xs text-neutral-500">
						{formatDateRange(content.start_date, content.end_date)}
					</p>
				</div>
				<ul className="space-y-0.5">
					{content.description.map((line) => (
						<li
							key={line}
							className="flex gap-2 text-[13px] leading-relaxed text-neutral-800"
						>
							<span aria-hidden>•</span>
							<span>{line}</span>
						</li>
					))}
				</ul>
			</div>
		)
	}

	if (block.block_type === "education_entry" && "school" in content) {
		return (
			<div className="flex flex-wrap items-baseline justify-between gap-2">
				<div>
					<p className="text-sm font-semibold text-neutral-900">
						{content.degree}
					</p>
					<p className="text-sm text-neutral-600">{content.school}</p>
				</div>
				<p className="text-xs text-neutral-500">
					{formatDateRange(content.start_date, content.end_date)}
				</p>
			</div>
		)
	}

	if (block.block_type === "project_entry" && "name" in content) {
		return (
			<div className="space-y-1">
				<p className="text-sm font-semibold text-neutral-900">{content.name}</p>
				<ul className="space-y-0.5">
					{content.description.map((line) => (
						<li
							key={line}
							className="flex gap-2 text-[13px] leading-relaxed text-neutral-800"
						>
							<span aria-hidden>•</span>
							<span>{line}</span>
						</li>
					))}
				</ul>
			</div>
		)
	}

	if (block.block_type === "skill_category_entry" && "skills" in content) {
		const skills = stringListValue(content.skills)
		return (
			<div className="mb-2">
				<p className="text-[13px] leading-relaxed text-neutral-800">
					<span className="font-semibold text-neutral-900">
						{content.name}
					</span>
					{skills.length > 0 ? (
						<>
							<span className="font-semibold text-neutral-900">: </span>
							<span>{skills.join(", ")}</span>
						</>
					) : null}
				</p>
			</div>
		)
	}

	if (block.block_type === "skill_entry" && "name" in content) {
		return (
			<span className="mr-1.5 inline-flex rounded-md bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-800">
				{content.name}
			</span>
		)
	}

	return (
		<p className="text-sm text-neutral-500">(unsupported {block.block_type})</p>
	)
}
