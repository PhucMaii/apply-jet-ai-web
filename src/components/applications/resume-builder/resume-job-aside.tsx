import {
	ExternalLink,
	Loader2,
	Pencil,
	Save,
	Sparkles,
} from "lucide-react"
import { ApplicationsStatusBadge } from "@/components/applications/applications-status-badge"
import { DeleteApplicationControl } from "@/components/applications/delete-application-control"
import { AccordionPanel } from "@/components/applications/resume-builder/accordion-panel"
import { ScoreGauge } from "@/components/applications/resume-builder/score-gauge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
	APPLICATION_STATUSES,
	type ApplicationStatus,
	isApplicationStatus,
} from "@/lib/application-status"
import { APPLICATIONS_THEME } from "@/lib/applications-theme"
import { DASHBOARD_THEME } from "@/lib/dashboard-theme"
import { PROFILE_SURFACE } from "@/lib/profile-surface"
import type { ApplicationDetailForm } from "@/types/application-detail"
import { cn } from "@/lib/utils"
import { hasCompleteJobDetails } from "@/components/applications/resume-builder/app-resume-utils"

interface ResumeJobAsideProps {
	form: ApplicationDetailForm
	status: ApplicationStatus
	createdAt: string
	savingDetails: boolean
	updatingStatus: boolean
	isDeleting: boolean
	showJobForm: boolean
	issueTotal: number
	keywordsOpen: boolean
	contentOpen: boolean
	onToggleKeywords: () => void
	onToggleContent: () => void
	onEditJob: () => void
	onDoneEditingJob: () => void
	onSaveJobDetails: () => void
	onPatchForm: (patch: Partial<ApplicationDetailForm>) => void
	onStatusChange: (status: ApplicationStatus) => void
	onDelete?: (applicationId: string) => Promise<{
		success: boolean
		message: string
	}>
	onGenerate: () => void
}

