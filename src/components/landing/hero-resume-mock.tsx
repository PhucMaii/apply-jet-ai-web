import { motion, useReducedMotion } from "framer-motion"
import { LANDING_EASE_OUT } from "@/lib/landing-motion"
import { cn } from "@/lib/utils"

/** Layout mirrors a classic Microsoft-style resume (header → summary → experience → education → skills). */
const RESUME = {
	name: "Alex Chen",
	role: "Software Engineer",
	contact: "San Francisco, CA | 415-555-0198 | alex.chen@email.com",
	matchScore: 87,
	tailoredFor: "Meridian Pay · Fintech",
	summary:
		"Full Stack Software Engineer with 5+ years of experience building scalable web applications and backend services. Proven track record in designing robust system modules, optimizing database performance, and collaborating with cross-functional teams to deliver user-centric solutions. Expert in TypeScript, React, and SQL, with a strong focus on modern web standards and production reliability.",
	experience: [
		{
			title: "Senior Full Stack Developer",
			company: "Meridian Pay",
			dates: "January 2023 – Present",
			bullets: [
				"Architected React + Node.js dashboard for 12K daily users; cut API latency 40% via query caching and connection pooling.",
				"Led cross-functional delivery with product and design—shipped 6 major features ahead of quarterly roadmap.",
				"Refactored legacy REST endpoints for fintech compliance; reduced production incidents 30% quarter-over-quarter.",
			],
			highlightKeywords: ["React", "Node.js", "API latency"] as const,
		},
		{
			title: "Full Stack Developer",
			company: "TuneZilla Software Ltd",
			dates: "June 2021 – December 2022",
			bullets: [
				"Built React and Node.js features for the customer dashboard used by internal ops and external clients.",
				"Improved API response time by optimizing slow PostgreSQL queries and adding targeted indexes.",
			],
			highlightKeywords: [] as const,
		},
	],
	education: {
		degree: "B.S. Computer Science",
		school: "State University",
		dates: "September 2017 – May 2021",
	},
	skills: [
		{
			label: "Programming Languages",
			items: "TypeScript, JavaScript, Python, SQL",
		},
		{
			label: "Frameworks & Libraries",
			items: "React, Node.js, TanStack Query, Tailwind CSS",
		},
		{
			label: "Developer Tools",
			items: "Git, PostgreSQL, Supabase, Stripe API, GraphQL",
		},
	],
} as const

