import { useEffect, useRef, useState } from "react"
import {
	ArrowLeft,
	ArrowUpRight,
	Clock3,
	Loader2,
	MapPin,
	Sparkles,
} from "lucide-react"
import toast from "react-hot-toast"
import { ApplicationCompanyMark } from "@/components/applications/application-company-mark"
import { JobsSignupModal } from "@/components/jobs/jobs-signup-modal"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/context/auth-context"
import { useCreateTailoredApplication } from "@/hooks/use-create-tailored-application"
import { ROUTES } from "@/lib/constants"
import {
	formatJobClicksLabel,
	hasTrackedJobApplyClick,
	trackJobApplyClick,
} from "@/lib/job-clicks"
import { JOBS_COPY } from "@/lib/jobs-copy"
import {
	formatJobPostedAt,
	hasJobDescription,
	sanitizeJobHtml,
} from "@/lib/jobs-display"
import { JOBS_THEME } from "@/lib/jobs-theme"
import type { JobFeedItem } from "@/types/database"
import { cn } from "@/lib/utils"

interface JobDetailPanelProps {
	job: JobFeedItem | null
	onBack?: () => void
	showBack?: boolean
	/** Signed-in mobile shell has a bottom nav the action bar must clear. */
	reserveBottomNav?: boolean
	onClicksChange?: (jobId: number, clicks: number) => void
}

