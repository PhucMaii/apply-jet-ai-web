import { BriefcaseBusiness, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PROFILE_SURFACE } from "@/lib/profile-surface"
import { DASHBOARD_THEME } from "@/lib/dashboard-theme"
import type { UserWorkExperienceRow } from "@/types/database"
import { WorkExperienceRowEditor } from "./work-experience-row"
import type { AsyncResultMsg } from "@/types/types"
import AddWorkExperienceModal from "./add-work-experience-modal"
import { useState } from "react"

interface WorkExperienceEditorProps {
	items: UserWorkExperienceRow[]
	onAdd: (newExperience: UserWorkExperienceRow) => Promise<AsyncResultMsg>
	onSave: (experienceId: string, patch: Partial<UserWorkExperienceRow>) => Promise<AsyncResultMsg>
	onRemove: (experienceId: string) => Promise<AsyncResultMsg>
}

export function WorkExperienceEditor({
	items,
	onAdd,
	onSave,
	onRemove
}: WorkExperienceEditorProps) {
	const [isOpenAddWorkExperienceModal, setIsOpenAddWorkExperienceModal] = useState(false)

	return (
		<Card variant="solid" className={DASHBOARD_THEME.card}>
			<CardHeader className="flex flex-row items-center justify-between">
				<div>
					<CardTitle className="flex items-center gap-2 font-display">
						<BriefcaseBusiness className={PROFILE_SURFACE.sectionIcon} aria-hidden />
						Work experiences
					</CardTitle>
					<CardDescription>
						Add your job history for richer autofill quality.
					</CardDescription>
				</div>
				<Button
					type="button"
					variant="secondary"
					className="gap-2"
					onClick={() => setIsOpenAddWorkExperienceModal(true)}
				>
					<Plus className="size-4" aria-hidden />
					Add experience
				</Button>
			</CardHeader>
			<CardContent className="space-y-4">
				{items.map((row, index) => (
					<WorkExperienceRowEditor
						key={`${row.id}-${index}`}
						row={row}
						index={index}
						onRemove={onRemove}
						onSave={onSave}
					/>
				))}
			</CardContent>

			<AddWorkExperienceModal
				isOpen={isOpenAddWorkExperienceModal}
				onClose={() => setIsOpenAddWorkExperienceModal(false)}
				onAdd={onAdd}
			/>
		</Card>
	)
}

