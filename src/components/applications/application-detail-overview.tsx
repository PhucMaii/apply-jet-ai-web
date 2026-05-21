import { useState } from "react"
import {
	ChevronDown,
	ExternalLink,
	Loader2,
	Save,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ApplicationsStatusBadge } from "@/components/applications/applications-status-badge"
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

interface ApplicationDetailOverviewProps {
	form: ApplicationDetailForm
	status: ApplicationStatus
	updatingStatus: boolean
	savingDetails: boolean
	createdAt: string
	onPatchForm: (patch: Partial<ApplicationDetailForm>) => void
	onStatusChange: (status: ApplicationStatus) => void
	onSaveDetails: () => void
}

export function ApplicationDetailOverview({
	form,
	status,
	updatingStatus,
	savingDetails,
	createdAt,
	onPatchForm,
	onStatusChange,
	onSaveDetails,
}: ApplicationDetailOverviewProps) {
	const [descriptionOpen, setDescriptionOpen] = useState(true)
	const addedLabel = new Date(createdAt).toLocaleString(undefined, {
		dateStyle: "medium",
		timeStyle: "short",
	})

	return (
		<section className="space-y-6">
			<div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
				<div className="min-w-0 flex-1 space-y-3">
					<div className="grid gap-4 sm:grid-cols-2">
						<div className="space-y-2">
							<Label
								htmlFor="application-job-title"
								className={PROFILE_SURFACE.fieldLabel}
							>
								Job title
							</Label>
							<Input
								id="application-job-title"
								value={form.jobTitle}
								onChange={(e) =>
									onPatchForm({ jobTitle: e.target.value })
								}
								className={PROFILE_SURFACE.fieldInput}
							/>
						</div>
						<div className="space-y-2">
							<Label
								htmlFor="application-company"
								className={PROFILE_SURFACE.fieldLabel}
							>
								Company name
							</Label>
							<Input
								id="application-company"
								value={form.companyName}
								onChange={(e) =>
									onPatchForm({ companyName: e.target.value })
								}
								className={PROFILE_SURFACE.fieldInput}
							/>
						</div>
					</div>
					<p className={`text-xs ${DASHBOARD_THEME.muted}`}>
						Added {addedLabel}
					</p>
				</div>

				<div className="flex shrink-0 flex-col gap-2 sm:items-end">
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
							onChange={(e) => {
								const v = e.target.value
								if (isApplicationStatus(v)) onStatusChange(v)
							}}
						>
							{APPLICATION_STATUSES.map((s) => (
								<option key={s} value={s}>
									{s}
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
			</div>

			<div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
				<div className="space-y-2">
					<Label
						htmlFor="application-job-url"
						className={PROFILE_SURFACE.fieldLabel}
					>
						Job posting URL
					</Label>
					<div className="flex flex-col gap-2 sm:flex-row sm:items-center">
						<Input
							id="application-job-url"
							type="url"
							placeholder="https://…"
							value={form.jobUrl}
							onChange={(e) => onPatchForm({ jobUrl: e.target.value })}
							className={cn(PROFILE_SURFACE.fieldInput, "flex-1")}
						/>
						{form.jobUrl.trim() ? (
							<a
								href={form.jobUrl.trim()}
								target="_blank"
								rel="noopener noreferrer"
								className={cn(
									APPLICATIONS_THEME.link,
									"inline-flex shrink-0 items-center gap-1 text-sm",
								)}
							>
								Open posting
								<ExternalLink className="size-3.5" aria-hidden />
							</a>
						) : null}
					</div>
				</div>
			</div>

			<div className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm">
				<button
					type="button"
					className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition-colors hover:bg-neutral-50"
					aria-expanded={descriptionOpen}
					onClick={() => setDescriptionOpen((open) => !open)}
				>
					<span className="text-sm font-semibold text-neutral-900">
						Job description
					</span>
					<ChevronDown
						className={cn(
							"size-4 shrink-0 text-neutral-500 transition-transform",
							descriptionOpen && "rotate-180",
						)}
						aria-hidden
					/>
				</button>
				{descriptionOpen ? (
					<div className="border-t border-neutral-100 px-4 pb-4 pt-3">
						<Textarea
							id="application-job-description"
							rows={10}
							placeholder="Paste or edit the job description for tailoring…"
							value={form.jobDescription}
							onChange={(e) =>
								onPatchForm({ jobDescription: e.target.value })
							}
							className={PROFILE_SURFACE.fieldTextarea}
						/>
					</div>
				) : null}
			</div>

			<div className="flex justify-end">
				<Button
					type="button"
					className="gap-2"
					disabled={savingDetails}
					onClick={onSaveDetails}
				>
					{savingDetails ? (
						<Loader2 className="size-4 animate-spin" aria-hidden />
					) : (
						<Save className="size-4" aria-hidden />
					)}
					Save details
				</Button>
			</div>
		</section>
	)
}
