import { Save } from "lucide-react"
import {
	numberValue,
	stringListValue,
	stringValue,
} from "@/components/applications/resume-builder/app-resume-utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import type { AppResumeBlock } from "@/types/app-resume"

interface ResumeBlockEditorProps {
	block: AppResumeBlock
	draftText: string
	formData: Record<string, unknown>
	onDraftTextChange: (value: string) => void
	onFieldChange: (field: string, value: unknown) => void
	onApply: () => void
	onCancel: () => void
}

export function ResumeBlockEditor({
	block,
	draftText,
	formData,
	onDraftTextChange,
	onFieldChange,
	onApply,
	onCancel,
}: ResumeBlockEditorProps) {
	return (
		<div className="space-y-2">
			{block.block_type === "job_entry" ? (
				<div className="space-y-2">
					<Input
						value={stringValue(formData.title)}
						onChange={(event) => onFieldChange("title", event.target.value)}
						placeholder="Job title"
						className="h-9"
					/>
					<Input
						value={stringValue(formData.company)}
						onChange={(event) => onFieldChange("company", event.target.value)}
						placeholder="Company"
						className="h-9"
					/>
					<div className="grid grid-cols-2 gap-2">
						<Input
							type="date"
							value={stringValue(formData.start_date)}
							onChange={(event) =>
								onFieldChange("start_date", event.target.value)
							}
							className="h-9"
						/>
						<Input
							type="date"
							value={stringValue(formData.end_date)}
							onChange={(event) =>
								onFieldChange("end_date", event.target.value)
							}
							className="h-9"
						/>
					</div>
					<Textarea
						value={stringListValue(formData.description).join("\n")}
						onChange={(event) =>
							onFieldChange("description", event.target.value)
						}
						placeholder="One bullet per line"
						className="min-h-[110px] text-sm text-neutral-900"
					/>
				</div>
			) : null}

			{block.block_type === "education_entry" ? (
				<div className="space-y-2">
					<Input
						value={stringValue(formData.degree)}
						onChange={(event) => onFieldChange("degree", event.target.value)}
						placeholder="Degree"
						className="h-9"
					/>
					<Input
						value={stringValue(formData.school)}
						onChange={(event) => onFieldChange("school", event.target.value)}
						placeholder="School"
						className="h-9"
					/>
					<div className="grid grid-cols-2 gap-2">
						<Input
							type="date"
							value={stringValue(formData.start_date)}
							onChange={(event) =>
								onFieldChange("start_date", event.target.value)
							}
							className="h-9"
						/>
						<Input
							type="date"
							value={stringValue(formData.end_date)}
							onChange={(event) =>
								onFieldChange("end_date", event.target.value)
							}
							className="h-9"
						/>
					</div>
				</div>
			) : null}

			{block.block_type === "skill_entry" ? (
				<div className="space-y-2">
					<Input
						value={stringValue(formData.name)}
						onChange={(event) => onFieldChange("name", event.target.value)}
						placeholder="Skill name"
						className="h-9"
					/>
					<div className="grid grid-cols-2 gap-2">
						<Input
							type="number"
							value={String(numberValue(formData.categoryId))}
							onChange={(event) =>
								onFieldChange("categoryId", Number(event.target.value))
							}
							placeholder="Category ID"
							className="h-9"
						/>
						<Input
							value={stringValue(formData.categoryName)}
							onChange={(event) =>
								onFieldChange("categoryName", event.target.value)
							}
							placeholder="Category name"
							className="h-9"
						/>
					</div>
				</div>
			) : null}

			{block.block_type === "project_entry" ? (
				<div className="space-y-2">
					<Input
						value={stringValue(formData.name)}
						onChange={(event) => onFieldChange("name", event.target.value)}
						placeholder="Project name"
						className="h-9"
					/>
					<Textarea
						value={stringListValue(formData.description).join("\n")}
						onChange={(event) =>
							onFieldChange("description", event.target.value)
						}
						placeholder="One bullet per line"
						className="min-h-[110px] text-sm text-neutral-900"
					/>
				</div>
			) : null}

			{block.block_type === "rich_text" ||
			block.block_type === "group_text" ? (
				<Textarea
					value={draftText}
					onChange={(event) => onDraftTextChange(event.target.value)}
					className="min-h-[120px] text-sm text-neutral-900"
				/>
			) : null}

			<div className="flex items-center gap-2">
				<Button
					type="button"
					size="sm"
					className="gap-1.5"
					onClick={onApply}
				>
					<Save className="size-3.5" aria-hidden />
					Apply
				</Button>
				<Button type="button" size="sm" variant="outline" onClick={onCancel}>
					Cancel
				</Button>
			</div>
		</div>
	)
}
