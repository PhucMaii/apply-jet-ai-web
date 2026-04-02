import { motion } from "framer-motion"
import {
	Bolt,
	Brain,
	ClipboardList,
	FileText,
	Gauge,
	Mail,
	MessageSquareText,
} from "lucide-react"
import { cn } from "@/lib/utils"

const easeOutExpo = [0.22, 1, 0.36, 1] as [number, number, number, number]

const features = [
	{
		title: "Tailored resume for every posting",
		body: "Regenerate a resume version woven to this JD—keywords, scope, and outcomes phrased the way ATS and recruiters scan for.",
		icon: FileText,
		className: "md:col-span-2",
	},
	{
		title: "Cover letters that cite the role",
		body: "Stop generic openers. Draft a letter that references this company, this stack, and your matched proof points.",
		icon: Mail,
		className: "md:col-span-2",
	},
	{
		title: "Long answers that sound like you",
		body: "Behavioral prompts, “why this role,” and multi-paragraph screens—answered with structure, specificity, and your real experience.",
		icon: MessageSquareText,
		className: "",
	},
	{
		title: "ATS gap analysis, not vanity metrics",
		body: "See overlap and misses against the posting before you submit—so you know why you might vanish from the funnel.",
		icon: Gauge,
		className: "",
	},
	{
		title: "Instant posting intelligence",
		body: "Requirements and language extracted in-panel—no copy-paste archaeology across tabs.",
		icon: ClipboardList,
		className: "md:col-span-2",
	},
	{
		title: "Form field assist (included)",
		body: "We still map short fields and basics so you spend brainpower on the documents that decide shortlists—not retyping your email.",
		icon: Bolt,
		className: "",
	},
	{
		title: "Language and structure coaching",
		body: "Signals on tone, repetition, and missing proof where tightening one paragraph can change how a parser scores you.",
		icon: Brain,
		className: "md:col-span-2",
	},
] as const

export function FeaturesSection() {
	return (
		<section id="features" className="scroll-mt-24 py-20 sm:py-24">
			<div className="mx-auto max-w-6xl px-4 sm:px-6">
				<div className="max-w-2xl">
					<p className="text-sm font-semibold uppercase tracking-wider text-primary">
						What you actually ship
					</p>
					<h2 className="mt-2 font-display text-3xl font-bold tracking-tight sm:text-4xl">
						Tailored materials first. The ATS wall is the problem we solve.
					</h2>
					<p className="mt-4 text-muted-foreground">
						Autofill is useful; getting past automated screening is the job.
						Everything here orbits resumes, cover letters, and long-form answers
						grounded in the posting—not generic templates.
					</p>
				</div>

				<div className="mt-12 grid gap-4 md:grid-cols-3">
					{features.map((f, i) => (
						<motion.div
							key={f.title}
							className={cn(
								"group relative overflow-hidden rounded-2xl border border-border/70 bg-card/45 p-6",
								"hover:border-primary/35 hover:shadow-glow-sm",
								f.className,
							)}
							initial={{ opacity: 0, y: 16 }}
							whileInView={{ opacity: 1, y: 0 }}
							viewport={{ once: true, margin: "-30px" }}
							transition={{
								delay: 0.04 * i,
								duration: 0.45,
								ease: easeOutExpo,
							}}
						>
							<div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100">
								<div className="absolute -right-10 -top-10 size-40 rounded-full bg-primary/15 blur-3xl" />
							</div>
							<div className="relative flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/25">
								<f.icon className="size-5" aria-hidden />
							</div>
							<h3 className="relative mt-4 font-display text-lg font-semibold">
								{f.title}
							</h3>
							<p className="relative mt-2 text-sm leading-relaxed text-muted-foreground">
								{f.body}
							</p>
						</motion.div>
					))}
				</div>
			</div>
		</section>
	)
}
