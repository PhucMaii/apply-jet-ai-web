import type { ReactNode } from "react"
import { motion, useReducedMotion } from "framer-motion"
import { ArrowRight, Check, FileText, Link2, Sparkles } from "lucide-react"
import { HeroDemoVideo } from "@/components/landing/hero-demo-video"
import { LandingSectionHeading } from "@/components/landing/landing-section-heading"
import { ScoreRing } from "@/components/ui/score-ring"
import { useLandingCopy } from "@/context/landing-copy-context"
import { LANDING_EASE_OUT, landingRevealViewport } from "@/lib/landing-motion"
import { LANDING_SECTION_ID } from "@/lib/landing/landing-section"
import { cn } from "@/lib/utils"

const MOCK_PARSED_SECTIONS = [
	{ label: "Contact", count: "5 fields" },
	{ label: "Work experience", count: "3 roles" },
	{ label: "Education", count: "1 degree" },
	{ label: "Skills", count: "14 skills" },
] as const

const MOCK_JOB_KEYWORDS = [
	"Product analytics",
	"SQL",
	"Stakeholder management",
	"A/B testing",
	"Roadmapping",
] as const

const MOCK_TAILORED = {
	before: "Ran reports for the product team each week.",
	after:
		"Built weekly SQL product-analytics reports that guided 3 roadmap bets and 12 A/B tests.",
	scoreBefore: 58,
	scoreAfter: 86,
} as const

const SNIPPET_FRAME =
	"rounded-xl border border-hairline bg-surface p-5 shadow-card sm:p-6"

function UploadSnippet() {
	return (
		<div className={SNIPPET_FRAME}>
			<div className="flex items-center gap-3 rounded-lg border border-dashed border-hairline-strong bg-surface-sunken/60 px-4 py-3">
				<FileText className="size-5 shrink-0 text-brand" aria-hidden />
				<div className="min-w-0 flex-1">
					<p className="truncate text-sm font-medium text-ink">
						jordan-lee-resume.pdf
					</p>
					<p className="text-xs text-ink-subtle">Parsed in 4s</p>
				</div>
				<Check className="size-4 text-emerald-600" aria-hidden />
			</div>
			<ul className="mt-4 divide-y divide-hairline">
				{MOCK_PARSED_SECTIONS.map((section) => (
					<li
						key={section.label}
						className="flex items-center justify-between py-2.5 text-sm"
					>
						<span className="text-ink">{section.label}</span>
						<span className="text-ink-subtle">{section.count}</span>
					</li>
				))}
			</ul>
		</div>
	)
}

function JobSnippet() {
	return (
		<div className={SNIPPET_FRAME}>
			<div className="flex items-center gap-2 rounded-md border border-hairline-strong px-3 py-2 text-sm text-ink-muted">
				<Link2 className="size-4 shrink-0 text-ink-subtle" aria-hidden />
				<span className="truncate">careers.brightline.io/jobs/product-analyst</span>
			</div>
			<p className="mt-4 text-sm font-semibold text-ink">Product Analyst · Brightline</p>
			<p className="mt-1 text-xs font-semibold uppercase tracking-[0.08em] text-ink-subtle">
				Keywords found
			</p>
			<ul className="mt-2.5 flex flex-wrap gap-1.5">
				{MOCK_JOB_KEYWORDS.map((keyword) => (
					<li
						key={keyword}
						className="rounded-md bg-brand-soft px-2 py-1 text-xs font-medium text-brand-ink"
					>
						{keyword}
					</li>
				))}
			</ul>
		</div>
	)
}

function TailoredSnippet() {
	return (
		<div className={SNIPPET_FRAME}>
			<div className="flex items-center gap-3">
				<ScoreRing value={MOCK_TAILORED.scoreBefore} size={40} />
				<ArrowRight className="size-4 text-ink-subtle" aria-hidden />
				<ScoreRing value={MOCK_TAILORED.scoreAfter} size={40} />
				<p className="ml-1 text-sm text-ink-muted">Match score</p>
			</div>
			<p className="mt-5 text-sm text-ink-subtle line-through decoration-hairline-strong">
				{MOCK_TAILORED.before}
			</p>
			<p className="mt-2 flex gap-2 text-sm leading-relaxed text-ink">
				<Sparkles className="mt-0.5 size-4 shrink-0 text-brand" aria-hidden />
				{MOCK_TAILORED.after}
			</p>
		</div>
	)
}

const STEP_SNIPPETS: readonly ReactNode[] = [
	<UploadSnippet key="upload" />,
	<JobSnippet key="job" />,
	<TailoredSnippet key="tailored" />,
]

export function HowItWorks() {
	const reduceMotion = useReducedMotion()
	const { howItWorks } = useLandingCopy()

	return (
		<section
			id={LANDING_SECTION_ID.howItWorks}
			className="scroll-mt-20 py-20 sm:py-28"
		>
			<div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
				<LandingSectionHeading
					eyebrow={howItWorks.eyebrow}
					title={howItWorks.title}
					description={howItWorks.description}
				/>

				<ol className="mt-14 space-y-16 sm:mt-20 sm:space-y-24">
					{howItWorks.steps.map((step, index) => {
						const snippet = STEP_SNIPPETS[index]
						const isReversed = index % 2 === 1

						return (
							<motion.li
								key={step.title}
								initial={reduceMotion ? false : { opacity: 0, y: 16 }}
								whileInView={{ opacity: 1, y: 0 }}
								viewport={landingRevealViewport}
								transition={{ duration: 0.5, ease: LANDING_EASE_OUT }}
								className="grid items-center gap-8 md:grid-cols-2 md:gap-14 lg:gap-20"
							>
								<div className={cn(isReversed && "md:order-2")}>
									<p className="font-display text-sm font-medium tabular-nums text-brand">
										Step {index + 1}
									</p>
									<h3 className="mt-2 font-display text-2xl font-medium tracking-tight text-ink sm:text-[1.75rem]">
										{step.title}
									</h3>
									<p className="mt-3 max-w-md text-base leading-relaxed text-ink-muted">
										{step.body}
									</p>
								</div>
								{snippet ? (
									<div className={cn("min-w-0", isReversed && "md:order-1")}>
										{snippet}
									</div>
								) : null}
							</motion.li>
						)
					})}
				</ol>

				<div className="mx-auto mt-20 max-w-4xl sm:mt-28">
					<HeroDemoVideo />
				</div>
			</div>
		</section>
	)
}
