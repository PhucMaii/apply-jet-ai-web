import type { Dispatch, SetStateAction } from "react"
import { GraduationCap, Plus, Save, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@/components/ui/card"
import { DASHBOARD_THEME } from "@/lib/dashboard-theme"
import { PROFILE_SURFACE } from "@/lib/profile-surface"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import type { UserEducationRow } from "@/types/database"
import { cn } from "@/lib/utils"

interface EducationEditorProps {
	items: UserEducationRow[]
	setItems: Dispatch<SetStateAction<UserEducationRow[]>>
	onAdd: () => void
	onSave: (educationId: string, patch: Partial<UserEducationRow>) => void
}

function EducationRowEditor({
	row,
	index,
	onUpdate,
	onRemove,
	onSave,
}: {
	row: UserEducationRow
	index: number
	onUpdate: (index: number, patch: Partial<UserEducationRow>) => void
	onRemove: (index: number) => void
	onSave: (educationId: string, patch: Partial<UserEducationRow>) => void
}) {
	return (
		<div className={cn("space-y-4", PROFILE_SURFACE.itemPanel)}>
			<div className="grid gap-4 sm:grid-cols-2">
				<div className="space-y-2">
					<Label>School</Label>
					<Input
						value={row.school ?? ""}
						onChange={(e) =>
							onUpdate(index, { school: e.target.value })
						}
					/>
				</div>
				<div className="space-y-2">
					<Label>Degree</Label>
					<Input
						value={row.degree ?? ""}
						onChange={(e) =>
							onUpdate(index, { degree: e.target.value })
						}
					/>
				</div>
			</div>

			<div className="grid gap-4 sm:grid-cols-2">
				<div className="space-y-2">
					<Label>Field of study</Label>
					<Input
						value={row.field_of_study ?? ""}
						onChange={(e) =>
							onUpdate(index, { field_of_study: e.target.value })
						}
					/>
				</div>
				<div className="space-y-2">
					<Label>GPA</Label>
					<Input
						type="number"
						step={0.01}
						value={row.gpa ?? ""}
						onChange={(e) =>
							onUpdate(index, {
								gpa: e.target.value === "" ? null : Number(e.target.value),
							})
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
						onChange={(e) =>
							onUpdate(index, { end_date: e.target.value })
						}
					/>
				</div>
			</div>

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
					className={cn("gap-2 text-destructive hover:text-destructive")}
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

export function EducationEditor({
	items,
	setItems,
	onAdd,
	onSave,
}: EducationEditorProps) {
	const handleUpdate = (
		index: number,
		patch: Partial<UserEducationRow>,
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
					<GraduationCap className={PROFILE_SURFACE.sectionIcon} aria-hidden />
					Education
				</CardTitle>
			</CardHeader>
			<CardContent className="space-y-4">
				{items.map((row, index) => (
					<EducationRowEditor
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
					Add education
				</Button>
			</CardContent>
		</Card>
	)
}

