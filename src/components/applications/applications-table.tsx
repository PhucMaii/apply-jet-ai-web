import { Link, useNavigate } from "react-router-dom"
import { ApplicationCompanyMark } from "@/components/applications/application-company-mark"
import { ApplicationRowActions } from "@/components/applications/application-row-actions"
import { ApplicationStatusMenu } from "@/components/applications/application-status-menu"
import { ScoreRing } from "@/components/ui/score-ring"
import type { ApplicationStatus } from "@/lib/application-status"
import {
	formatApplicationAddedRelative,
	getApplicationScore,
} from "@/lib/application-display"
import { APPLICATIONS_COPY } from "@/lib/applications-copy"
import { applicationDetailPath } from "@/lib/constants"
import type { ApplicationWithDocuments } from "@/types/database"

export interface ApplicationsListProps {
	rows: ApplicationWithDocuments[]
	updatingId: string | null
	resolveStatus: (raw: string) => ApplicationStatus
	onStatusChange: (id: string, status: ApplicationStatus) => void
	onDelete: (applicationId: string) => Promise<{
		success: boolean
		message: string
	}>
}

function getDisplayNames(app: ApplicationWithDocuments) {
	return {
		jobTitle: app.job_title?.trim() || APPLICATIONS_COPY.untitledRole,
		companyName: app.company_name?.trim() || APPLICATIONS_COPY.unknownCompany,
	}
}

const TH_CLASS =
	"px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-subtle"

export function ApplicationsTable({
	rows,
	updatingId,
	resolveStatus,
	onStatusChange,
	onDelete,
}: ApplicationsListProps) {
	const navigate = useNavigate()

	return (
		<div className="overflow-hidden rounded-xl border border-hairline bg-surface shadow-card">
			<table className="hidden w-full border-collapse text-sm md:table">
				<thead className="border-b border-hairline bg-surface-sunken/50">
					<tr>
						<th scope="col" className={TH_CLASS}>{APPLICATIONS_COPY.columnRole}</th>
						<th scope="col" className={TH_CLASS}>{APPLICATIONS_COPY.columnStatus}</th>
						<th scope="col" className={`${TH_CLASS} text-center`}>{APPLICATIONS_COPY.columnScore}</th>
						<th scope="col" className={`${TH_CLASS} hidden lg:table-cell`}>{APPLICATIONS_COPY.columnAdded}</th>
						<th scope="col" className={TH_CLASS}>{APPLICATIONS_COPY.columnUpdated}</th>
						<th scope="col" className={`${TH_CLASS} w-12`}>
							<span className="sr-only">{APPLICATIONS_COPY.columnActions}</span>
						</th>
					</tr>
				</thead>
				<tbody className="divide-y divide-hairline">
					{rows.map((app) => {
						const status = resolveStatus(app.status || "")
						const { jobTitle, companyName } = getDisplayNames(app)
						const detailPath = applicationDetailPath(app.id)

						return (
							<tr
								key={app.id}
								onClick={() => navigate(detailPath)}
								className="group cursor-pointer transition-colors hover:bg-surface-sunken/50"
							>
								<td className="px-4 py-3">
									<div className="flex min-w-0 items-center gap-3">
										<ApplicationCompanyMark companyName={companyName} />
										<div className="min-w-0">
											<Link
												to={detailPath}
												onClick={(event) => event.stopPropagation()}
												className="block max-w-[22rem] truncate font-medium text-ink underline-offset-4 group-hover:text-brand-ink hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 rounded-sm"
											>
												{jobTitle}
											</Link>
											<p className="max-w-[22rem] truncate text-ink-muted">{companyName}</p>
										</div>
									</div>
								</td>
								<td className="px-4 py-3">
									<ApplicationStatusMenu
										status={status}
										isUpdating={updatingId === app.id}
										ariaLabel={APPLICATIONS_COPY.changeStatus(jobTitle)}
										onChange={(next) => onStatusChange(app.id, next)}
									/>
								</td>
								<td className="px-4 py-3 text-center">
									<ScoreRing value={getApplicationScore(app)} className="mx-auto" />
								</td>
								<td className="hidden whitespace-nowrap px-4 py-3 text-ink-muted lg:table-cell">
									{formatApplicationAddedRelative(app.created_at || "")}
								</td>
								<td className="whitespace-nowrap px-4 py-3 text-ink-muted">
									{formatApplicationAddedRelative(app.updated_at || app.created_at || "")}
								</td>
								<td className="px-2 py-3 text-right">
									<ApplicationRowActions
										app={app}
										jobTitle={jobTitle}
										companyName={companyName}
										onDelete={onDelete}
									/>
								</td>
							</tr>
						)
					})}
				</tbody>
			</table>

			<ul className="divide-y divide-hairline md:hidden">
				{rows.map((app) => {
					const status = resolveStatus(app.status || "")
					const { jobTitle, companyName } = getDisplayNames(app)

					return (
						<li key={app.id} className="relative flex items-start gap-3 p-4">
							<ApplicationCompanyMark companyName={companyName} />
							<div className="min-w-0 flex-1">
								<Link
									to={applicationDetailPath(app.id)}
									className="block truncate font-medium text-ink after:absolute after:inset-0 focus-visible:outline-none focus-visible:after:ring-2 focus-visible:after:ring-inset focus-visible:after:ring-brand/40"
								>
									{jobTitle}
								</Link>
								<p className="truncate text-sm text-ink-muted">{companyName}</p>
								<div className="relative z-10 mt-2.5 flex flex-wrap items-center gap-2.5">
									<ApplicationStatusMenu
										status={status}
										isUpdating={updatingId === app.id}
										ariaLabel={APPLICATIONS_COPY.changeStatus(jobTitle)}
										onChange={(next) => onStatusChange(app.id, next)}
									/>
									<span className="text-xs text-ink-subtle">
										{formatApplicationAddedRelative(app.updated_at || app.created_at || "")}
									</span>
								</div>
							</div>
							<div className="relative z-10 flex flex-col items-end gap-2">
								<ApplicationRowActions
									app={app}
									jobTitle={jobTitle}
									companyName={companyName}
									onDelete={onDelete}
								/>
								<ScoreRing value={getApplicationScore(app)} size={32} />
							</div>
						</li>
					)
				})}
			</ul>
		</div>
	)
}