function highlightKeywords(text: string, keywords: readonly string[]) {
	if (keywords.length === 0) {
		return [{ text, highlight: false }]
	}

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

function HighlightedText({
	text,
	keywords,
	reduceMotion,
	animate,
}: {
	text: string
	keywords: readonly string[]
	reduceMotion: boolean | null
	animate?: boolean
}) {
	const parts = highlightKeywords(text, keywords)

	if (!animate || reduceMotion || keywords.length === 0) {
		return (
			<span>
				{parts.map((part, i) =>
					part.highlight ? (
						<mark
							key={i}
							className="rounded-sm bg-landing-accent/25 px-0.5 font-medium text-neutral-900"
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
			className="block"
			initial={{ opacity: 0, y: 4 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.45, ease: LANDING_EASE_OUT, delay: 0.85 }}
		>
			{parts.map((part, i) =>
				part.highlight ? (
					<motion.mark
						key={i}
						className="rounded-sm bg-landing-accent/25 px-0.5 font-medium text-neutral-900"
						initial={{ backgroundColor: "rgba(201, 169, 110, 0)" }}
						animate={{ backgroundColor: "rgba(201, 169, 110, 0.25)" }}
						transition={{
							duration: 0.4,
							ease: LANDING_EASE_OUT,
							delay: 1.1 + i * 0.12,
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

function SectionHeading({ children }: { children: string }) {
	return (
		<p className="border-b border-neutral-800 pb-0.5 text-[10px] font-bold uppercase tracking-[0.12em] text-neutral-800 sm:text-[11px]">
			{children}
		</p>
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
				"relative w-full min-w-0 overflow-hidden rounded-sm border border-neutral-200 bg-white",
				"shadow-[0_1px_2px_rgba(15,23,42,0.04),0_16px_48px_-16px_rgba(15,23,42,0.14)]",
				className,
			)}
		>
			{/* Floating product cue — not part of the print layout */}
			<div className="absolute top-3 right-3 z-10 flex flex-col items-end gap-1.5 sm:top-4 sm:right-4">
				<span className="rounded border border-landing-primary/25 bg-white/95 px-2 py-1 text-[10px] font-semibold tabular-nums text-landing-primary shadow-sm backdrop-blur-sm sm:text-[11px]">
					{RESUME.matchScore}% match
				</span>
				<span className="hidden rounded bg-landing-ink/90 px-2 py-0.5 text-[9px] font-medium text-white sm:inline">
					AI matched to {RESUME.tailoredFor}
				</span>
			</div>

			{/* Letter-style page body */}
			<div className="max-h-[min(34rem,70vh)] overflow-y-auto overscroll-contain px-5 py-6 sm:px-8 sm:py-8 lg:max-h-none lg:overflow-visible">
				{/* Header — Microsoft-style centered name block */}
				<header className="text-center">
					<h2 className="text-[1.35rem] font-semibold leading-tight tracking-tight text-neutral-900 sm:text-[1.7rem]">
						{RESUME.name}
					</h2>
					<p className="mt-1 text-[12px] text-neutral-800 sm:text-[13px]">
						{RESUME.role}
					</p>
					<p className="mt-1.5 text-[10px] leading-relaxed text-neutral-600 sm:text-[11px]">
						{RESUME.contact}
					</p>
				</header>

				{/* Summary */}
				<section className="mt-5 sm:mt-6">
					<SectionHeading>Summary</SectionHeading>
					<p className="mt-2 text-[10px] leading-[1.45] text-neutral-700 sm:text-[11px] sm:leading-[1.5]">
						{RESUME.summary}
					</p>
				</section>

				{/* Experience */}
				<section className="mt-4 sm:mt-5">
					<SectionHeading>Experience</SectionHeading>
					<div className="mt-2.5 space-y-4">
						{RESUME.experience.map((job, jobIndex) => (
							<div key={`${job.company}-${job.title}`}>
								<p className="text-[11px] font-bold text-neutral-900 sm:text-[12px]">
									{job.title}
								</p>
								<p className="text-[10px] text-neutral-800 sm:text-[11px]">
									{job.company}
								</p>
								<p className="text-[10px] italic text-neutral-500 sm:text-[11px]">
									{job.dates}
								</p>
								<ul className="mt-1.5 list-outside list-disc space-y-1 pl-4 marker:text-neutral-400">
									{job.bullets.map((bullet, bulletIndex) => (
										<li
											key={bullet}
											className="text-[10px] leading-[1.45] text-neutral-700 sm:text-[11px] sm:leading-[1.5]"
										>
											<HighlightedText
												text={bullet}
												keywords={job.highlightKeywords}
												reduceMotion={reduceMotion}
												animate={jobIndex === 0 && bulletIndex === 0}
											/>
										</li>
									))}
								</ul>
							</div>
						))}
					</div>
				</section>

				{/* Education */}
				<section className="mt-4 sm:mt-5">
					<SectionHeading>Education</SectionHeading>
					<div className="mt-2">
						<p className="text-[11px] font-bold text-neutral-900 sm:text-[12px]">
							{RESUME.education.degree}
						</p>
						<p className="text-[10px] text-neutral-800 sm:text-[11px]">
							{RESUME.education.school}
						</p>
						<p className="text-[10px] italic text-neutral-500 sm:text-[11px]">
							{RESUME.education.dates}
						</p>
					</div>
				</section>

				{/* Skills — category lines like the PDF, not chips */}
				<section className="mt-4 sm:mt-5">
					<SectionHeading>Skills Section</SectionHeading>
					<ul className="mt-2 space-y-1">
						{RESUME.skills.map((group) => (
							<li
								key={group.label}
								className="text-[10px] leading-[1.45] text-neutral-700 sm:text-[11px] sm:leading-[1.5]"
							>
								<span className="font-semibold text-neutral-900">
									{group.label}:
								</span>{" "}
								{group.items}
							</li>
						))}
					</ul>
				</section>

				<p className="mt-5 flex items-center gap-2 border-t border-neutral-100 pt-3 text-[10px] text-neutral-500 sm:text-[11px]">
					<span
						className="size-1.5 shrink-0 rounded-full bg-landing-primary"
						aria-hidden
					/>
					Keywords highlighted from the job description
				</p>
			</div>
		</motion.div>
	)
}
