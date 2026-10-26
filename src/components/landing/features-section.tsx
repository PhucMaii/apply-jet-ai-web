import { motion, useReducedMotion } from "framer-motion"
import { Check, Plus, Sparkles } from "lucide-react"
import { LandingSectionHeading } from "@/components/landing/landing-section-heading"
import { ScoreRing } from "@/components/ui/score-ring"
import { useLandingCopy } from "@/context/landing-copy-context"
import { LANDING_EASE_OUT, landingRevealViewport } from "@/lib/landing-motion"
import { LANDING_SECTION_ID } from "@/lib/landing/landing-section"
import { cn } from "@/lib/utils"

const MOCK_SCORE_BREAKDOWN = [
	{ label: "Skills match", value: 92 },
	{ label: "Experience fit", value: 84 },
	{ label: "Wording & keywords", value: 71 },
] as const

const MOCK_MATCHED_KEYWORDS = [
	"Python",
	"Machine learning",
	"Data pipelines",
	"Stakeholder communication",
	"SQL",
] as const

const MOCK_MISSING_KEYWORDS = ["Airflow", "dbt", "Experiment design"] as const

const BLOCK_FRAME = "rounded-xl border border-hairline bg-surface shadow-card"
const EYEBROW_CLASS =
	"text-xs font-semibold uppercase tracking-[0.14em] text-brand"

function useReveal() {
	const reduceMotion = useReducedMotion()
	return {
		initial: reduceMotion ? false : { opacity: 0, y: 16 },
		whileInView: { opacity: 1, y: 0 },
		viewport: landingRevealViewport,
		transition: { duration: 0.5, ease: LANDING_EASE_OUT },
	} as const
}

function ScoreBreakdownVisual() {
	return (
		<div className={cn(BLOCK_FRAME, "p-6 sm:p-8")}>
			<div className="flex items-center gap-4">
				<ScoreRing value={86} size={72} strokeWidth={6} valueClassName="text-xl" />
				<div>
					<p className="text-sm font-semibold text-ink">Strong match</p>
					<p className="text-sm text-ink-muted">Machine Learning Engineer · Cobalt</p>
				</div>
			</div>
			<ul className="mt-7 space-y-4">
				{MOCK_SCORE_BREAKDOWN.map((item) => (
					<li key={item.label}>
						<div className="flex items-center justify-between text-sm">
							<span className="text-ink">{item.label}</span>
							<span className="font-medium tabular-nums text-ink-muted">
								{item.value}
							</span>
						</div>
						<div className="mt-1.5 h-1.5 rounded-full bg-surface-sunken">
							<div
								className="h-full rounded-full bg-brand"
								style={{ width: `${item.value}%` }}
							/>
						</div>
					</li>
				))}
			</ul>
		</div>
	)
}

function KeywordGapVisual({
	matchedLabel,
	missingLabel,
}: {
	matchedLabel: string
	missingLabel: string
}) {
	return (
		<div className={cn(BLOCK_FRAME, "divide-y divide-hairline")}>
			<div className="p-6">
				<p className="text-xs font-semibold uppercase tracking-[0.08em] text-ink-subtle">
					{matchedLabel} · {MOCK_MATCHED_KEYWORDS.length}
				</p>
				<ul className="mt-3 flex flex-wrap gap-2">
					{MOCK_MATCHED_KEYWORDS.map((keyword) => (
						<li
							key={keyword}
							className="inline-flex items-center gap-1.5 rounded-md bg-emerald-50 px-2.5 py-1.5 text-sm font-medium text-emerald-800"
						>
							<Check className="size-3.5" aria-hidden />
							{keyword}
						</li>
					))}
				</ul>
			</div>
			<div className="p-6">
				<p className="text-xs font-semibold uppercase tracking-[0.08em] text-ink-subtle">
					{missingLabel} · {MOCK_MISSING_KEYWORDS.length}
				</p>
				<ul className="mt-3 flex flex-wrap gap-2">
					{MOCK_MISSING_KEYWORDS.map((keyword) => (
						<li
							key={keyword}
							className="inline-flex items-center gap-1.5 rounded-md border border-dashed border-hairline-strong px-2.5 py-1.5 text-sm font-medium text-ink-muted"
						>
							<Plus className="size-3.5" aria-hidden />
							{keyword}
						</li>
					))}
				</ul>
			</div>
		</div>
	)
}

function JobBoardTailorVisual({
	buttonLabel,
	jobTitle,
	company,
}: {
	buttonLabel: string
	jobTitle: string
	company: string
}) {
	return (
		<div className="rounded-lg border border-hairline bg-canvas p-4 sm:p-5">
			<div className="flex items-start gap-3">
				<span
					className="flex size-10 shrink-0 items-center justify-center rounded-md border border-hairline bg-surface text-xs font-semibold tracking-[0.04em] text-ink"
					aria-hidden
				>
					CB
				</span>
				<div className="min-w-0 flex-1">
					<p className="text-sm font-semibold text-ink">{jobTitle}</p>
					<p className="mt-0.5 text-sm text-ink-muted">{company}</p>
					<p className="mt-3 line-clamp-2 text-xs leading-relaxed text-ink-subtle">
						Ship forecasting models with product and design. Python, SQL, and
						production ML experience preferred.
					</p>
				</div>
			</div>
			<div className="mt-4 flex items-center justify-between gap-3 border-t border-hairline pt-4">
				<span className="text-xs text-ink-subtle">On the job board</span>
				<span className="inline-flex items-center gap-1.5 rounded-md bg-brand px-3 py-2 text-xs font-semibold text-white shadow-sm">
					<Sparkles className="size-3.5" aria-hidden />
					{buttonLabel}
				</span>
			</div>
		</div>
	)
}

