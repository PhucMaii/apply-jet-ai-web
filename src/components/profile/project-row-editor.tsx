import type { UserProjectRow } from "@/types/database"
import { cn } from "@/lib/utils"
import { PROFILE_SURFACE } from "@/lib/profile-surface"
import { Button } from "@/components/ui/button"
import { Trash2, Save, Loader2 } from "lucide-react"
import ProjectForm from "./project-form"
import { useForm } from "react-hook-form"
import toast from "react-hot-toast"
import type { AsyncResultMsg } from "@/types/types"
import { useState } from "react"
import ConfirmModal from "../ui/confirm-modal"

interface ProjectRowEditorProps {
	row: UserProjectRow
	index: number
	onRemove: (projectId: string) => Promise<AsyncResultMsg>
	onSave: (
		projectId: string,
		patch: Partial<UserProjectRow>,
	) => Promise<AsyncResultMsg>
}

export function ProjectRowEditor({
	row,
	onRemove,
	onSave,
}: ProjectRowEditorProps) {
	const [isOpenConfirmRemove, setIsOpenConfirmRemove] = useState(false)

	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting },
	} = useForm<UserProjectRow>({
		defaultValues: row,
		mode: "onTouched",
	})

	const handleValidSave = async (data: UserProjectRow) => {
		const result = await onSave(row.id, data)
		if (result.success) {
			toast.success(result.message)
			return
		}
		toast.error(result.message)
	}

	const handleInvalidSave = () => {
		toast.error("Please fill in all required fields")
	}

	const handleSave = () => {
		void handleSubmit(handleValidSave, handleInvalidSave)()
	}

	return (
		<div className={cn("space-y-4", PROFILE_SURFACE.itemPanel)}>
			<ProjectForm register={register} errors={errors} />

			<div className="flex gap-2 items-center justify-end">
				<Button
					type="button"
					variant="ghost"
					size="sm"
					className={cn(
						"gap-2 text-destructive hover:text-destructive",
					)}
					onClick={() => setIsOpenConfirmRemove(true)}
				>
					<Trash2 className="size-4" aria-hidden />
					Remove
				</Button>

				<Button
					type="button"
					variant="outline"
					className="gap-2"
					onClick={handleSave}
					disabled={isSubmitting}
				>
					{isSubmitting ? (
						<Loader2 className="size-4 animate-spin" aria-hidden />
					) : (
						<Save className="size-4" aria-hidden />
					)}
					Save
				</Button>
			</div>

			<ConfirmModal
				isOpen={isOpenConfirmRemove}
				onClose={() => setIsOpenConfirmRemove(false)}
				onConfirm={() => onRemove(row.id)}
				title="Remove project"
				message="Are you sure you want to remove this project? This action cannot be undone."
				successMessage="Project removed successfully"
			/>
		</div>
	)
}
