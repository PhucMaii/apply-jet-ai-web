import { GraduationCap, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@/components/ui/card"
import { DASHBOARD_THEME } from "@/lib/dashboard-theme"
import { PROFILE_SURFACE } from "@/lib/profile-surface"
import type { UserEducationRow } from "@/types/database"
import { EducationRowEditor } from "./education-row-editor"
import type { AsyncResultMsg } from "@/types/types"
import { useState } from "react"
import AddEducationModal from "./add-education-modal"

interface EducationEditorProps {
	items: UserEducationRow[]
	onAdd: (newEducation: UserEducationRow) => Promise<AsyncResultMsg>
	onSave: (educationId: string, patch: Partial<UserEducationRow>) => Promise<AsyncResultMsg>
	onRemove: (educationId: string) => Promise<AsyncResultMsg>
}

export function EducationEditor({
	items,
	onAdd,
	onSave,
	onRemove,
}: EducationEditorProps) {
	const [isOpenAddEducationModal, setIsOpenAddEducationModal] = useState(false)

	return (
		<Card variant="solid" className={DASHBOARD_THEME.card}>
			<CardHeader className="flex flex-row items-center justify-between">
				<CardTitle className="flex items-center gap-2 font-display">
					<GraduationCap className={PROFILE_SURFACE.sectionIcon} aria-hidden />
					Education
				</CardTitle>
				<Button
					type="button"
					variant="secondary"
					className="gap-2"
					onClick={() => setIsOpenAddEducationModal(true)}
				>
					<Plus className="size-4" aria-hidden />
					Add education
				</Button>
			</CardHeader>
			<CardContent className="space-y-4">
				{items.map((row, index) => (
					<EducationRowEditor
						key={`${row.id}-${index}`}
						row={row}
						onRemove={onRemove}
						onSave={onSave}
					/>
				))}
			</CardContent>

			<AddEducationModal
				isOpen={isOpenAddEducationModal}
				onClose={() => setIsOpenAddEducationModal(false)}
				onAdd={onAdd}
			/>
		</Card>
	)
}

