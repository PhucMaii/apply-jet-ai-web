import { useMemo, useState } from "react"
import { ApplicationCard } from "@/components/applications/application-card"
import {
	APPLICATION_STATUSES,
	type ApplicationStatus,
} from "@/lib/application-status"
import {
	countApplicationsByStatus,
	filterApplicationsByStatus,
} from "@/lib/application-display"
import { APPLICATIONS_THEME } from "@/lib/applications-theme"
import type { GeneratedDocumentRow } from "@/types/application-detail"
import type { ApplicationWithDocuments } from "@/types/database"
import { cn } from "@/lib/utils"

type StatusFilter = ApplicationStatus | "all"

interface ApplicationsCardGridProps {
	rows: ApplicationWithDocuments[]
	updatingId: string | null
	downloading: string | null
	deletingId: string | null
	resolveStatus: (raw: string) => ApplicationStatus
	onStatusChange: (id: string, status: ApplicationStatus) => void
	onDownloadResume: (
		application: ApplicationWithDocuments,
		generatedResume: GeneratedDocumentRow,
		companyName: string,
	) => void
	onDownloadCover: (
		application: ApplicationWithDocuments,
		generatedCoverLetter: GeneratedDocumentRow,
		companyName: string,
	) => void
	onDelete: (applicationId: string) => Promise<{
		success: boolean
		message: string
	}>
}

export function ApplicationsCardGrid({
	rows,
	updatingId,
	downloading,
	deletingId,
	resolveStatus,
	onStatusChange,
	onDownloadResume,
	onDownloadCover,
	onDelete,
}: ApplicationsCardGridProps) {
	const [statusFilter, setStatusFilter] = useState<StatusFilter>("all")

	const statusCounts = useMemo(
		() => countApplicationsByStatus(rows, resolveStatus),
		[rows, resolveStatus],
	)

	const visibleRows = useMemo(
		() => filterApplicationsByStatus(rows, statusFilter, resolveStatus),
		[rows, statusFilter, resolveStatus],
	)

	const filterOptions: Array<{ value: StatusFilter; label: string }> = [
		{ value: "all", label: "All" },
		...APPLICATION_STATUSES.map((status) => ({
			value: status,
			label: status,
		})),
	]

	return (
		<section className="space-y-5" aria-label="Applications">
			<div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
				<div>
					<p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
						Your pipeline
					</p>
					<p className="mt-1 text-sm text-neutral-600">
						{statusFilter === "all"
							? `${rows.length} application${rows.length === 1 ? "" : "s"}`
							: `${visibleRows.length} of ${rows.length} · ${statusFilter}`}
					</p>
				</div>

				<div
					className="flex flex-wrap gap-1.5"
					role="tablist"
					aria-label="Filter by status"
				>
					{filterOptions.map((option) => {
						const selected = statusFilter === option.value
						const count = statusCounts[option.value]
						return (
							<button
								key={option.value}
								type="button"
								role="tab"
								aria-selected={selected}
								onClick={() => setStatusFilter(option.value)}
								className={cn(
									APPLICATIONS_THEME.filterChip,
									selected && APPLICATIONS_THEME.filterChipActive,
								)}
							>
								{option.label}
								<span
									className={cn(
										"ml-1.5 tabular-nums",
										selected ? "text-primary" : "text-neutral-400",
									)}
								>
									{count}
								</span>
							</button>
						)
					})}
				</div>
			</div>

			{visibleRows.length === 0 ? (
				<div className={APPLICATIONS_THEME.emptyFilter}>
					<p className="text-sm font-medium text-neutral-800">
						No applications with this status
					</p>
					<p className={`mt-1 text-sm ${APPLICATIONS_THEME.muted}`}>
						Try another filter, or create a new application.
					</p>
				</div>
			) : (
				<div className={APPLICATIONS_THEME.applicationCardGrid}>
					{visibleRows.map((app) => {
						const status = resolveStatus(app.status)
						const resumeDoc = app.generated_resume as
							| GeneratedDocumentRow
							| null
							| undefined
						const coverDoc = app.generated_cover_letter as
							| GeneratedDocumentRow
							| null
							| undefined

						return (
							<ApplicationCard
								key={app.id}
								app={app}
								status={status}
								isUpdating={updatingId === app.id}
								isDeleting={deletingId === app.id}
								resumeLoading={downloading === `resume-${app.id}`}
								coverLoading={downloading === `cover-${app.id}`}
								onStatusChange={(next) => onStatusChange(app.id, next)}
								onDownloadResume={() => {
									if (!resumeDoc) return
									onDownloadResume(app, resumeDoc, app.company_name)
								}}
								onDownloadCover={() => {
									if (!coverDoc) return
									onDownloadCover(app, coverDoc, app.company_name)
								}}
								onDelete={onDelete}
							/>
						)
					})}
				</div>
			)}
		</section>
	)
}
