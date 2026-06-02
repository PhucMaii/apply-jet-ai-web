import type { UserEducationRow } from "@/types/database"
import { cn } from "@/lib/utils"
import { PROFILE_SURFACE } from "@/lib/profile-surface"
import { Button } from "@/components/ui/button"
import { Trash2, Save, Loader2 } from "lucide-react"
import EducationForm from "./eductation-form"
import { useForm } from "react-hook-form"
import toast from "react-hot-toast"
import type { AsyncResultMsg } from "@/types/types"
import { useState } from "react"
import ConfirmModal from "../ui/confirm-modal"

interface EducationRowEditorProps {
	row: UserEducationRow
	onRemove: (educationId: string) => Promise<AsyncResultMsg>
	onSave: (educationId: string, patch: Partial<UserEducationRow>) => Promise<AsyncResultMsg>
}

export function EducationRowEditor({
	row,
	onRemove,
	onSave,
}: EducationRowEditorProps) {
	const [isSaving, setIsSaving] = useState(false)
	const [isOpenConfirmRemove, setIsOpenConfirmRemove] = useState(false)
	const { register, handleSubmit, formState: { errors } } = useForm<UserEducationRow>({
		defaultValues: row,
		mode: "onTouched",
	})

	const handleValidSave = async (data: UserEducationRow) => {
		setIsSaving(true)
		const result = await onSave(row.id, data)
		if (result.success) {
			toast.success(result.message)
			setIsSaving(false)
			return
		}
		toast.error(result.message)
		setIsSaving(false)
	}

	const handleInvalidSave = () => {
		toast.error("Please fill in all required fields")
		setIsSaving(false)
	}

	const handleSave = () => {
		void handleSubmit(handleValidSave, handleInvalidSave)()
	}

	return (
		<div className={cn("space-y-4", PROFILE_SURFACE.itemPanel)}>
			<EducationForm
				register={register}
				errors={errors}
			/>

			<div className="flex gap-2 items-center justify-end">
				<Button
					type="button"
					variant="ghost"
					size="sm"
					className={cn("gap-2 text-destructive hover:text-destructive")}
					onClick={() => setIsOpenConfirmRemove(true)}
				>
					<Trash2 className="size-4" aria-hidden />
					Remove
				</Button>
				<Button
					type="button"
					variant="secondary"
					className="gap-2"
					onClick={handleSave}
					disabled={isSaving}
				>
					{isSaving ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <Save className="size-4" aria-hidden />}
					Save
				</Button>
			</div>

			<ConfirmModal
				isOpen={isOpenConfirmRemove} 
				onClose={() => setIsOpenConfirmRemove(false)} 
				onConfirm={() => onRemove(row.id)} 
				title="Remove education" 
				message="Are you sure you want to remove this education? This action cannot be undone." 
				successMessage="Education removed successfully"
			/>
		</div>
	)
}
