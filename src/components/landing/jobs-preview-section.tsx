import { Link } from "react-router-dom"
import { ArrowRight, BriefcaseBusiness, Clock3, MapPin } from "lucide-react"
import { motion, useReducedMotion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { useLandingCopy } from "@/context/landing-copy-context"
import { useLandingJobsPreview } from "@/hooks/use-landing-jobs-preview"
import { ROUTES } from "@/lib/constants"
import { JOBS_COPY } from "@/lib/jobs-copy"
import {
	companyInitials,
	formatJobPostedAt,
	isFreshJob,
} from "@/lib/jobs-display"
import {
	LANDING_EASE_OUT,
	landingRevealViewport,
} from "@/lib/landing-motion"
import { LANDING_SECTION_ID } from "@/lib/landing/landing-section"
import { cn } from "@/lib/utils"

function JobsPreviewSkeleton() {
	return (
		<ul
			className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
			aria-hidden
		>
			{Array.from({ length: 6 }).map((_, index) => (
				<li
					key={index}
					className="rounded-2xl border border-landing-border bg-landing-paper p-6"
				>
					<div className="flex gap-3">
						<div className="size-9 shrink-0 animate-pulse rounded bg-landing-border/80" />
						<div className="min-w-0 flex-1 space-y-3 py-0.5">
							<div className="h-3 w-16 animate-pulse rounded bg-landing-border/70" />
							<div className="h-5 w-4/5 animate-pulse rounded bg-landing-border/80" />
							<div className="h-3.5 w-2/5 animate-pulse rounded bg-landing-border/60" />
							<div className="h-3 w-3/5 animate-pulse rounded bg-landing-border/50" />
						</div>
					</div>
				</li>
			))}
		</ul>
	)
}

export function JobsPreviewSection() {
	const reduceMotion = useReducedMotion()
	const { jobsPreview } = useLandingCopy()
	const { data, isLoading, isError, isFetched } = useLandingJobsPreview()

	const jobs = data?.jobs ?? []
	const waiting = !isFetched || isLoading
	const showList = !waiting && !isError && jobs.length > 0
	const showEmpty = !waiting && (isError || jobs.length === 0)

	const regionLabel =
		data?.source === "geo" && data.geoLabel
			? jobsPreview.nearYouLabel(data.geoLabel)
			: jobsPreview.fallbackLabel

	return (
		<section
			id={LANDING_SECTION_ID.jobsPreview}
			className="scroll-mt-24 bg-[color-mix(in_oklab,var(--color-landing-primary)_5%,white)] py-20 sm:py-[5rem]"
		>
			<div className="mx-auto max-w-[1200px] px-4 sm:px-6">
				<motion.div
					initial={reduceMotion ? false : { opacity: 0, y: 16 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={landingRevealViewport}
					transition={{ duration: 0.45, ease: LANDING_EASE_OUT }}
					className="mx-auto max-w-3xl text-center"
				>
					<p className="text-[13px] font-medium uppercase tracking-[0.129em] text-landing-primary">
						{jobsPreview.eyebrow}
					</p>
					<h2 className="mt-3 font-sans text-[1.9375rem] font-medium leading-[1.14] tracking-[0.02em] text-landing-ink sm:text-[2.5rem] sm:leading-[1.07]">
						{jobsPreview.title}
					</h2>
					<p className="mx-auto mt-4 max-w-2xl text-base leading-[1.43] tracking-[0.02em] text-landing-muted sm:text-[1.125rem] sm:leading-[1.25]">
						{jobsPreview.description}
					</p>

					<div className="mt-8 flex flex-col items-center gap-3">
						<div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-3">
							<Button
								size="lg"
								className="rounded-full px-6 font-medium shadow-none hover:shadow-none"
								asChild
							>
								<Link to={ROUTES.jobs}>{jobsPreview.browseCta}</Link>
							</Button>
							<Link
								to={ROUTES.jobs}
								className="inline-flex items-center gap-1 px-1 py-2 text-base font-medium text-landing-primary underline-offset-4 transition-colors hover:underline"
							>
								{jobsPreview.browseGhostCta}
								<ArrowRight className="size-4" aria-hidden />
							</Link>
						</div>
						<p className="text-[14px] leading-[1.43] text-[color-mix(in_oklab,var(--color-landing-muted)_85%,#828ba2)]">
							{jobsPreview.browseHint}
						</p>
					</div>
				</motion.div>

				<div className="mt-12 sm:mt-14">
					{waiting ? (
						<div aria-busy="true" aria-live="polite">
							<p className="sr-only">{jobsPreview.loadingLabel}</p>
							<JobsPreviewSkeleton />
						</div>
					) : null}

					{showEmpty ? (
						<div className="mx-auto flex max-w-lg flex-col items-center gap-3 rounded-2xl border border-landing-border bg-landing-paper px-6 py-12 text-center">
							<span className="flex size-9 items-center justify-center rounded border border-landing-border text-landing-primary">
								<BriefcaseBusiness className="size-4" strokeWidth={1.5} aria-hidden />
							</span>
							<p className="text-[1.1875rem] font-medium leading-[1.22] text-landing-ink">
								{jobsPreview.emptyTitle}
							</p>
							<p className="text-[15px] leading-[1.43] text-landing-muted">
								{jobsPreview.emptyBody}
							</p>
							<Button
								className="mt-2 rounded-full px-6 font-medium shadow-none"
								asChild
							>
								<Link to={ROUTES.jobs}>{jobsPreview.browseCta}</Link>
							</Button>
						</div>
					) : null}

					{showList ? (
						<>
							<p className="mb-5 flex items-center justify-center gap-1.5 text-[14px] leading-[1.43] tracking-[0.02em] text-[color-mix(in_oklab,var(--color-landing-muted)_85%,#828ba2)]">
								<MapPin className="size-3.5" strokeWidth={1.5} aria-hidden />
								{regionLabel}
							</p>

							<ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
								{jobs.map((job, index) => {
									const companyName =
										job.companies?.name?.trim() ||
										JOBS_COPY.companyFallback
									const location = job.location?.trim()
									const fresh = isFreshJob(job.posted_at)
									const tintWash =
										index % 3 === 1
											? "bg-[color-mix(in_oklab,var(--color-landing-primary)_4%,white)]"
											: index % 3 === 2
												? "bg-[#e7f4ed]/40"
												: "bg-landing-paper"

									return (
										<motion.li
											key={job.id}
											initial={
												reduceMotion ? false : { opacity: 0, y: 12 }
											}
											whileInView={{ opacity: 1, y: 0 }}
											viewport={landingRevealViewport}
											transition={{
												duration: 0.4,
												ease: LANDING_EASE_OUT,
												delay: reduceMotion ? 0 : 0.04 * index,
											}}
										>
											<Link
												to={ROUTES.jobs}
												className={cn(
													"group flex h-full flex-col rounded-2xl border border-landing-border p-6",
													"outline-none transition-[border-color,background-color] duration-200",
													"hover:border-landing-primary/35",
													"focus-visible:ring-2 focus-visible:ring-landing-primary/35 focus-visible:ring-offset-2 focus-visible:ring-offset-[color-mix(in_oklab,var(--color-landing-primary)_5%,white)]",
													tintWash,
												)}
											>
												<div className="flex items-start gap-3">
													<span
														className="flex size-9 shrink-0 items-center justify-center rounded border border-landing-border bg-landing-paper text-[11px] font-semibold tracking-[0.04em] text-landing-ink"
														aria-hidden
													>
														{companyInitials(companyName)}
													</span>
													<div className="min-w-0 flex-1">
														<div className="flex flex-wrap items-center gap-2">
															{fresh ? (
																<span className="inline-flex items-center rounded-full bg-[#e7f4ed] px-2.5 py-0.5 text-[12px] font-medium text-[#1f6b4a]">
																	New
																</span>
															) : null}
															<span className="inline-flex items-center gap-1 text-[13px] text-[color-mix(in_oklab,var(--color-landing-muted)_80%,#828ba2)]">
																<Clock3
																	className="size-3.5"
																	strokeWidth={1.5}
																	aria-hidden
																/>
																{formatJobPostedAt(job.posted_at)}
															</span>
														</div>
														<h3 className="mt-2 line-clamp-2 text-[1.125rem] font-medium leading-[1.22] tracking-[0.02em] text-landing-ink transition-colors group-hover:text-landing-primary">
															{job.title}
														</h3>
														<p className="mt-1 truncate text-[15px] leading-[1.43] text-landing-muted">
															{companyName}
														</p>
													</div>
												</div>

												<div className="mt-auto flex items-center justify-between gap-3 border-t border-landing-border/80 pt-4">
													{location ? (
														<span className="inline-flex min-w-0 items-center gap-1 truncate text-[13px] text-[color-mix(in_oklab,var(--color-landing-muted)_80%,#828ba2)]">
															<MapPin
																className="size-3.5 shrink-0"
																strokeWidth={1.5}
																aria-hidden
															/>
															<span className="truncate">{location}</span>
														</span>
													) : (
														<span />
													)}
													<span className="inline-flex shrink-0 items-center gap-1 text-[14px] font-medium text-landing-primary">
														View
														<ArrowRight
															className="size-3.5 transition-transform group-hover:translate-x-0.5"
															strokeWidth={1.5}
															aria-hidden
														/>
													</span>
												</div>
											</Link>
										</motion.li>
									)
								})}
							</ul>
						</>
					) : null}
				</div>
			</div>
		</section>
	)
}
