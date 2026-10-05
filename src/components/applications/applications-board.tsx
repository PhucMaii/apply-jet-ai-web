import { useState, type DragEvent } from "react"
import { Link } from "react-router-dom"
import { ApplicationCompanyMark } from "@/components/applications/application-company-mark"
import { ApplicationStatusMenu } from "@/components/applications/application-status-menu"
import type { ApplicationsListProps } from "@/components/applications/applications-table"
import { ScoreRing } from "@/components/ui/score-ring"
import {
	APPLICATION_STATUSES,
	APPLICATION_STATUS_META,
	type ApplicationStatus,
} from "@/lib/application-status"
import {
	formatApplicationAddedRelative,
	getApplicationScore,
} from "@/lib/application-display"
import { APPLICATIONS_COPY } from "@/lib/applications-copy"
import { applicationDetailPath } from "@/lib/constants"
import { cn } from "@/lib/utils"

const DRAG_DATA_TYPE = "text/plain" as const

type ApplicationsBoardProps = Omit<ApplicationsListProps, "onDelete">

export function ApplicationsBoard({
	rows,
	updatingId,
	resolveStatus,
	onStatusChange,
}: ApplicationsBoardProps) {
	const [draggingId, setDraggingId] = useState<string | null>(null)
	const [overStatus, setOverStatus] = useState<ApplicationStatus | null>(null)

	const columns = APPLICATION_STATUSES.map((status) => ({
		status,
		items: rows.filter((row) => resolveStatus(row.status || "") === status),
	}))

	const handleDragStart = (event: DragEvent<HTMLElement>, id: string) => {
		event.dataTransfer.setData(DRAG_DATA_TYPE, id)
		event.dataTransfer.effectAllowed = "move"
		setDraggingId(id)
	}

	const handleDragEnd = () => {
		setDraggingId(null)
		setOverStatus(null)
	}

	const handleDrop = (event: DragEvent<HTMLElement>, status: ApplicationStatus) => {
		event.preventDefault()
		const id = event.dataTransfer.getData(DRAG_DATA_TYPE)
		const row = rows.find((item) => item.id === id)
		if (row && resolveStatus(row.status || "") !== status) {
			onStatusChange(id, status)
		}
		handleDragEnd()
	}

	return (
		<div>
			<p className="mb-3 hidden text-xs text-ink-subtle md:block">
				{APPLICATIONS_COPY.boardDragHint}
			</p>
			<div className="-mx-4 grid snap-x snap-mandatory auto-cols-[minmax(15.5rem,1fr)] grid-flow-col gap-3 overflow-x-auto px-4 pb-3 thin-scrollbar sm:mx-0 sm:px-0">
				{columns.map((column) => {
					const meta = APPLICATION_STATUS_META[column.status]
					const isOver = overStatus === column.status && draggingId !== null

					return (
						<section
							key={column.status}
							aria-label={`${meta.label}, ${column.items.length}`}
							onDragOver={(event) => {
								event.preventDefault()
								event.dataTransfer.dropEffect = "move"
								if (overStatus !== column.status) setOverStatus(column.status)
							}}
							onDragLeave={(event) => {
								if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
									setOverStatus(null)
								}
							}}
							onDrop={(event) => handleDrop(event, column.status)}
							className={cn(
								"flex min-h-[18rem] snap-start flex-col rounded-xl bg-surface-sunken/70 p-2 transition-colors",
								isOver && "bg-brand-soft ring-2 ring-brand/30",
							)}
						>
							<header className="flex items-center justify-between px-2 pt-1 pb-2.5">
								<h3 className="flex items-center gap-2 text-sm font-semibold text-ink">
									<span className={cn("size-2 rounded-full", meta.dotClass)} aria-hidden />
									{meta.label}
								</h3>
								<span className="rounded-full bg-surface px-2 py-0.5 text-xs font-medium tabular-nums text-ink-muted">
									{column.items.length}
								</span>
							</header>

							<ul className="flex flex-1 flex-col gap-2">
								{column.items.map((app) => {
									const jobTitle = app.job_title?.trim() || APPLICATIONS_COPY.untitledRole
									const companyName = app.company_name?.trim() || APPLICATIONS_COPY.unknownCompany

									return (
										<li
											key={app.id}
											draggable
											onDragStart={(event) => handleDragStart(event, app.id)}
											onDragEnd={handleDragEnd}
											className={cn(
												"group relative cursor-grab rounded-lg border border-hairline bg-surface p-3 shadow-card transition-[border-color,opacity,box-shadow]",
												"hover:border-hairline-strong active:cursor-grabbing",
												draggingId === app.id && "opacity-50",
											)}
										>
											<div className="flex items-start gap-2.5">
												<ApplicationCompanyMark companyName={companyName} size="sm" />
												<div className="min-w-0 flex-1">
													<Link
														to={applicationDetailPath(app.id)}
														draggable={false}
														className="line-clamp-2 text-sm font-medium leading-snug text-ink after:absolute after:inset-0 after:rounded-lg group-hover:text-brand-ink focus-visible:outline-none focus-visible:after:ring-2 focus-visible:after:ring-brand/40"
													>
														{jobTitle}
													</Link>
													<p className="mt-0.5 truncate text-xs text-ink-muted">{companyName}</p>
												</div>
												<ScoreRing value={getApplicationScore(app)} size={30} strokeWidth={3} className="relative z-10" />
											</div>
											<div className="relative z-10 mt-3 flex items-center justify-between gap-2">
												<ApplicationStatusMenu
													status={column.status}
													isUpdating={updatingId === app.id}
													ariaLabel={APPLICATIONS_COPY.changeStatus(jobTitle)}
													onChange={(next) => onStatusChange(app.id, next)}
												/>
												<span className="truncate text-[11px] text-ink-subtle">
													{formatApplicationAddedRelative(app.updated_at || app.created_at || "")}
												</span>
											</div>
										</li>
									)
								})}
								{column.items.length === 0 ? (
									<li
										className="flex flex-1 items-center justify-center rounded-lg border border-dashed border-hairline-strong p-4 text-xs text-ink-subtle"
										aria-hidden
									>
										{APPLICATIONS_COPY.boardEmptyColumn}
									</li>
								) : null}
							</ul>
						</section>
					)
				})}
			</div>
		</div>
	)
}
