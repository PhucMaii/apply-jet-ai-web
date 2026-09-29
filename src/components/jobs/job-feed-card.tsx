import { Clock3, MapPin } from "lucide-react"
import { JOBS_COPY } from "@/lib/jobs-copy"
import {
	companyInitials,
	formatJobPostedAt,
	hasJobDescription,
	isFreshJob,
} from "@/lib/jobs-display"
import { JOBS_THEME } from "@/lib/jobs-theme"
import type { JobFeedItem } from "@/types/database"
import { cn } from "@/lib/utils"

interface JobFeedCardProps {
	job: JobFeedItem
	isSelected: boolean
	onSelect: (jobId: number) => void
}

export function JobFeedCard({ job, isSelected, onSelect }: JobFeedCardProps) {
	const companyName =
		job.companies?.name?.trim() || JOBS_COPY.companyFallback
	const location = job.location?.trim()
	const fresh = isFreshJob(job.posted_at)
	const hasDescription = hasJobDescription(job.description_html)
	

	return (
		<button
			type="button"
			onClick={() => onSelect(job.id)}
			aria-pressed={isSelected}
			className={cn(
				JOBS_THEME.listItem,
				isSelected && JOBS_THEME.listItemActive,
			)}
		>
			<div className="flex gap-3">
				<div className={JOBS_THEME.companyMark} aria-hidden>
					{companyInitials(companyName)}
				</div>
				<div className="min-w-0 flex-1">
					<div className="flex flex-wrap items-center gap-2">
						<span
							className={cn(
								"line-clamp-2 font-semibold text-neutral-900",
								isSelected && "text-primary",
							)}
						>
							{job.title}
						</span>
						{fresh ? (
							<span className={JOBS_THEME.postedFresh}>New</span>
						) : null}
					</div>
					<p className="mt-0.5 truncate text-sm text-neutral-700">
						{companyName}
					</p>
					<div className={JOBS_THEME.metaRow}>
						{location ? (
							<span className="inline-flex items-center gap-1 truncate">
								<MapPin className="size-3.5 shrink-0 opacity-70" aria-hidden />
								<span className="truncate">{location}</span>
							</span>
						) : null}
						{location ? (
							<span className={JOBS_THEME.metaDot} aria-hidden>
								·
							</span>
						) : null}
						<span className="inline-flex items-center gap-1 shrink-0">
							<Clock3 className="size-3.5 opacity-70" aria-hidden />
							{formatJobPostedAt(job.posted_at)}
						</span>
					</div>
					{!hasDescription ? (
						<p className="mt-2">
							<span className={JOBS_THEME.descMissing}>
								{JOBS_COPY.descriptionMissing}
							</span>
						</p>
					) : null}
				</div>
			</div>
		</button>
	)
}
