import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import type { UserWorkExperienceRow } from "@/types/database"
import type {
	FieldErrors,
	UseFormRegister,
	UseFormWatch,
} from "react-hook-form"

interface WorkExperienceFormProps {
	register: UseFormRegister<UserWorkExperienceRow>
	watch: UseFormWatch<UserWorkExperienceRow>
	errors?: FieldErrors<UserWorkExperienceRow>
}

export default function WorkExperienceForm({
	register,
	watch,
	errors,
}: WorkExperienceFormProps) {
	return (
		<>
			<div className="grid gap-4 sm:grid-cols-2">
				<div className="space-y-2">
					<Label>Company</Label>
					<Input
						{...register("company", { required: "Company is required" })}
						error={errors?.company?.message}
					/>
				</div>
				<div className="space-y-2">
					<Label>Title</Label>
					<Input
						{...register("title", { required: "Title is required" })}
						error={errors?.title?.message}
					/>
				</div>
			</div>

			<div className="grid gap-4 sm:grid-cols-2">
				<div className="space-y-2">
					<Label>Location</Label>
					<Input {...register("location")} />
				</div>
				<div className="space-y-2">
					<Label>Employment type</Label>
					<Input {...register("employment_type")} />
				</div>
			</div>

			<div className="grid gap-4 sm:grid-cols-2">
				<div className="space-y-2">
					<Label>Start date</Label>
					<Input
						type="date"
						{...register("start_date", { required: "Start date is required" })}
						error={errors?.start_date?.message}
					/>
				</div>
				<div className="space-y-2">
					<Label>End date</Label>
					<Input
						type="date"
						{...register("end_date")}
						disabled={Boolean(watch("currently_working"))}
						error={errors?.end_date?.message}
					/>
				</div>
			</div>

			<div className="flex items-center gap-2 text-sm text-neutral-900">
				<input
					type="checkbox"
					className="size-4 rounded border-input bg-background"
					{...register("currently_working")}
				/>
				<span>I currently work here</span>
			</div>

			<div className="space-y-2">
				<Label>Description</Label>
				<Textarea rows={4} {...register("description")} />
			</div>
		</>
	)
}
