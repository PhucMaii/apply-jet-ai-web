import { motion, useReducedMotion } from "framer-motion"
import { Check, Plus, Sparkles } from "lucide-react"
import { ScoreRing } from "@/components/ui/score-ring"
import { LANDING_EASE_OUT } from "@/lib/landing-motion"
import { cn } from "@/lib/utils"

const MOCK_JOB = {
	title: "Senior Frontend Engineer",
	company: "Lumen Health",
	location: "Remote · US & Canada",
	scoreBefore: 61,
	scoreAfter: 88,
} as const

const MOCK_KEYWORDS = [
	{ label: "React", isMatched: true },
	{ label: "TypeScript", isMatched: true },
	{ label: "Design systems", isMatched: true },
	{ label: "Accessibility", isMatched: true },
	{ label: "GraphQL", isMatched: false },
	{ label: "Storybook", isMatched: false },
] as const

const MOCK_REWRITE = {
	role: "Frontend Engineer · Northwind",
	before:
		"Worked on the patient portal UI and fixed bugs reported by the support team.",
	after:
		"Rebuilt the patient portal in React + TypeScript on a shared design system, lifting accessibility to WCAG AA and cutting UI bug reports 42%.",
	highlights: ["React + TypeScript", "design system", "accessibility"],
} as const

function HighlightedSentence({
	text,
	highlights,
}: {
	text: string
	highlights: readonly string[]
}) {
	const pattern = new RegExp(`(${highlights.join("|")})`, "gi")
	const parts = text.split(pattern)

	return (
		<>
			{parts.map((part, index) => {
				const isHighlight = highlights.some(
					(item) => item.toLowerCase() === part.toLowerCase(),
				)
				return isHighlight ? (
					<mark
						key={`${part}-${index}`}
						className="rounded-[3px] bg-brand-soft px-0.5 font-medium text-brand-ink"
					>
						{part}
					</mark>
				) : (
					<span key={`${part}-${index}`}>{part}</span>
				)
			})}
		</>
	)
}

export function HeroProductMockup({ className }: { className?: string }) {
	const reduceMotion = useReducedMotion()
	const matchedCount = MOCK_KEYWORDS.filter((item) => item.isMatched).length

	return (
		<motion.div
			initial={reduceMotion ? false : { opacity: 0, y: 24 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.6, ease: LANDING_EASE_OUT, delay: 0.15 }}
			className={cn("relative", className)}
			aria-label="Preview of the ApplyJet resume tailoring workspace"
			role="img"
		>
			<div className="overflow-hidden rounded-xl border border-hairline bg-surface shadow-pop">
				<div className="flex items-center gap-3 border-b border-hairline bg-surface-sunken/70 px-4 py-2.5">
					<div className="flex gap-1.5" aria-hidden>
						<span className="size-2.5 rounded-full bg-hairline-strong" />
						<span className="size-2.5 rounded-full bg-hairline-strong" />
						<span className="size-2.5 rounded-full bg-hairline-strong" />
					</div>
					<p className="min-w-0 truncate text-xs font-medium text-ink-muted">
						{MOCK_JOB.title} · {MOCK_JOB.company}
					</p>
				</div>

				<div className="grid sm:grid-cols-[13rem_1fr]">
					<div className="space-y-5 border-b border-hairline p-4 sm:border-r sm:border-b-0 sm:p-5">
						<div className="flex items-center gap-3">
							<ScoreRing
								value={MOCK_JOB.scoreAfter}
								size={56}
								strokeWidth={5}
								valueClassName="text-base"
							/>
							<div>
								<p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-subtle">
									Match score
								</p>
								<p className="mt-0.5 text-sm font-semibold text-ink">
									<span className="text-ink-subtle line-through decoration-1">
										{MOCK_JOB.scoreBefore}
									</span>{" "}
									→ {MOCK_JOB.scoreAfter}
								</p>
							</div>
						</div>

						<div>
							<p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-subtle">
								Keywords · {matchedCount}/{MOCK_KEYWORDS.length}
							</p>
							<ul className="mt-2.5 flex flex-wrap gap-1.5 sm:flex-col sm:flex-nowrap">
								{MOCK_KEYWORDS.map((keyword) => (
									<li
										key={keyword.label}
										className={cn(
											"inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium",
											keyword.isMatched
												? "bg-emerald-50 text-emerald-800"
												: "border border-dashed border-hairline-strong text-ink-muted",
										)}
									>
										{keyword.isMatched ? (
											<Check className="size-3" aria-hidden />
										) : (
											<Plus className="size-3" aria-hidden />
										)}
										{keyword.label}
									</li>
								))}
							</ul>
						</div>
					</div>

					<div className="p-4 sm:p-6">
						<p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-subtle">
							Experience
						</p>
						<p className="mt-2 text-sm font-semibold text-ink">
							{MOCK_REWRITE.role}
						</p>

						<p className="mt-3 text-[13px] leading-relaxed text-ink-subtle line-through decoration-hairline-strong max-sm:hidden">
							{MOCK_REWRITE.before}
						</p>

						<div className="mt-3 rounded-lg border border-brand/20 bg-brand-soft/40 p-3">
							<p className="mb-1.5 inline-flex items-center gap-1 text-[11px] font-semibold text-brand">
								<Sparkles className="size-3" aria-hidden />
								Tailored for this role
							</p>
							<p className="text-[13px] leading-relaxed text-ink">
								<HighlightedSentence
									text={MOCK_REWRITE.after}
									highlights={MOCK_REWRITE.highlights}
								/>
							</p>
						</div>

						<div className="mt-4 space-y-2" aria-hidden>
							<div className="h-2 w-11/12 rounded-full bg-surface-sunken" />
							<div className="h-2 w-4/5 rounded-full bg-surface-sunken" />
							<div className="h-2 w-2/3 rounded-full bg-surface-sunken" />
						</div>
					</div>
				</div>
			</div>
		</motion.div>
	)
}
