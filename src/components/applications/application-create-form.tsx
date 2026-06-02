import { Loader2, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { APPLICATION_CREATE_COPY } from "@/lib/application-create-copy"
import { DASHBOARD_THEME } from "@/lib/dashboard-theme"
import { PROFILE_SURFACE } from "@/lib/profile-surface"
import type {
	CreateApplicationFieldErrors,
	CreateApplicationForm,
} from "@/types/application-create"
import { cn } from "@/lib/utils"

interface ApplicationCreateFormProps {
	form: CreateApplicationForm
	fieldErrors: CreateApplicationFieldErrors
	submitting: boolean
	onPatchForm: (patch: Partial<CreateApplicationForm>) => void
	onSubmit: () => void
}

export function ApplicationCreateForm({
	form,
	fieldErrors,
	submitting,
	onPatchForm,
	onSubmit,
}: ApplicationCreateFormProps) {
	function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault()
		onSubmit()
	}

	return (
		<form
			onSubmit={handleSubmit}
			className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm sm:p-6"
			noValidate
		>
			<p className="mb-6 text-xs font-medium uppercase tracking-wide text-neutral-500">
				{APPLICATION_CREATE_COPY.requiredHint}
			</p>

			<div className="space-y-6">
				<div className="grid gap-4 sm:grid-cols-2">
					<FormField
						id="create-application-company"
						label={APPLICATION_CREATE_COPY.companyNameLabel}
						required
						error={fieldErrors.companyName}
					>
						<Input
							id="create-application-company"
							autoComplete="organization"
							placeholder={APPLICATION_CREATE_COPY.companyNamePlaceholder}
							value={form.companyName}
							onChange={(e) =>
								onPatchForm({ companyName: e.target.value })
							}
							className={PROFILE_SURFACE.fieldInput}
							aria-invalid={!!fieldErrors.companyName}
						/>
					</FormField>

					<FormField
						id="create-application-job-title"
						label={APPLICATION_CREATE_COPY.jobTitleLabel}
						required
						error={fieldErrors.jobTitle}
					>
						<Input
							id="create-application-job-title"
							autoComplete="organization-title"
							placeholder={APPLICATION_CREATE_COPY.jobTitlePlaceholder}
							value={form.jobTitle}
							onChange={(e) => onPatchForm({ jobTitle: e.target.value })}
							className={PROFILE_SURFACE.fieldInput}
							aria-invalid={!!fieldErrors.jobTitle}
						/>
					</FormField>
				</div>

				<FormField
					id="create-application-job-url"
					label={APPLICATION_CREATE_COPY.jobUrlLabel}
					hint={APPLICATION_CREATE_COPY.jobUrlHint}
				>
					<Input
						id="create-application-job-url"
						type="url"
						inputMode="url"
						placeholder={APPLICATION_CREATE_COPY.jobUrlPlaceholder}
						value={form.jobUrl}
						onChange={(e) => onPatchForm({ jobUrl: e.target.value })}
						className={PROFILE_SURFACE.fieldInput}
					/>
				</FormField>

				<FormField
					id="create-application-job-description"
					label={APPLICATION_CREATE_COPY.jobDescriptionLabel}
					hint={APPLICATION_CREATE_COPY.jobDescriptionHint}
					error={fieldErrors.jobDescription}
					required
				>
					<Textarea
						id="create-application-job-description"
						rows={12}
						placeholder={
							APPLICATION_CREATE_COPY.jobDescriptionPlaceholder
						}
						value={form.jobDescription}
						onChange={(e) =>
							onPatchForm({ jobDescription: e.target.value })
						}
						className={PROFILE_SURFACE.fieldTextarea}
						aria-required
						aria-invalid={!!fieldErrors.jobDescription}
					/>
				</FormField>
			</div>

			<div className="mt-8 flex flex-col-reverse gap-3 border-t border-neutral-100 pt-6 sm:flex-row sm:justify-end">
				<Button
					type="submit"
					size="lg"
					className="gap-2 sm:min-w-[200px]"
					disabled={submitting}
				>
					{submitting ? (
						<Loader2 className="size-4 animate-spin" aria-hidden />
					) : (
						<Plus className="size-4" aria-hidden />
					)}
					{submitting
						? APPLICATION_CREATE_COPY.submittingLabel
						: APPLICATION_CREATE_COPY.submitLabel}
				</Button>
			</div>
		</form>
	)
}

interface FormFieldProps {
	id: string
	label: string
	required?: boolean
	hint?: string
	error?: string
	children: React.ReactNode
}

function FormField({
	id,
	label,
	required = false,
	hint,
	error,
	children,
}: FormFieldProps) {
	return (
		<div className="space-y-2">
			<Label htmlFor={id} className={PROFILE_SURFACE.fieldLabel}>
				{label}
				{required ? (
					<span className="text-red-600" aria-hidden>
						{" "}
						*
					</span>
				) : (
					<span className="font-normal text-neutral-500">
						{" "}
						(optional)
					</span>
				)}
			</Label>
			{children}
			{error ? (
				<p
					id={`${id}-error`}
					className="text-sm text-red-600"
					role="alert"
				>
					{error}
				</p>
			) : hint ? (
				<p
					id={`${id}-hint`}
					className={cn("text-xs", DASHBOARD_THEME.muted)}
				>
					{hint}
				</p>
			) : null}
		</div>
	)
}
