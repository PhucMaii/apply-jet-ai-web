import { motion, useReducedMotion } from "framer-motion"
import { Check, Plus } from "lucide-react"
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

const MOCK_LETTER = {
	greeting: "Dear Hiring Team at Fieldstone,",
	body: "When I read that your analytics team is rebuilding its forecasting stack, I recognized the work I led at Harbor Freight Labs—moving 40 dashboards onto a single dbt model and cutting report prep from two days to two hours.",
} as const

const MOCK_BOARD = [
	{ status: "Applied", dot: "bg-status-applied", cards: ["Data Analyst · Lumen", "BI Developer · Arcadia"] },
	{ status: "Interviewing", dot: "bg-status-interviewing", cards: ["Analytics Lead · Fieldstone"] },
	{ status: "Offer", dot: "bg-status-offer", cards: ["Data Scientist · Northwind"] },
] as const

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

function CoverLetterVisual() {
	return (
		<div className="rounded-lg border border-hairline bg-canvas p-5 font-serif">
			<p className="text-sm text-ink">{MOCK_LETTER.greeting}</p>
			<p className="mt-3 text-sm leading-relaxed text-ink-muted">
				{MOCK_LETTER.body}
			</p>
			<div className="mt-4 space-y-2" aria-hidden>
				<div className="h-1.5 w-full rounded-full bg-hairline" />
				<div className="h-1.5 w-5/6 rounded-full bg-hairline" />
			</div>
		</div>
	)
}

function TrackingBoardVisual() {
	return (
		<div className="grid grid-cols-3 gap-2.5">
			{MOCK_BOARD.map((column) => (
				<div key={column.status} className="min-w-0 rounded-lg bg-surface-sunken p-2">
					<p className="flex items-center gap-1.5 px-1 pb-2 text-[11px] font-semibold text-ink-muted">
						<span className={cn("size-1.5 rounded-full", column.dot)} aria-hidden />
						<span className="truncate">{column.status}</span>
					</p>
					<ul className="space-y-1.5">
						{column.cards.map((card) => (
							<li
								key={card}
								className="rounded-md border border-hairline bg-surface px-2 py-2 text-[11px] leading-snug font-medium text-ink"
							>
								{card}
							</li>
						))}
					</ul>
				</div>
			))}
		</div>
	)
}

export function FeaturesSection() {
	const { features } = useLandingCopy()
	const reveal = useReveal()
	const { scoring, keywords, coverLetter, tracking } = features

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

				<motion.div
					{...reveal}
					className="mt-16 grid items-center gap-10 md:grid-cols-[1fr_1.05fr] md:gap-16"
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
								<li key={point} className="flex items-center gap-2.5 text-sm text-ink">
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

				<div className="mt-20 grid gap-5 sm:mt-28 md:grid-cols-2">
					<motion.article {...reveal} className={cn(BLOCK_FRAME, "flex flex-col p-6 sm:p-8")}>
						<p className={EYEBROW_CLASS}>{coverLetter.eyebrow}</p>
						<h3 className="mt-3 font-display text-xl font-medium tracking-tight text-ink sm:text-2xl">
							{coverLetter.title}
						</h3>
						<p className="mt-2 leading-relaxed text-ink-muted">{coverLetter.body}</p>
						<div className="mt-6 flex-1">
							<CoverLetterVisual />
						</div>
					</motion.article>
					<motion.article {...reveal} className={cn(BLOCK_FRAME, "flex flex-col p-6 sm:p-8")}>
						<p className={EYEBROW_CLASS}>{tracking.eyebrow}</p>
						<h3 className="mt-3 font-display text-xl font-medium tracking-tight text-ink sm:text-2xl">
							{tracking.title}
						</h3>
						<p className="mt-2 leading-relaxed text-ink-muted">{tracking.body}</p>
						<div className="mt-6 flex-1">
							<TrackingBoardVisual />
						</div>
					</motion.article>
				</div>
			</div>
		</section>
	)
}
