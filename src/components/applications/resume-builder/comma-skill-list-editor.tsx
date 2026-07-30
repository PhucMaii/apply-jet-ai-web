import { type KeyboardEvent, useState } from "react"
import { Check, Pencil, Plus, Trash2, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PROFILE_SURFACE } from "@/lib/profile-surface"
import { cn } from "@/lib/utils"

interface CommaSkillListEditorProps {
	skills: string[]
	onChange: (skills: string[]) => void
	label?: string
	placeholder?: string
}

function parseCommaSkills(value: string): string[] {
	return value
		.split(",")
		.map((skill) => skill.trim())
		.filter(Boolean)
}

function mergeUniqueSkills(
	existing: string[],
	incoming: string[],
): string[] {
	const seen = new Set(existing.map((skill) => skill.toLowerCase()))
	const next = [...existing]
	for (const skill of incoming) {
		const key = skill.toLowerCase()
		if (seen.has(key)) continue
		seen.add(key)
		next.push(skill)
	}
	return next
}

export function CommaSkillListEditor({
	skills,
	onChange,
	label = "Skills",
	placeholder = "e.g. React, TypeScript, Node.js",
}: CommaSkillListEditorProps) {
	const [draftInput, setDraftInput] = useState("")
	const [editingIndex, setEditingIndex] = useState<number | null>(null)
	const [editingValue, setEditingValue] = useState("")

	function handleAddSkills() {
		const parsed = parseCommaSkills(draftInput)
		if (parsed.length === 0) return
		onChange(mergeUniqueSkills(skills, parsed))
		setDraftInput("")
	}

	function handleInputKeyDown(event: KeyboardEvent<HTMLInputElement>) {
		if (event.key !== "Enter") return
		event.preventDefault()
		handleAddSkills()
	}

	function handleRemoveSkill(index: number) {
		onChange(skills.filter((_, skillIndex) => skillIndex !== index))
		if (editingIndex === index) {
			setEditingIndex(null)
			setEditingValue("")
		}
	}

	function handleStartEdit(index: number) {
		setEditingIndex(index)
		setEditingValue(skills[index] ?? "")
	}

	function handleCancelEdit() {
		setEditingIndex(null)
		setEditingValue("")
	}

	function handleSaveEdit() {
		if (editingIndex === null) return
		const nextName = editingValue.trim()
		if (!nextName) {
			handleRemoveSkill(editingIndex)
			handleCancelEdit()
			return
		}

		const duplicate = skills.some(
			(skill, index) =>
				index !== editingIndex &&
				skill.trim().toLowerCase() === nextName.toLowerCase(),
		)
		if (duplicate) {
			handleCancelEdit()
			return
		}

		onChange(
			skills.map((skill, index) =>
				index === editingIndex ? nextName : skill,
			),
		)
		handleCancelEdit()
	}

	function handleEditKeyDown(event: KeyboardEvent<HTMLInputElement>) {
		if (event.key === "Enter") {
			event.preventDefault()
			handleSaveEdit()
		}
		if (event.key === "Escape") {
			event.preventDefault()
			handleCancelEdit()
		}
	}

	return (
		<div className="space-y-2">
			<div className="flex items-center justify-between gap-2">
				<p className="text-[11px] font-semibold uppercase tracking-wide text-neutral-500">
					{label}
				</p>
				<span className="text-[11px] tabular-nums text-neutral-400">
					{skills.length}
				</span>
			</div>

			<div className="flex flex-wrap items-center gap-2">
				<Input
					value={draftInput}
					onChange={(event) => setDraftInput(event.target.value)}
					onKeyDown={handleInputKeyDown}
					placeholder={placeholder}
					className="h-9 min-w-0 flex-1"
					aria-label="Add skills separated by commas"
				/>
				<Button
					type="button"
					size="sm"
					variant="secondary"
					className="h-9 gap-1.5"
					onClick={handleAddSkills}
					disabled={draftInput.trim().length === 0}
				>
					<Plus className="size-3.5" aria-hidden />
					Add
				</Button>
			</div>
			<p className="text-[11px] text-neutral-500">
				Separate multiple skills with commas, then press Enter or Add.
			</p>

			{skills.length > 0 ? (
				<ul className="flex flex-wrap gap-1.5">
					{skills.map((skill, index) => {
						const isEditing = editingIndex === index
						return (
							<li key={`${skill}-${index}`}>
								{isEditing ? (
									<div className="inline-flex items-center gap-1 rounded-lg border border-primary/30 bg-primary/5 p-1">
										<Input
											value={editingValue}
											onChange={(event) =>
												setEditingValue(event.target.value)
											}
											onKeyDown={handleEditKeyDown}
											className="h-7 w-28 px-2 text-xs sm:w-36"
											autoFocus
											aria-label={`Edit ${skill}`}
										/>
										<Button
											type="button"
											size="sm"
											variant="ghost"
											className="size-7 px-0 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800"
											onClick={handleSaveEdit}
											aria-label={`Save ${skill}`}
										>
											<Check className="size-3.5" aria-hidden />
										</Button>
										<Button
											type="button"
											size="sm"
											variant="ghost"
											className="size-7 px-0 text-neutral-500"
											onClick={handleCancelEdit}
											aria-label="Cancel edit"
										>
											<X className="size-3.5" aria-hidden />
										</Button>
									</div>
								) : (
									<div
										className={cn(
											"inline-flex max-w-full items-center gap-1 rounded-lg",
											PROFILE_SURFACE.skillChip,
										)}
									>
										<span className="truncate text-sm text-neutral-900">
											{skill}
										</span>
										<button
											type="button"
											className="rounded p-0.5 text-neutral-400 transition hover:bg-neutral-200/70 hover:text-neutral-700"
											onClick={() => handleStartEdit(index)}
											aria-label={`Edit ${skill}`}
										>
											<Pencil className="size-3" aria-hidden />
										</button>
										<button
											type="button"
											className="rounded p-0.5 text-neutral-400 transition hover:bg-red-50 hover:text-red-600"
											onClick={() => handleRemoveSkill(index)}
											aria-label={`Remove ${skill}`}
										>
											<Trash2 className="size-3" aria-hidden />
										</button>
									</div>
								)}
							</li>
						)
					})}
				</ul>
			) : (
				<p className="rounded-lg border border-dashed border-neutral-200 bg-neutral-50 px-3 py-2 text-xs text-neutral-500">
					No skills yet. Type a few separated by commas to get started.
				</p>
			)}
		</div>
	)
}
