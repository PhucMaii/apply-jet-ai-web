import { motion, useReducedMotion } from "framer-motion"
import { LANDING_EASE_OUT } from "@/lib/landing-motion"
import { cn } from "@/lib/utils"

const RESUME = {
	name: "Alex Chen",
	role: "Senior Full Stack Developer",
	tailoredFor: "Meridian Pay · Fintech",
	contact: ["alex.chen@email.com", "San Francisco, CA"],
	matchScore: 87,
	summary:
		"Full stack engineer with 5+ years building React and Node.js products. Focused on API performance, cross-functional delivery, and production reliability in regulated fintech environments.",
	experience: {
		title: "Full Stack Developer",
		company: "TuneZilla Software Ltd",
		dates: "2021 – Present",
		bullets: [
			"Built React and Node.js features for the customer dashboard",
			"Improved API response time by optimizing slow database queries",
		],
		tailoredBullet:
			"Architected React + Node.js dashboard for 12K daily users; cut API latency 40% via query caching and connection pooling",
	},
	skills: {
		core: ["React", "Node.js", "PostgreSQL", "TypeScript"],
		matched: ["API performance", "Fintech", "Cross-functional"],
	},
} as const

const TAILORED_KEYWORDS = ["React", "Node.js", "API latency"] as const

function highlightKeywords(text: string, keywords: readonly string[]) {
	const parts: Array<{ text: string; highlight: boolean }> = []
	let remaining = text

	for (const keyword of keywords) {
		const index = remaining.indexOf(keyword)
		if (index === -1) continue

		if (index > 0) {
			parts.push({ text: remaining.slice(0, index), highlight: false })
		}
		parts.push({ text: keyword, highlight: true })
		remaining = remaining.slice(index + keyword.length)
	}

	if (remaining) {
		parts.push({ text: remaining, highlight: false })
	}

	return parts.length > 0 ? parts : [{ text, highlight: false }]
}

function TailoredBullet({
	text,
	reduceMotion,
}: {
	text: string
	reduceMotion: boolean | null
}) {
	const parts = highlightKeywords(text, TAILORED_KEYWORDS)

	if (reduceMotion) {
		return (
			<span className="text-landing-ink">
				{parts.map((part, i) =>
					part.highlight ? (
						<mark
							key={i}
							className="rounded-sm bg-landing-accent/25 px-0.5 font-medium text-landing-ink"
						>
							{part.text}
						</mark>
					) : (
						<span key={i}>{part.text}</span>
					),
				)}
			</span>
		)
	}

	return (
		<motion.span
			className="block text-landing-ink"
			initial={{ opacity: 0, y: 6 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.5, ease: LANDING_EASE_OUT, delay: 0.9 }}
		>
			{parts.map((part, i) =>
				part.highlight ? (
					<motion.mark
						key={i}
						className="rounded-sm bg-landing-accent/25 px-0.5 font-medium text-landing-ink"
						initial={{ backgroundColor: "rgba(201, 169, 110, 0)" }}
						animate={{ backgroundColor: "rgba(201, 169, 110, 0.25)" }}
						transition={{
							duration: 0.4,
							ease: LANDING_EASE_OUT,
							delay: 1.2 + i * 0.15,
						}}
					>
						{part.text}
					</motion.mark>
				) : (
					<span key={i}>{part.text}</span>
				),
			)}
		</motion.span>
	)
}

interface HeroResumeMockProps {
	className?: string
}