export function JobDetailPanel({
	job,
	onBack,
	showBack = false,
	reserveBottomNav = false,
	onClicksChange,
}: JobDetailPanelProps) {
	const { user } = useAuth()
	const companyName = job?.companies?.name?.trim() || JOBS_COPY.companyFallback
	const location = job?.location?.trim()
	const department = job?.department?.trim()
	const descriptionHtml = job?.description_html
	const hasDescription = hasJobDescription(descriptionHtml)
	const safeHtml =
		descriptionHtml && hasDescription ? sanitizeJobHtml(descriptionHtml) : ""

	const { createTailoredApplication, isCreating } =
		useCreateTailoredApplication(job)
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [isSignupOpen, setIsSignupOpen] = useState(false)
	const [clicks, setClicks] = useState(job?.clicks ?? 0)
	const scrollRef = useRef<HTMLDivElement>(null)

	useEffect(() => {
		if (scrollRef.current) scrollRef.current.scrollTop = 0
	}, [job?.id])

	useEffect(() => {
		setClicks(job?.clicks ?? 0)
	}, [job?.id, job?.clicks])

	function handleApplyClick() {
		if (!job) return
		if (!hasTrackedJobApplyClick(job.id)) {
			const optimistic = clicks + 1
			setClicks(optimistic)
			onClicksChange?.(job.id, optimistic)
		}
		void trackJobApplyClick(job.id).then((next) => {
			if (typeof next !== "number") return
			setClicks(next)
			onClicksChange?.(job.id, next)
		})
	}

	async function handleTailorWithAi() {
		if (!job || isCreating || isSubmitting) return
		if (!user) {
			setIsSignupOpen(true)
			return
		}

		setIsSubmitting(true)
		try {
			const result = await createTailoredApplication()
			if (result.success) {
				toast.success(result.msg)
			} else {
				toast.error(result.msg)
			}
		} finally {
			setIsSubmitting(false)
		}
	}

	const isBusy = isCreating || isSubmitting
	const canTailor = Boolean(job) && hasDescription && !isBusy

	if (!job) {
		return (
			<div className={cn(JOBS_THEME.detailPane, "items-center justify-center p-8")}>
				<p className="text-sm text-ink-muted">{JOBS_COPY.selectJob}</p>
			</div>
		)
	}

	const applyLabel = `${JOBS_COPY.apply}: ${job.title} at ${companyName}`
	const clicksLabel = formatJobClicksLabel(clicks)

	const renderActions = () => (
		<div className="space-y-2">
			<div className="flex flex-wrap gap-2">
				<Button
					type="button"
					onClick={handleTailorWithAi}
					disabled={!canTailor}
					aria-busy={isBusy}
					title={!hasDescription ? JOBS_COPY.tailorNeedsDescription : undefined}
				>
					{isBusy ? (
						<Loader2 className="animate-spin" aria-hidden />
					) : (
						<Sparkles aria-hidden />
					)}
					{isBusy ? JOBS_COPY.tailoring : JOBS_COPY.tailorWithAi}
				</Button>
				<Button variant="outline" asChild>
					<a
						href={job.apply_url}
						target="_blank"
						rel="noopener noreferrer"
						aria-label={applyLabel}
						title={JOBS_COPY.openExternal}
						onClick={handleApplyClick}
					>
						{JOBS_COPY.apply}
						<ArrowUpRight aria-hidden />
					</a>
				</Button>
			</div>
			{clicksLabel ? (
				<p className="text-xs text-ink-subtle">{clicksLabel}</p>
			) : null}
		</div>
	)

	return (
		<div className={JOBS_THEME.detailPane}>
			<div className="shrink-0 border-b border-hairline px-5 py-4 sm:px-6">
				{showBack ? (
					<button
						type="button"
						id="job-detail-back"
						onClick={onBack}
						className="mb-3 inline-flex h-8 items-center gap-1.5 rounded-md text-sm font-medium text-ink-muted hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 lg:hidden"
					>
						<ArrowLeft className="size-4" aria-hidden />
						{JOBS_COPY.backToResults}
					</button>
				) : null}

				<div className="flex gap-3">
					<ApplicationCompanyMark
						companyName={companyName}
						className="size-11 rounded-lg text-sm"
					/>
					<div className="min-w-0 flex-1">
						<h2 className="font-display text-xl font-semibold tracking-tight text-ink sm:text-2xl">
							{job.title}
						</h2>
						<p className="mt-1 text-sm font-medium text-ink">{companyName}</p>
						<p className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-ink-muted">
							{location ? (
								<span className="inline-flex items-center gap-1">
									<MapPin className="size-3.5" aria-hidden />
									{location}
								</span>
							) : null}
							{department ? <span>{department}</span> : null}
							<span className="inline-flex items-center gap-1">
								<Clock3 className="size-3.5" aria-hidden />
								{formatJobPostedAt(job.posted_at)}
							</span>
						</p>
						{job.ats || !hasDescription ? (
							<div className="mt-2.5 flex flex-wrap items-center gap-2">
								{job.ats ? (
									<Badge tone="neutral" className="capitalize">
										{job.ats}
									</Badge>
								) : null}
								{!hasDescription ? (
									<Badge tone="warning">{JOBS_COPY.descriptionMissing}</Badge>
								) : null}
							</div>
						) : null}
					</div>
				</div>

				<div className="mt-4 hidden lg:block">{renderActions()}</div>
				{!hasDescription ? (
					<p className="mt-3 hidden text-xs leading-relaxed text-ink-muted lg:block">
						{JOBS_COPY.tailorNeedsDescription}
					</p>
				) : null}
			</div>

			<div ref={scrollRef} className={JOBS_THEME.detailScroll}>
				{hasDescription ? (
					<div
						className={JOBS_THEME.prose}
						dangerouslySetInnerHTML={{ __html: safeHtml }}
					/>
				) : (
					<div className="rounded-xl border border-dashed border-hairline-strong bg-surface-sunken/50 px-4 py-10 text-center">
						<p className="text-sm font-medium text-ink">
							{JOBS_COPY.descriptionMissing}
						</p>
						<p className="mx-auto mt-1.5 max-w-sm text-sm leading-relaxed text-ink-muted">
							{JOBS_COPY.descriptionMissingBody}
						</p>
					</div>
				)}
			</div>

			<div
				className={cn(
					"sticky z-20 border-t border-hairline bg-surface/95 px-4 py-3 backdrop-blur lg:hidden",
					reserveBottomNav
						? "bottom-[calc(env(safe-area-inset-bottom)+4.75rem)]"
						: "bottom-0",
				)}
			>
				{renderActions()}
				{!hasDescription ? (
					<p className="mt-2 text-xs leading-relaxed text-ink-muted">
						{JOBS_COPY.tailorNeedsDescription}
					</p>
				) : null}
			</div>

			<JobsSignupModal
				isOpen={isSignupOpen}
				onClose={() => setIsSignupOpen(false)}
				returnTo={ROUTES.jobs}
			/>
		</div>
	)
}
