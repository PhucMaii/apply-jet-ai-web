import { useState } from "react"
import {
	ArrowLeft,
	ArrowUpRight,
	Clock3,
	ExternalLink,
	Loader2,
	MapPin,
	Sparkles,
} from "lucide-react"
import toast from "react-hot-toast"
import { JobsSignupModal } from "@/components/jobs/jobs-signup-modal"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/context/auth-context"
import { useCreateTailoredApplication } from "@/hooks/use-create-tailored-application"
import { ROUTES } from "@/lib/constants"
import { JOBS_COPY } from "@/lib/jobs-copy"
import {
	companyInitials,
	formatJobPostedAt,
	hasJobDescription,
	sanitizeJobHtml,
} from "@/lib/jobs-display"
import { JOBS_THEME } from "@/lib/jobs-theme"
import type { JobFeedItem } from "@/types/database"

interface JobDetailPanelProps {
	job: JobFeedItem | null
	onBack?: () => void
	showBack?: boolean
}

export function JobDetailPanel({
	job,
	onBack,
	showBack = false,
}: JobDetailPanelProps) {
	const { user } = useAuth()
	const companyName =
		job?.companies?.name?.trim() || JOBS_COPY.companyFallback
	const location = job?.location?.trim()
	const department = job?.department?.trim()
	const descriptionHtml = job?.description_html
	const hasDescription = hasJobDescription(descriptionHtml)
	const safeHtml =
		descriptionHtml && hasDescription
			? sanitizeJobHtml(descriptionHtml)
			: ""

	const { createTailoredApplication, isCreating } =
		useCreateTailoredApplication(job)
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [isSignupOpen, setIsSignupOpen] = useState(false)

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
			<div className={JOBS_THEME.detailPane}>
				<div className="flex flex-1 items-center justify-center p-8 text-sm text-neutral-500">
					{JOBS_COPY.selectJob}
				</div>
			</div>
		)
	}

	return (
		<div className={JOBS_THEME.detailPane}>
			<div className={JOBS_THEME.detailHeader}>
				{showBack ? (
					<button
						type="button"
						onClick={onBack}
						className="mb-3 inline-flex items-center gap-1.5 text-sm font-medium text-neutral-600 transition-colors hover:text-neutral-900"
					>
						<ArrowLeft className="size-4" aria-hidden />
						{JOBS_COPY.backToResults}
					</button>
				) : null}

				<div className="flex gap-3">
					<div className={JOBS_THEME.companyMark} aria-hidden>
						{companyInitials(companyName)}
					</div>
					<div className="min-w-0 flex-1">
						<h2 className="font-display text-xl font-semibold tracking-tight text-neutral-900 sm:text-2xl">
							{job.title}
						</h2>
						<p className="mt-1 text-sm font-medium text-neutral-700">
							{companyName}
						</p>
						<div className={JOBS_THEME.metaRow}>
							{location ? (
								<span className="inline-flex items-center gap-1">
									<MapPin className="size-3.5 opacity-70" aria-hidden />
									{location}
								</span>
							) : null}
							{location && department ? (
								<span className={JOBS_THEME.metaDot} aria-hidden>
									·
								</span>
							) : null}
							{department ? <span>{department}</span> : null}
							{location || department ? (
								<span className={JOBS_THEME.metaDot} aria-hidden>
									·
								</span>
							) : null}
							<span className="inline-flex items-center gap-1">
								<Clock3 className="size-3.5 opacity-70" aria-hidden />
								{formatJobPostedAt(job.posted_at)}
							</span>
						</div>
						<div className="mt-2 flex flex-wrap items-center gap-2">
							{job.ats ? (
								<span className={JOBS_THEME.badge}>{job.ats}</span>
							) : null}
							{!hasDescription ? (
								<span className={JOBS_THEME.descMissing}>
									{JOBS_COPY.descriptionMissing}
								</span>
							) : null}
						</div>
					</div>
				</div>

				<div className="mt-4 flex flex-wrap gap-2">
					<Button
						type="button"
						onClick={handleTailorWithAi}
						disabled={!canTailor}
						aria-busy={isBusy}
					>
						{isBusy ? (
							<Loader2 className="size-4 animate-spin" aria-hidden />
						) : (
							<Sparkles className="size-4" aria-hidden />
						)}
						{isBusy ? JOBS_COPY.tailoring : JOBS_COPY.tailorWithAi}
					</Button>
					<Button variant="outline" asChild>
						<a
							href={job.apply_url}
							target="_blank"
							rel="noopener noreferrer"
							aria-label={`${JOBS_COPY.apply}: ${job.title} at ${companyName}`}
							title={JOBS_COPY.openExternal}
						>
							{JOBS_COPY.apply}
							<ArrowUpRight className="size-4" aria-hidden />
						</a>
					</Button>
					{!hasDescription ? (
						<Button variant="outline" asChild>
							<a
								href={job.apply_url}
								target="_blank"
								rel="noopener noreferrer"
							>
								{JOBS_COPY.viewPosting}
								<ExternalLink className="size-4" aria-hidden />
							</a>
						</Button>
					) : null}
				</div>
			</div>

			<div className={JOBS_THEME.detailScroll}>
				{hasDescription ? (
					<div
						className={JOBS_THEME.prose}
						dangerouslySetInnerHTML={{ __html: safeHtml }}
					/>
				) : (
					<div className="rounded-xl border border-dashed border-neutral-200 bg-neutral-50 px-4 py-8 text-center">
						<p className="text-sm font-medium text-neutral-800">
							{JOBS_COPY.descriptionMissing}
						</p>
						<Button variant="outline" className="mt-4" asChild>
							<a
								href={job.apply_url}
								target="_blank"
								rel="noopener noreferrer"
							>
								{JOBS_COPY.viewPosting}
								<ExternalLink className="size-4" aria-hidden />
							</a>
						</Button>
					</div>
				)}
			</div>

			<JobsSignupModal
				isOpen={isSignupOpen}
				onClose={() => setIsSignupOpen(false)}
				returnTo={ROUTES.jobs}
			/>
		</div>
	)
}
