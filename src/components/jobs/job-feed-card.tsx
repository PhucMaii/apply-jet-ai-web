import { Clock3, MapPin } from "lucide-react"
import { ApplicationCompanyMark } from "@/components/applications/application-company-mark"
import { Badge } from "@/components/ui/badge"
import { formatJobClicksLabel } from "@/lib/job-clicks"
import { JOBS_COPY } from "@/lib/jobs-copy"
import {
	formatJobPostedAt,
	hasJobDescription,
	isFreshJob,
} from "@/lib/jobs-display"
import type { JobFeedItem } from "@/types/database"
import { cn } from "@/lib/utils"

interface JobFeedCardProps {
	job: JobFeedItem
	isSelected: boolean
	onSelect: (jobId: number) => void
}

export function JobFeedCard({ job, isSelected, onSelect }: JobFeedCardProps) {
	const companyName = job.companies?.name?.trim() || JOBS_COPY.companyFallback
	const location = job.location?.trim()
	const fresh = isFreshJob(job.posted_at)
	const hasDescription = hasJobDescription(job.description_html)
	const clicksLabel = formatJobClicksLabel(job.clicks)

	return (
		<button
			type="button"
			id={`job-option-${job.id}`}
			onClick={() => onSelect(job.id)}
			aria-current={isSelected ? "true" : undefined}
			className={cn(
				"relative w-full border-b border-hairline px-4 py-3.5 text-left transition-colors",
				"hover:bg-surface-sunken/70",
				"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand/40",
				isSelected && "bg-brand-soft/80 hover:bg-brand-soft",
			)}
		>
			{isSelected ? (
				<span
					className="absolute inset-y-0 left-0 w-0.5 bg-brand"
					aria-hidden
				/>
			) : null}
			<div className="flex gap-3">
				<ApplicationCompanyMark companyName={companyName} />
				<div className="min-w-0 flex-1">
					<div className="flex items-start justify-between gap-2">
						<span
							className={cn(
								"line-clamp-2 text-sm font-semibold leading-snug text-ink",
								isSelected && "text-brand-ink",
							)}
						>
							{job.title}
						</span>
						{fresh ? (
							<Badge tone="success" size="sm" className="mt-0.5 shrink-0">
								{JOBS_COPY.newBadge}
							</Badge>
						) : null}
					</div>
					<p className="mt-0.5 truncate text-sm text-ink-muted">{companyName}</p>
					<p className="mt-1.5 flex min-w-0 items-center gap-x-2 text-xs text-ink-subtle">
						{location ? (
							<span className="inline-flex min-w-0 items-center gap-1">
								<MapPin className="size-3.5 shrink-0" aria-hidden />
								<span className="truncate">{location}</span>
							</span>
						) : null}
						<span className="inline-flex shrink-0 items-center gap-1">
							<Clock3 className="size-3.5" aria-hidden />
							{formatJobPostedAt(job.posted_at)}
						</span>
					</p>
					{clicksLabel ? (
						<p className="mt-1.5 text-xs text-ink-subtle">{clicksLabel}</p>
					) : null}
					{!hasDescription ? (
						<Badge tone="warning" size="sm" className="mt-2">
							{JOBS_COPY.descriptionMissing}
						</Badge>
					) : null}
				</div>
			</div>
		</button>
	)
}
