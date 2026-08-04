import type { KeyboardEvent, MouseEvent } from "react"
import { useNavigate } from "react-router-dom"
import {
	ExternalLink,
	FileText,
	Loader2,
	Mail,
} from "lucide-react"
import { ApplicationsStatusBadge } from "@/components/applications/applications-status-badge"
import { DeleteApplicationControl } from "@/components/applications/delete-application-control"
import { Button } from "@/components/ui/button"
import {
	APPLICATION_STATUSES,
	type ApplicationStatus,
	isApplicationStatus,
} from "@/lib/application-status"
import {
	formatApplicationAddedRelative,
	getApplicationCompanyInitials,
	getApplicationDocumentFlags,
	getJobDescriptionPreview,
} from "@/lib/application-display"
import { APPLICATIONS_THEME } from "@/lib/applications-theme"
import { applicationDetailPath } from "@/lib/constants"
import type { ApplicationWithDocuments } from "@/types/database"
import { cn } from "@/lib/utils"

interface ApplicationCardProps {
	app: ApplicationWithDocuments
	status: ApplicationStatus
	isUpdating: boolean
	isDeleting: boolean
	resumeLoading: boolean
	coverLoading: boolean
	onStatusChange: (status: ApplicationStatus) => void
	onDelete: (applicationId: string) => Promise<{
		success: boolean
		message: string
	}>
}

export function ApplicationCard({
	app,
	status,
	isUpdating,
	isDeleting,
	onStatusChange,
	onDelete,
}: ApplicationCardProps) {
	const navigate = useNavigate()
	const detailPath = applicationDetailPath(app.id)
	const { hasCover } = getApplicationDocumentFlags(app)
	const descriptionPreview = getJobDescriptionPreview(app.job_description)
	const companyInitials = getApplicationCompanyInitials(app.company_name)
	const addedLabel = formatApplicationAddedRelative(app.created_at)
	const jobTitle = app.job_title?.trim() || "Untitled role"
	const companyName = app.company_name?.trim() || "Unknown company"

	function openDetail() {
		navigate(detailPath)
	}

	function handleCardKeyDown(event: KeyboardEvent<HTMLElement>) {
		if (event.key === "Enter" || event.key === " ") {
			event.preventDefault()
			openDetail()
		}
	}

	function stopCardActivation(event: MouseEvent) {
		event.stopPropagation()
	}

	return (
		<article
			role="link"
			tabIndex={0}
			aria-label={`Open ${jobTitle} at ${companyName}`}
			onClick={openDetail}
			onKeyDown={handleCardKeyDown}
			className={cn(
				APPLICATIONS_THEME.applicationCard,
				"group cursor-pointer",
			)}
		>
			<div className="flex items-start gap-3">
				<div
					className={APPLICATIONS_THEME.applicationCardAvatar}
					aria-hidden
				>
					{companyInitials}
				</div>

				<div className="min-w-0 flex-1">
					<div className="flex items-start justify-between gap-2">
						<div className="min-w-0">
							<h2 className={APPLICATIONS_THEME.applicationCardTitle}>
								{jobTitle}
							</h2>
							<p className={APPLICATIONS_THEME.applicationCardCompany}>
								{companyName}
							</p>
						</div>
						<span className="mt-1 shrink-0 text-xs text-neutral-400 transition-colors group-hover:text-primary">
							Open
						</span>
					</div>

					<div className="mt-3 flex flex-wrap items-center gap-2">
						<ApplicationsStatusBadge status={status} />
						<span className="text-xs text-neutral-500">{addedLabel}</span>
					</div>
				</div>
			</div>

			{descriptionPreview ? (
				<p className="mt-4 line-clamp-2 text-sm leading-relaxed text-neutral-600">
					{descriptionPreview}
				</p>
			) : (
				<p className="mt-4 text-sm text-neutral-400">
					No job description saved yet.
				</p>
			)}

			<div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs">
				<DocumentPresence
					label="Resume"
					icon={FileText}
					ready={true}
				/>
				<DocumentPresence
					label="Cover letter"
					icon={Mail}
					ready={hasCover}
				/>
			</div>

			<div
				className="mt-4 flex flex-wrap items-center gap-2 border-t border-neutral-100 pt-3"
				onClick={stopCardActivation}
				onKeyDown={(event) => event.stopPropagation()}
			>
				<label className="sr-only" htmlFor={`status-${app.id}`}>
					Update status for {jobTitle}
				</label>
				<select
					id={`status-${app.id}`}
					aria-label={`Update status for ${jobTitle}`}
					className={cn(APPLICATIONS_THEME.select, "min-w-[8.5rem]")}
					value={status}
					disabled={isUpdating}
					onChange={(event) => {
						const value = event.target.value
						if (isApplicationStatus(value)) onStatusChange(value)
					}}
					onClick={stopCardActivation}
				>
					{APPLICATION_STATUSES.map((option) => (
						<option key={option} value={option}>
							{option}
						</option>
					))}
				</select>

				{isUpdating ? (
					<Loader2
						className="size-4 shrink-0 animate-spin text-primary"
						aria-hidden
					/>
				) : null}

				<div className="ml-auto flex items-center gap-1">
					{app.job_url ? (
						<Button
							type="button"
							variant="ghost"
							size="sm"
							className="h-8 gap-1.5 px-2 text-neutral-500"
							asChild
						>
							<a
								href={app.job_url}
								target="_blank"
								rel="noopener noreferrer"
								onClick={stopCardActivation}
							>
								<ExternalLink className="size-3.5" aria-hidden />
								<span className="hidden sm:inline">Posting</span>
							</a>
						</Button>
					) : null}

					<DeleteApplicationControl
						applicationId={app.id}
						jobTitle={app.job_title}
						companyName={app.company_name}
						isDeleting={isDeleting}
						onDelete={onDelete}
						variant="table"
					/>
				</div>
			</div>
		</article>
	)
}

function DocumentPresence({
	label,
	icon: Icon,
	ready,
}: {
	label: string
	icon: typeof FileText
	ready: boolean
}) {
	return (
		<span
			className={cn(
				"inline-flex items-center gap-1.5",
				ready ? "font-medium text-emerald-700" : "text-neutral-400",
			)}
		>
			<Icon className="size-3.5" aria-hidden />
			{label}
			<span className="font-normal">
				{ready ? "ready" : "not yet"}
			</span>
		</span>
	)
}

// function DocumentDownloadButton({
// 	label,
// 	available,
// 	loading,
// 	onClick,
// }: {
// 	label: string
// 	available: boolean
// 	loading: boolean
// 	onClick: () => void
// }) {
// 	return (
// 		<button
// 			type="button"
// 			title={available ? label : `${label} (not available)`}
// 			className={cn(
// 				APPLICATIONS_THEME.iconButton,
// 				available && "text-primary",
// 			)}
// 			disabled={!available || loading}
// 			onClick={onClick}
// 		>
// 			{loading ? (
// 				<Loader2 className="size-4 animate-spin" aria-hidden />
// 			) : (
// 				<Download className="size-4" aria-hidden />
// 			)}
// 			<span className="sr-only">{label}</span>
// 		</button>
// 	)
// }