export function ResumeJobAside({
	form,
	status,
	createdAt,
	savingDetails,
	updatingStatus,
	isDeleting,
	showJobForm,
	issueTotal,
	keywordsOpen,
	contentOpen,
	onToggleKeywords,
	onToggleContent,
	onEditJob,
	onDoneEditingJob,
	onSaveJobDetails,
	onPatchForm,
	onStatusChange,
	onDelete,
	onGenerate,
}: ResumeJobAsideProps) {
	const jobDetailsComplete = hasCompleteJobDetails(form)
	const addedLabel = new Date(createdAt).toLocaleString(undefined, {
		dateStyle: "medium",
		timeStyle: "short",
	})

	return (
		<aside className="flex max-h-72 min-h-0 shrink-0 flex-col overflow-hidden border-t border-neutral-200 bg-white xl:max-h-none xl:h-full xl:border-t-0 xl:border-l">
			<div className="min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain p-4">
				{showJobForm ? (
					<div className="space-y-4">
						<div className="space-y-1">
							<p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
								Job details
							</p>
							<p className={`text-xs ${DASHBOARD_THEME.muted}`}>
								{jobDetailsComplete
									? "Edit the role you are targeting."
									: "Add title, company, and description to unlock scoring."}
							</p>
							<p className={`text-xs ${DASHBOARD_THEME.muted}`}>
								Added {addedLabel}
							</p>
						</div>

						<div className="space-y-2">
							<span className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
								Status
							</span>
							<div className="flex flex-wrap items-center gap-2">
								<ApplicationsStatusBadge status={status} />
								<select
									aria-label="Application status"
									className={APPLICATIONS_THEME.select}
									value={status}
									disabled={updatingStatus}
									onChange={(event) => {
										const value = event.target.value
										if (isApplicationStatus(value)) {
											onStatusChange(value)
										}
									}}
								>
									{APPLICATION_STATUSES.map((item) => (
										<option key={item} value={item}>
											{item}
										</option>
									))}
								</select>
								{updatingStatus ? (
									<Loader2
										className="size-4 animate-spin text-primary"
										aria-hidden
									/>
								) : null}
							</div>
						</div>

						<div className="space-y-2">
							<Label
								htmlFor="resume-job-title"
								className={PROFILE_SURFACE.fieldLabel}
							>
								Job title
							</Label>
							<Input
								id="resume-job-title"
								value={form.jobTitle}
								onChange={(event) =>
									onPatchForm({ jobTitle: event.target.value })
								}
								className={PROFILE_SURFACE.fieldInput}
								placeholder="e.g. Senior Software Engineer"
							/>
						</div>

						<div className="space-y-2">
							<Label
								htmlFor="resume-company"
								className={PROFILE_SURFACE.fieldLabel}
							>
								Company name
							</Label>
							<Input
								id="resume-company"
								value={form.companyName}
								onChange={(event) =>
									onPatchForm({ companyName: event.target.value })
								}
								className={PROFILE_SURFACE.fieldInput}
								placeholder="e.g. Acme Corp"
							/>
						</div>

						<div className="space-y-2">
							<Label
								htmlFor="resume-job-url"
								className={PROFILE_SURFACE.fieldLabel}
							>
								Job posting URL
							</Label>
							<div className="flex flex-col gap-2">
								<Input
									id="resume-job-url"
									type="url"
									placeholder="https://…"
									value={form.jobUrl}
									onChange={(event) =>
										onPatchForm({ jobUrl: event.target.value })
									}
									className={PROFILE_SURFACE.fieldInput}
								/>
								{form.jobUrl.trim() ? (
									<a
										href={form.jobUrl.trim()}
										target="_blank"
										rel="noopener noreferrer"
										className={cn(
											DASHBOARD_THEME.link,
											"inline-flex items-center gap-1 text-sm",
										)}
									>
										Open posting
										<ExternalLink className="size-3.5" aria-hidden />
									</a>
								) : null}
							</div>
						</div>

						<div className="space-y-2">
							<Label
								htmlFor="resume-job-description"
								className={PROFILE_SURFACE.fieldLabel}
							>
								Job description
							</Label>
							<Textarea
								id="resume-job-description"
								rows={8}
								placeholder="Paste the job description…"
								value={form.jobDescription}
								onChange={(event) =>
									onPatchForm({ jobDescription: event.target.value })
								}
								className={cn(
									PROFILE_SURFACE.fieldTextarea,
									"min-h-[160px] resize-y",
								)}
							/>
						</div>

						<div className="flex flex-col gap-2">
							<Button
								type="button"
								className="w-full gap-2"
								disabled={savingDetails || !jobDetailsComplete}
								onClick={onSaveJobDetails}
							>
								{savingDetails ? (
									<Loader2 className="size-4 animate-spin" aria-hidden />
								) : (
									<Save className="size-4" aria-hidden />
								)}
								Save details
							</Button>
							{jobDetailsComplete ? (
								<Button
									type="button"
									variant="outline"
									className="w-full"
									onClick={onDoneEditingJob}
								>
									Done editing
								</Button>
							) : (
								<p className="text-center text-xs text-amber-700">
									Title, company, and description are required.
								</p>
							)}
							{onDelete ? (
								<div className="pt-1">
									<DeleteApplicationControl
										applicationId={form.id}
										jobTitle={form.jobTitle}
										companyName={form.companyName}
										isDeleting={isDeleting}
										onDelete={onDelete}
										redirectOnSuccess
										variant="detail"
									/>
								</div>
							) : null}
						</div>
					</div>
				) : (
					<>
						<div className="rounded-xl border border-neutral-200 bg-neutral-50/80 p-3">
							<div className="flex items-start justify-between gap-2">
								<div className="min-w-0">
									<p className="truncate text-sm font-semibold text-neutral-900">
										{form.jobTitle}
									</p>
									<p className="truncate text-xs text-neutral-600">
										{form.companyName}
									</p>
								</div>
								<Button
									type="button"
									size="sm"
									variant="ghost"
									className="shrink-0 gap-1.5"
									onClick={onEditJob}
								>
									<Pencil className="size-3.5" aria-hidden />
									Edit
								</Button>
							</div>
						</div>

						<ScoreGauge score={0} issues={issueTotal} />
						<Button
							type="button"
							className="w-full gap-2"
							onClick={onGenerate}
						>
							<Sparkles className="size-4" aria-hidden />
							Generate Tailored Resume
						</Button>
						<AccordionPanel
							title="Keywords Match"
							count={0}
							open={keywordsOpen}
							onToggle={onToggleKeywords}
						>
							<p className="text-sm text-neutral-500">
								Keyword insights will appear after you generate a tailored
								resume.
							</p>
						</AccordionPanel>
						<AccordionPanel
							title="Content Strength"
							count={issueTotal}
							open={contentOpen}
							onToggle={onToggleContent}
						>
							{issueTotal > 0 ? (
								<ul className="space-y-2 text-sm text-neutral-600">
									<li>
										Review highlighted sections for content improvements.
									</li>
								</ul>
							) : (
								<p className="text-sm text-neutral-500">
									No content issues detected yet.
								</p>
							)}
						</AccordionPanel>
					</>
				)}
			</div>
		</aside>
	)
}