function KanbanBoardScreenshot({
	src,
	alt,
	caption,
}: {
	src: string
	alt: string
	caption: string
}) {
	return (
		<figure className="overflow-hidden rounded-xl border border-hairline bg-surface-sunken shadow-card">
			<div className="overflow-hidden bg-[#f4f5f7]">
				<img
					src={src}
					alt={alt}
					width={1600}
					height={900}
					loading="lazy"
					decoding="async"
					className="block h-auto w-full object-cover object-top"
				/>
			</div>
			<figcaption className="border-t border-hairline bg-surface px-4 py-3 text-sm text-ink-muted sm:px-5">
				{caption}
			</figcaption>
		</figure>
	)
}

export function FeaturesSection() {
	const { features } = useLandingCopy()
	const reveal = useReveal()
	const { scoring, keywords, jobBoardTailor, tracking } = features

	return (
		<section
			id={LANDING_SECTION_ID.features}
			className="scroll-mt-20 border-t border-hairline bg-surface py-20 sm:py-28"
		>
			<div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
				<LandingSectionHeading
					eyebrow={features.eyebrow}
					title={features.title}
					description={features.description}
				/>

				<motion.article
					{...reveal}
					className={cn(
						BLOCK_FRAME,
						"mt-16 grid items-center gap-8 p-6 sm:p-8 md:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] md:gap-10",
					)}
				>
					<div>
						<p className={EYEBROW_CLASS}>{jobBoardTailor.eyebrow}</p>
						<h3 className="mt-3 font-display text-xl font-medium tracking-tight text-ink sm:text-2xl">
							{jobBoardTailor.title}
						</h3>
						<p className="mt-2 max-w-md leading-relaxed text-ink-muted">
							{jobBoardTailor.body}
						</p>
					</div>
					<JobBoardTailorVisual
						buttonLabel={jobBoardTailor.buttonLabel}
						jobTitle={jobBoardTailor.jobTitle}
						company={jobBoardTailor.company}
					/>
				</motion.article>

				<motion.div {...reveal} className="mt-16 sm:mt-20">
					<div className="mx-auto max-w-2xl text-center">
						<p className={EYEBROW_CLASS}>{tracking.eyebrow}</p>
						<h3 className="mt-3 font-display text-2xl font-medium tracking-tight text-ink sm:text-[1.75rem]">
							{tracking.title}
						</h3>
						<p className="mt-3 leading-relaxed text-ink-muted">
							{tracking.body}
						</p>
					</div>
					<div className="mt-8 sm:mt-10">
						<KanbanBoardScreenshot
							src={tracking.imageSrc}
							alt={tracking.imageAlt}
							caption={tracking.dragHint}
						/>
					</div>
				</motion.div>

				<motion.div
					{...reveal}
					className="mt-20 grid items-center gap-10 md:grid-cols-[1fr_1.05fr] md:gap-16"
				>
					<div>
						<p className={EYEBROW_CLASS}>{scoring.eyebrow}</p>
						<h3 className="mt-3 font-display text-2xl font-medium tracking-tight text-ink sm:text-[1.75rem]">
							{scoring.title}
						</h3>
						<p className="mt-3 max-w-md leading-relaxed text-ink-muted">
							{scoring.body}
						</p>
						<ul className="mt-6 space-y-2.5">
							{scoring.points.map((point) => (
								<li
									key={point}
									className="flex items-center gap-2.5 text-sm text-ink"
								>
									<Check className="size-4 text-emerald-600" aria-hidden />
									{point}
								</li>
							))}
						</ul>
					</div>
					<ScoreBreakdownVisual />
				</motion.div>

				<motion.div
					{...reveal}
					className="mt-20 grid items-center gap-10 sm:mt-28 md:grid-cols-[1.05fr_1fr] md:gap-16"
				>
					<div className="md:order-2">
						<p className={EYEBROW_CLASS}>{keywords.eyebrow}</p>
						<h3 className="mt-3 font-display text-2xl font-medium tracking-tight text-ink sm:text-[1.75rem]">
							{keywords.title}
						</h3>
						<p className="mt-3 max-w-md leading-relaxed text-ink-muted">
							{keywords.body}
						</p>
					</div>
					<div className="md:order-1">
						<KeywordGapVisual
							matchedLabel={keywords.matchedLabel}
							missingLabel={keywords.missingLabel}
						/>
					</div>
				</motion.div>
			</div>
		</section>
	)
}
