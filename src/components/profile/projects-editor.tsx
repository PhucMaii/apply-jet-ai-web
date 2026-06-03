import { FolderKanban, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card"
import { PROFILE_SURFACE } from "@/lib/profile-surface"
import { DASHBOARD_THEME } from "@/lib/dashboard-theme"
import type { UserProjectRow } from "@/types/database"
import { ProjectRowEditor } from "./project-row-editor"
import type { AsyncResultMsg } from "@/types/types"
import AddProjectModal from "@/components/profile/add-project-modal"
import { useState } from "react"

interface ProjectsEditorProps {
	items: UserProjectRow[]
	onAdd: (newProject: UserProjectRow) => Promise<AsyncResultMsg>
	onSave: (
		projectId: string,
		patch: Partial<UserProjectRow>,
	) => Promise<AsyncResultMsg>
	onRemove: (projectId: string) => Promise<AsyncResultMsg>
}

export function ProjectsEditor({
	items,
	onAdd,
	onSave,
	onRemove,
}: ProjectsEditorProps) {
	const [isOpenAddProjectModal, setIsOpenAddProjectModal] = useState(false)

	return (
		<Card variant="solid" className={DASHBOARD_THEME.card}>
			<CardHeader className="flex flex-row items-center justify-between">
				<div>
					<CardTitle className="flex items-center gap-2 font-display">
						<FolderKanban
							className={PROFILE_SURFACE.sectionIcon}
							aria-hidden
						/>
						Projects
					</CardTitle>
					<CardDescription>
						Add personal or professional projects for richer autofill.
					</CardDescription>
				</div>
				<Button
					type="button"
					variant="secondary"
					className="gap-2"
					onClick={() => setIsOpenAddProjectModal(true)}
				>
					<Plus className="size-4" aria-hidden />
					Add project
				</Button>
			</CardHeader>
			<CardContent className="space-y-4">
				{items.map((row, index) => (
					<ProjectRowEditor
						key={`${row.id}-${index}`}
						row={row}
						index={index}
						onRemove={onRemove}
						onSave={onSave}
					/>
				))}
			</CardContent>

			<AddProjectModal
				isOpen={isOpenAddProjectModal}
				onClose={() => setIsOpenAddProjectModal(false)}
				onAdd={onAdd}
			/>
		</Card>
	)
}
