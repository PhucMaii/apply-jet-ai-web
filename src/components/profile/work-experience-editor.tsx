import type { Dispatch, SetStateAction } from "react"
import { BriefcaseBusiness, Plus, Save, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PROFILE_SURFACE } from "@/lib/profile-surface"
import { DASHBOARD_THEME } from "@/lib/dashboard-theme"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import type { UserWorkExperienceRow } from "@/types/database"
import { cn } from "@/lib/utils"

interface WorkExperienceEditorProps {
	items: UserWorkExperienceRow[]
	setItems: Dispatch<SetStateAction<UserWorkExperienceRow[]>>
	onAdd: () => void
	onSave: (experienceId: string, patch: Partial<UserWorkExperienceRow>) => void
}

function WorkExperienceRowEditor({
	row,
	index,
	onUpdate,
	onRemove,
	onSave,
}: {
	row: UserWorkExperienceRow
	index: number
	onUpdate: (index: number, patch: Partial<UserWorkExperienceRow>) => void
	onRemove: (index: number) => void
	onSave: (experienceId: string, patch: Partial<UserWorkExperienceRow>) => void
}) {
	return (
		<div className={cn("space-y-4", PROFILE_SURFACE.itemPanel)}>
			<div className="grid gap-4 sm:grid-cols-2">
				<div className="space-y-2">
					<Label>Company</Label>
					<Input
						value={row.company ?? ""}
						onChange={(e) =>
							onUpdate(index, { company: e.target.value })
						}
					/>
				</div>
				<div className="space-y-2">
					<Label>Title</Label>
					<Input
						value={row.title ?? ""}
						onChange={(e) =>
							onUpdate(index, { title: e.target.value })
						}
					/>
				</div>
			</div>

			<div className="grid gap-4 sm:grid-cols-2">
				<div className="space-y-2">
					<Label>Location</Label>
					<Input
						value={row.location ?? ""}
						onChange={(e) =>
							onUpdate(index, { location: e.target.value })
						}
					/>
				</div>
				<div className="space-y-2">
					<Label>Employment type</Label>
					<Input
						value={row.employment_type ?? ""}
						onChange={(e) =>
							onUpdate(index, { employment_type: e.target.value })
						}
					/>
				</div>
			</div>

			<div className="grid gap-4 sm:grid-cols-2">
				<div className="space-y-2">
					<Label>Start date</Label>
					<Input
						type="date"
						value={row.start_date ?? ""}
						onChange={(e) =>
							onUpdate(index, { start_date: e.target.value })
						}
					/>
				</div>
				<div className="space-y-2">
					<Label>End date</Label>
					<Input
						type="date"
						value={row.end_date ?? ""}
						disabled={Boolean(row.currently_working)}
						onChange={(e) =>
							onUpdate(index, { end_date: e.target.value })
						}
					/>
				</div>
			</div>

			<label className="flex items-center gap-2 text-sm text-neutral-900">
				<input
					type="checkbox"
					className="size-4 rounded border-input bg-background"
					checked={Boolean(row.currently_working)}
					onChange={(e) =>
						onUpdate(index, {
							currently_working: e.target.checked,
							end_date: e.target.checked ? null : row.end_date,
						})
					}
				/>
				I currently work here
			</label>

			<div className="space-y-2">
				<Label>Description</Label>
				<Textarea
					rows={4}
					value={row.description ?? ""}
					onChange={(e) =>
						onUpdate(index, { description: e.target.value })
					}
				/>
			</div>

			<div className="flex gap-2 items-center justify-end">
				<Button
					type="button"
					variant="ghost"
					size="sm"
					className={cn(
						"gap-2 text-destructive hover:text-destructive",
					)}
					onClick={() => onRemove(index)}
				>
					<Trash2 className="size-4" aria-hidden />
					Remove
				</Button>

				<Button
					type="button"
					variant="secondary"
					className="gap-2"
					onClick={() => onSave(row.id, row)}
				>
					<Save className="size-4" aria-hidden />
					Save
				</Button>
			</div>

		</div>
	)
}

export function WorkExperienceEditor({
	items,
	setItems,
	onAdd,
	onSave,
}: WorkExperienceEditorProps) {
	const handleUpdate = (
		index: number,
		patch: Partial<UserWorkExperienceRow>,
	) => {
		setItems((prev) =>
			prev.map((entry, entryIndex) =>
				entryIndex === index ? { ...entry, ...patch } : entry,
			),
		)
	}

	const handleRemove = (index: number) => {
		setItems((prev) => prev.filter((_, entryIndex) => entryIndex !== index))
	}

	return (
		<Card variant="solid" className={DASHBOARD_THEME.card}>
			<CardHeader>
				<CardTitle className="flex items-center gap-2 font-display">
					<BriefcaseBusiness className={PROFILE_SURFACE.sectionIcon} aria-hidden />
					Work experiences
				</CardTitle>
				<CardDescription>
					Add your job history for richer autofill quality.
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-4">
				{items.map((row, index) => (
					<WorkExperienceRowEditor
						key={`${row.id}-${index}`}
						row={row}
						index={index}
						onUpdate={handleUpdate}
						onRemove={handleRemove}
						onSave={onSave}
					/>
				))}

				<Button
					type="button"
					variant="secondary"
					className="gap-2"
					onClick={onAdd}
				>
					<Plus className="size-4" aria-hidden />
					Add experience
				</Button>
			</CardContent>
		</Card>
	)
}