export function HeroResumeMock({ className }: HeroResumeMockProps) {
	const reduceMotion = useReducedMotion()

	return (
		<motion.div
			initial={reduceMotion ? false : { opacity: 0, y: 24 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.6, ease: LANDING_EASE_OUT, delay: 0.15 }}
			className={cn(
				"relative w-full min-w-0 overflow-hidden rounded-xl border border-landing-border bg-landing-paper",
				"shadow-[0_1px_3px_rgba(26,26,46,0.06),0_12px_40px_-12px_rgba(26,26,46,0.12)]",
				className,
			)}
		>
			<div className="border-b border-landing-border/80 bg-landing-ink px-4 py-4 sm:px-6 sm:py-5">
				<div className="flex items-start justify-between gap-3">
					<div className="min-w-0 flex-1">
						<p className="truncate font-display text-lg font-medium tracking-tight text-landing-paper sm:text-xl">
							{RESUME.name}
						</p>
						<p className="mt-0.5 text-[11px] font-medium tracking-wide text-landing-muted-on-dark sm:text-xs">
							{RESUME.role}
						</p>
					</div>
					<span className="shrink-0 rounded-md border border-landing-primary/30 bg-landing-primary/15 px-2 py-1 text-[10px] font-semibold tabular-nums text-landing-paper sm:text-[11px]">
						{RESUME.matchScore}% match
					</span>
				</div>

				<p className="mt-2 text-[10px] text-landing-muted-on-dark/90 sm:text-[11px]">
					Tailored for {RESUME.tailoredFor}
				</p>

				<div className="mt-2.5 flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-landing-muted-on-dark/75 sm:text-[11px]">
					{RESUME.contact.map((item) => (
						<span key={item} className="break-all sm:break-normal">
							{item}
						</span>
					))}
				</div>
			</div>

			<div className="space-y-4 px-4 py-4 sm:space-y-5 sm:px-6 sm:py-5">
				<div>
					<p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-landing-ink/50">
						Summary
					</p>
					<p className="mt-2 text-[11px] leading-relaxed text-landing-muted sm:text-xs sm:leading-relaxed">
						{RESUME.summary}
					</p>
				</div>

				<div>
					<p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-landing-ink/50">
						Experience
					</p>
					<div className="mt-2 space-y-1">
						<p className="text-xs font-semibold text-landing-ink sm:text-sm">
							{RESUME.experience.title}
						</p>
						<p className="text-[11px] text-landing-muted sm:text-xs">
							{RESUME.experience.company} · {RESUME.experience.dates}
						</p>
					</div>
					<ul className="mt-2.5 list-outside list-disc space-y-1.5 pl-4 marker:text-landing-muted/50">
						{RESUME.experience.bullets.map((bullet) => (
							<li
								key={bullet}
								className="text-[11px] leading-relaxed text-landing-muted sm:text-xs"
							>
								{bullet}
							</li>
						))}
						<li className="text-[11px] leading-relaxed sm:text-xs">
							<TailoredBullet
								text={RESUME.experience.tailoredBullet}
								reduceMotion={reduceMotion}
							/>
						</li>
					</ul>
				</div>

				<div>
					<p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-landing-ink/50">
						Skills
					</p>
					<div className="mt-2 flex flex-wrap gap-1.5">
						{RESUME.skills.core.map((skill) => (
							<span
								key={skill}
								className="rounded-md border border-landing-border bg-landing-sand/80 px-2 py-0.5 text-[10px] font-medium text-landing-ink sm:text-[11px]"
							>
								{skill}
							</span>
						))}
						{RESUME.skills.matched.map((skill) => (
							<span
								key={skill}
								className="rounded-md border border-landing-primary/20 bg-landing-primary/8 px-2 py-0.5 text-[10px] font-medium text-landing-primary sm:text-[11px]"
							>
								{skill}
							</span>
						))}
					</div>
				</div>

				<div className="flex flex-col gap-2 border-t border-landing-border/60 pt-3 sm:flex-row sm:items-center sm:gap-3">
					<span className="inline-flex w-fit items-center gap-1.5 rounded-md bg-landing-primary/8 px-2 py-1 text-[10px] font-medium text-landing-primary sm:text-[11px]">
						<span
							className="size-1.5 shrink-0 rounded-full bg-landing-primary"
							aria-hidden
						/>
						Tailored for this role
					</span>
					<span className="text-[10px] leading-snug text-landing-muted sm:text-[11px]">
						Keywords pulled from the job description
					</span>
				</div>
			</div>
		</motion.div>
	)
}
