import { useEffect } from "react"
import { CheckIcon, Loader2Icon, XIcon } from "lucide-react"
import { useForm } from "react-hook-form"
import toast from "react-hot-toast"
import Modal from "@/components/ui/modal"
import Divider from "@/components/ui/divider"
import { Button } from "@/components/ui/button"
import WorkExperienceForm from "@/components/profile/work-experience-form"
import { useAuth } from "@/context/auth-context"
import { emptyWorkExperience } from "@/lib/profile-defaults"
import type { UserWorkExperienceRow } from "@/types/database"
import type { AsyncResultMsg } from "@/types/types"

interface AddWorkExperienceModalProps {
	isOpen: boolean
	onClose: () => void
	onAdd: (experience: UserWorkExperienceRow) => Promise<AsyncResultMsg>
}

export default function AddWorkExperienceModal({
	isOpen,
	onClose,
	onAdd,
}: AddWorkExperienceModalProps) {
	const { user } = useAuth()

	const {
		register,
		handleSubmit,
		watch,
		reset,
		formState: { errors, isSubmitting },
	} = useForm<UserWorkExperienceRow>({
		defaultValues: emptyWorkExperience(user?.id ?? ""),
		mode: "onTouched",
	})

	useEffect(() => {
		if (isOpen) {
			reset(emptyWorkExperience(user?.id ?? ""))
		}
	}, [reset, user?.id, isOpen])

	const handleValidSubmit = async (data: UserWorkExperienceRow) => {
		const result = await onAdd(data)

		if (result.success) {
			toast.success(result.message)
			reset(emptyWorkExperience(user?.id ?? ""))
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
				<h3 className="font-bold text-lg">Add work experience</h3>
				<Divider />
				<WorkExperienceForm
					register={register}
					watch={watch}
					errors={errors}
				/>

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
