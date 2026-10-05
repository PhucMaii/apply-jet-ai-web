import { useId, type FormEvent, type ReactNode } from "react"
import { Link } from "react-router-dom"
import { Loader2 } from "lucide-react"
import Modal from "@/components/ui/modal"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useCreateApplication } from "@/hooks/use-create-application"
import { APPLICATION_CREATE_COPY } from "@/lib/application-create-copy"
import { APPLICATIONS_COPY } from "@/lib/applications-copy"
import { ROUTES } from "@/lib/constants"

interface QuickAddApplicationModalProps {
	isOpen: boolean
	onClose: () => void
}

function ModalHead({ titleId }: { titleId: string }) {
	return (
		<div className="pr-8">
			<h2 id={titleId} className="font-display text-xl font-semibold text-ink">
				{APPLICATIONS_COPY.quickAddTitle}
			</h2>
			<p className="mt-1 text-sm text-ink-muted">
				{APPLICATIONS_COPY.quickAddDescription}
			</p>
		</div>
	)
}

function BoxModal({ children }: { children: ReactNode }) {
	return <div className="flex flex-col gap-5">{children}</div>
}

function Field({
	id,
	label,
	isOptional = false,
	children,
}: {
	id: string
	label: string
	isOptional?: boolean
	children: ReactNode
}) {
	return (
		<div className="space-y-1.5">
			<Label htmlFor={id} className="text-sm font-medium text-ink">
				{label}
				{isOptional ? (
					<span className="ml-1 font-normal text-ink-subtle">(optional)</span>
				) : null}
			</Label>
			{children}
		</div>
	)
}

export function QuickAddApplicationModal({
	isOpen,
	onClose,
}: QuickAddApplicationModalProps) {
	const titleId = useId()
	const fieldId = useId()
	const {
		form: values,
		patchForm: patch,
		fieldErrors,
		error,
		submitting,
		submit,
	} = useCreateApplication()

	const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault()
		void submit()
	}

	return (
		<Modal isOpen={isOpen} onClose={onClose} labelledBy={titleId} size="lg">
			<BoxModal>
				<ModalHead titleId={titleId} />
				<form className="flex flex-col gap-4" noValidate onSubmit={handleSubmit}>
					<div className="grid gap-4 sm:grid-cols-2">
						<Field id={`${fieldId}-title`} label={APPLICATION_CREATE_COPY.jobTitleLabel}>
							<Input
								id={`${fieldId}-title`}
								value={values.jobTitle}
								onChange={(event) => patch({ jobTitle: event.target.value })}
								placeholder={APPLICATION_CREATE_COPY.jobTitlePlaceholder}
								error={fieldErrors.jobTitle}
								autoComplete="off"
							/>
						</Field>
						<Field id={`${fieldId}-company`} label={APPLICATION_CREATE_COPY.companyNameLabel}>
							<Input
								id={`${fieldId}-company`}
								value={values.companyName}
								onChange={(event) => patch({ companyName: event.target.value })}
								placeholder={APPLICATION_CREATE_COPY.companyNamePlaceholder}
								error={fieldErrors.companyName}
								autoComplete="organization"
							/>
						</Field>
					</div>
					<Field id={`${fieldId}-url`} label={APPLICATION_CREATE_COPY.jobUrlLabel} isOptional>
						<Input
							id={`${fieldId}-url`}
							type="url"
							inputMode="url"
							value={values.jobUrl}
							onChange={(event) => patch({ jobUrl: event.target.value })}
							placeholder={APPLICATION_CREATE_COPY.jobUrlPlaceholder}
						/>
					</Field>
					<Field id={`${fieldId}-description`} label={APPLICATION_CREATE_COPY.jobDescriptionLabel}>
						<Textarea
							id={`${fieldId}-description`}
							value={values.jobDescription}
							onChange={(event) => patch({ jobDescription: event.target.value })}
							placeholder={APPLICATION_CREATE_COPY.jobDescriptionPlaceholder}
							error={fieldErrors.jobDescription}
							className="min-h-[140px]"
						/>
					</Field>

					{error ? (
						<p className="rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700" role="alert">
							{error}
						</p>
					) : null}

					<div className="flex flex-col-reverse gap-2 pt-1 sm:flex-row sm:items-center sm:justify-between">
						<Button variant="link" size="sm" asChild>
							<Link to={ROUTES.applicationCreate}>{APPLICATIONS_COPY.fullForm}</Link>
						</Button>
						<Button type="submit" disabled={submitting}>
							{submitting ? <Loader2 className="animate-spin" aria-hidden /> : null}
							{submitting
								? APPLICATIONS_COPY.quickAddSubmitting
								: APPLICATIONS_COPY.quickAddSubmit}
						</Button>
					</div>
				</form>
			</BoxModal>
		</Modal>
	)
}
