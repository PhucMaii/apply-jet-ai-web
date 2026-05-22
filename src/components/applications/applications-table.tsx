import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import {
	ChevronDown,
	Download,
	ExternalLink,
	FileText,
	Loader2,
	Mail,
} from "lucide-react"
import { applicationDetailPath } from "@/lib/constants"
import { Button } from "@/components/ui/button"
import {
	APPLICATION_STATUSES,
	type ApplicationStatus,
	isApplicationStatus,
} from "@/lib/application-status"
import { APPLICATIONS_THEME } from "@/lib/applications-theme"
import type { ApplicationWithDocuments } from "@/types/database"
import { cn } from "@/lib/utils"
import { ApplicationsStatusBadge } from "./applications-status-badge"
import type { GeneratedDocumentRow } from "@/types/application-detail"

const TABLE_COLUMN = {
	job: "Job title",
	company: "Company",
	status: "Status",
	added: "Added",
	posting: "Posting",
	documents: "Documents",
	details: "Details",
} as const

interface ApplicationsTableProps {
	rows: ApplicationWithDocuments[]
	updatingId: string | null
	downloading: string | null
	resolveStatus: (raw: string) => ApplicationStatus
	onStatusChange: (id: string, status: ApplicationStatus) => void
	onDownloadResume: (application: ApplicationWithDocuments, generatedResume: GeneratedDocumentRow, companyName: string) => void
	onDownloadCover: (application: ApplicationWithDocuments, generatedCoverLetter: GeneratedDocumentRow, companyName: string) => void
}

export function ApplicationsTable({
	rows,
	updatingId,
	downloading,
	resolveStatus,
	onStatusChange,
	onDownloadResume,
	onDownloadCover,
}: ApplicationsTableProps) {
	const navigate = useNavigate()
	const [expandedId, setExpandedId] = useState<string | null>(null)

	function toggleExpanded(id: string) {
		setExpandedId((prev) => (prev === id ? null : id))
	}

	return (
		<div className={APPLICATIONS_THEME.tableWrap}>
			<div className={APPLICATIONS_THEME.tableScroll}>
				<table className={APPLICATIONS_THEME.table}>
					<thead className={APPLICATIONS_THEME.thead}>
						<tr>
							{Object.values(TABLE_COLUMN).map((label) => (
								<th key={label} scope="col" className={APPLICATIONS_THEME.th}>
									{label}
								</th>
							))}
						</tr>
					</thead>
					<tbody>
						{rows.map((app) => {
							const status = resolveStatus(app.status)
							const isExpanded = expandedId === app.id
							const resumeId = app.generated_resume_id
							const coverId = app.generated_cover_letter_id
							const hasResume = Boolean(resumeId)
							const hasCover = Boolean(coverId)
							const isUpdating = updatingId === app.id
							const resumeLoading = downloading === `resume-${app.id}`
							const coverLoading = downloading === `cover-${app.id}`

							return (
								<ApplicationTableRowGroup
									key={app.id}
									app={app}
									status={status}
									isExpanded={isExpanded}
									isUpdating={isUpdating}
									hasResume={hasResume}
									hasCover={hasCover}
									resumeId={resumeId}
									coverId={coverId}
									resumeLoading={resumeLoading}
									coverLoading={coverLoading}
									onOpen={() => navigate(applicationDetailPath(app.id))}
									onToggleExpanded={() => toggleExpanded(app.id)}
									onStatusChange={(next) => onStatusChange(app.id, next)}
									onDownloadResume={() => {
										if (resumeId)
											onDownloadResume(app, app.generated_resume as GeneratedDocumentRow, app.company_name)
									}}
									onDownloadCover={() => {
										if (coverId) onDownloadCover(app, app.generated_cover_letter as GeneratedDocumentRow, app.company_name)
									}}
								/>
							)
						})}
					</tbody>
				</table>
			</div>
		</div>
	)
}

interface ApplicationTableRowGroupProps {
	app: ApplicationWithDocuments
	status: ApplicationStatus
	isExpanded: boolean
	isUpdating: boolean
	hasResume: boolean
	hasCover: boolean
	resumeId: string | null
	coverId: string | null
	resumeLoading: boolean
	coverLoading: boolean
	onOpen: () => void
	onToggleExpanded: () => void
	onStatusChange: (status: ApplicationStatus) => void
	onDownloadResume: () => void
	onDownloadCover: () => void
}

