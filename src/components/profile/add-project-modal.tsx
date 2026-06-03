import { useEffect } from "react"
import { CheckIcon, Loader2Icon, XIcon } from "lucide-react"
import { useForm } from "react-hook-form"
import toast from "react-hot-toast"
import Modal from "@/components/ui/modal"
import Divider from "@/components/ui/divider"
import { Button } from "@/components/ui/button"
import ProjectForm from "@/components/profile/project-form"
import { useAuth } from "@/context/auth-context"
import { emptyProject } from "@/lib/profile-defaults"
import type { UserProjectRow } from "@/types/database"
import type { AsyncResultMsg } from "@/types/types"

interface AddProjectModalProps {
	isOpen: boolean
	onClose: () => void
	onAdd: (project: UserProjectRow) => Promise<AsyncResultMsg>
}

export default function AddProjectModal({
	isOpen,
	onClose,
	onAdd,
}: AddProjectModalProps) {
	const { user } = useAuth()

	const {
		register,
		handleSubmit,
		reset,
		formState: { errors, isSubmitting },
	} = useForm<UserProjectRow>({
		defaultValues: emptyProject(user?.id ?? ""),
		mode: "onTouched",
	})

	useEffect(() => {
		if (isOpen) {
			reset(emptyProject(user?.id ?? ""))
		}
	}, [reset, user?.id, isOpen])

	const handleValidSubmit = async (data: UserProjectRow) => {
		const result = await onAdd(data)

		if (result.success) {
			toast.success(result.message)
			reset(emptyProject(user?.id ?? ""))
			onClose()
			return
		}

		toast.error(result.message)
	}

	const handleInvalidSubmit = () => {
		toast.error("Please fill in all required fields")
	}

	return (
		<Modal isOpen={isOpen} onClose={onClose}>
			<form
				className="flex flex-col gap-4"
				noValidate
				onSubmit={handleSubmit(handleValidSubmit, handleInvalidSubmit)}
			>
				<h3 className="font-bold text-lg">Add project</h3>
				<Divider />
				<ProjectForm register={register} errors={errors} />

				<div className="flex items-center justify-end gap-2">
					<Button type="button" variant="outline" onClick={onClose}>
						<XIcon className="size-4" aria-hidden />
						<span>Cancel</span>
					</Button>
					<Button type="submit" disabled={isSubmitting}>
						{isSubmitting ? (
							<Loader2Icon
								className="size-4 animate-spin"
								aria-hidden
							/>
						) : (
							<CheckIcon className="size-4" aria-hidden />
						)}
						Add
					</Button>
				</div>
			</form>
		</Modal>
	)
}
