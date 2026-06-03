import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import type { UserProjectRow } from "@/types/database"
import type {
	FieldErrors,
	UseFormRegister,
} from "react-hook-form"

interface ProjectFormProps {
	register: UseFormRegister<UserProjectRow>
	errors?: FieldErrors<UserProjectRow>
}

export default function ProjectForm({
	register,
	errors,
}: ProjectFormProps) {
	return (
		<>
			<div className="space-y-2">
				<Label>Project name</Label>
				<Input
					{...register("project_name", {
						required: "Project name is required",
					})}
					error={errors?.project_name?.message}
				/>
			</div>

			<div className="grid gap-4 sm:grid-cols-2">
				<div className="space-y-2">
					<Label>Start date</Label>
					<Input
						type="date"
						{...register("start_date", {
							required: "Start date is required",
						})}
						error={errors?.start_date?.message}
					/>
				</div>
				<div className="space-y-2">
					<Label>End date</Label>
					<Input
						type="date"
						{...register("end_date", {
							required: "End date is required",
						})}
						error={errors?.end_date?.message}
					/>
				</div>
			</div>

			<div className="space-y-2">
				<Label>Description</Label>
				<Textarea rows={4} {...register("description")} />
			</div>
		</>
	)
}