function ApplicationTableRowGroup({
	app,
	status,
	isExpanded,
	isUpdating,
	hasResume,
	hasCover,
	resumeLoading,
	coverLoading,
	onOpen,
	onToggleExpanded,
	onStatusChange,
	onDownloadResume,
	onDownloadCover,
}: ApplicationTableRowGroupProps) {
	const addedLabel = new Date(app.created_at).toLocaleString(undefined, {
		dateStyle: "medium",
		timeStyle: "short",
	})

	return (
		<>
			<tr
				className={cn(
					APPLICATIONS_THEME.row,
					isExpanded && APPLICATIONS_THEME.rowExpanded,
					"cursor-pointer",
				)}
				onClick={onOpen}
				onKeyDown={(e) => {
					if (e.key === "Enter" || e.key === " ") {
						e.preventDefault()
						onOpen()
					}
				}}
				tabIndex={0}
				role="link"
				aria-label={`Open ${app.job_title} at ${app.company_name}`}
			>
				<td className={cn(APPLICATIONS_THEME.td, "font-medium")}>
					<Link
						to={applicationDetailPath(app.id)}
						className={cn(APPLICATIONS_THEME.link, "hover:underline")}
						onClick={(e) => e.stopPropagation()}
					>
						{app.job_title}
					</Link>
				</td>
				<td className={APPLICATIONS_THEME.td}>{app.company_name}</td>
				<td
					className={APPLICATIONS_THEME.td}
					onClick={(e) => e.stopPropagation()}
				>
					<div className="flex flex-col gap-2 sm:flex-row sm:items-center">
						<ApplicationsStatusBadge status={status} />
						<select
							aria-label={`Update status for ${app.job_title}`}
							className={APPLICATIONS_THEME.select}
							value={status}
							disabled={isUpdating}
							onChange={(e) => {
								const v = e.target.value
								if (isApplicationStatus(v)) onStatusChange(v)
							}}
							onClick={(e) => e.stopPropagation()}
						>
							{APPLICATION_STATUSES.map((s) => (
								<option key={s} value={s}>
									{s}
								</option>
							))}
						</select>
						{isUpdating ? (
							<Loader2
								className="size-4 shrink-0 animate-spin text-primary"
								aria-hidden
							/>
						) : null}
					</div>
				</td>
				<td className={cn(APPLICATIONS_THEME.td, APPLICATIONS_THEME.muted)}>
					{addedLabel}
				</td>
				<td
					className={APPLICATIONS_THEME.td}
					onClick={(e) => e.stopPropagation()}
				>
					{app.job_url ? (
						<a
							href={app.job_url}
							target="_blank"
							rel="noopener noreferrer"
							className={APPLICATIONS_THEME.link}
							onClick={(e) => e.stopPropagation()}
						>
							View
							<ExternalLink className="size-3.5" aria-hidden />
						</a>
					) : (
						<span className={APPLICATIONS_THEME.muted}>—</span>
					)}
				</td>
				<td
					className={APPLICATIONS_THEME.td}
					onClick={(e) => e.stopPropagation()}
				>
					<div className="flex items-center gap-1.5">
						<DocumentDownloadButton
							label="Download resume"
							icon={FileText}
							available={hasResume}
							loading={resumeLoading}
							onClick={onDownloadResume}
						/>
						<DocumentDownloadButton
							label="Download cover letter"
							icon={Mail}
							available={hasCover}
							loading={coverLoading}
							onClick={onDownloadCover}
						/>
					</div>
				</td>
				<td
					className={APPLICATIONS_THEME.td}
					onClick={(e) => e.stopPropagation()}
				>
					<div className="flex items-center gap-1">
						<Button
							type="button"
							variant="ghost"
							size="sm"
							className="h-8 gap-1 px-2"
							aria-expanded={isExpanded}
							onClick={onToggleExpanded}
						>
							{isExpanded ? "Hide" : "Preview"}
							<ChevronDown
								className={cn(
									"size-4 transition-transform",
									isExpanded && "rotate-180",
								)}
								aria-hidden
							/>
						</Button>
						<Button
							type="button"
							variant="outline"
							size="sm"
							className="h-8"
							asChild
						>
							<Link to={applicationDetailPath(app.id)}>Open</Link>
						</Button>
					</div>
				</td>
			</tr>
			{isExpanded ? (
				<tr>
					<td colSpan={7} className={APPLICATIONS_THEME.detailCell}>
						<p className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-500">
							Job description
						</p>
						{app.job_description ? (
							<pre className="thin-scrollbar max-h-56 overflow-y-auto whitespace-pre-wrap font-sans text-sm leading-relaxed text-neutral-700">
								{app.job_description}
							</pre>
						) : (
							<p className={`text-sm ${APPLICATIONS_THEME.muted}`}>
								No description stored for this application.
							</p>
						)}
					</td>
				</tr>
			) : null}
		</>
	)
}

interface DocumentDownloadButtonProps {
	label: string
	icon: typeof FileText
	available: boolean
	loading: boolean
	onClick: () => void
}

function DocumentDownloadButton({
	label,
	icon: Icon,
	available,
	loading,
	onClick,
}: DocumentDownloadButtonProps) {
	return (
		<button
			type="button"
			title={available ? label : `${label} (not available)`}
			className={cn(
				APPLICATIONS_THEME.iconButton,
				available && "text-primary",
			)}
			disabled={!available || loading}
			onClick={onClick}
		>
			{loading ? (
				<Loader2 className="size-4 animate-spin" aria-hidden />
			) : available ? (
				<Download className="size-4" aria-hidden />
			) : (
				<Icon className="size-4 opacity-40" aria-hidden />
			)}
			<span className="sr-only">{label}</span>
		</button>
	)
}
