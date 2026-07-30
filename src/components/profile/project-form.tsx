import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
	bulletsToDescriptionString,
	descriptionStringToBullets,
} from "@/components/applications/resume-builder/app-resume-utils"
import { BulletListEditor } from "@/components/applications/resume-builder/bullet-list-editor"
import type { UserProjectRow } from "@/types/database"
import type {
	Control,
	FieldErrors,
	UseFormRegister,
} from "react-hook-form"
import { Controller } from "react-hook-form"

interface ProjectFormProps {
	register: UseFormRegister<UserProjectRow>
	control: Control<UserProjectRow>
	errors?: FieldErrors<UserProjectRow>
	bulletEditorKey?: string
}

export default function ProjectForm({
	register,
	control,
	errors,
	bulletEditorKey = "project-bullets",
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

			<Controller
				name="description"
				control={control}
				render={({ field }) => (
					<BulletListEditor
						key={bulletEditorKey}
						bullets={descriptionStringToBullets(field.value)}
						onChange={(bullets) =>
							field.onChange(bulletsToDescriptionString(bullets))
						}
						label="Description bullets"
						placeholder="What did you build or ship?"
					/>
				)}
			/>
		</>
	)
}
