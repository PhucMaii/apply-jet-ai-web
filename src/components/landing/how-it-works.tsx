import { motion } from "framer-motion"
import { FileStack, FileUp, Globe, ScanText, Sparkles } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

const steps = [
	{
		title: "Upload your resume",
		body: "One secure profile—your facts, skills, and wins become the source for every tailored version.",
		icon: FileUp,
		accent: "from-primary/30 to-transparent",
	},
	{
		title: "Visit any job site",
		body: "Browse normally. When a posting loads, the extension wakes up beside you.",
		icon: Globe,
		accent: "from-accent/25 to-transparent",
	},
	{
		title: "Posting read for ATS signals",
		body: "Role, requirements, and keywords pulled from the page—the same language parsers score against.",
		icon: ScanText,
		accent: "from-primary/25 to-transparent",
	},
	{
		title: "See the gap before you waste an hour",
		body: "Match view shows where your baseline resume misaligns with this specific JD—before you submit into the void.",
		icon: Sparkles,
		accent: "from-accent/30 to-transparent",
	},
	{
		title: "Tailored resume, cover letter, long answers",
		body: "Generate materials woven to this posting: ATS-aware resume, JD-grounded cover letter, and strong responses to behavioral prompts.",
		icon: FileStack,
		accent: "from-primary/35 to-transparent",
	},
] as const

export function HowItWorks() {
	return (
		<section id="how-it-works" className="scroll-mt-24 py-20 sm:py-24">
			<div className="mx-auto max-w-6xl px-4 sm:px-6">
				<div className="max-w-2xl">
					<p className="text-sm font-semibold uppercase tracking-wider text-primary">
						How it works
					</p>
					<h2 className="mt-2 font-display text-3xl font-bold tracking-tight sm:text-4xl">
						From job post to tailored packet—without guessing what ATS wants.
					</h2>
					<p className="mt-4 text-muted-foreground">
						The bottleneck is rarely your ambition. It is the filter. Every
						step here is aimed at documents and answers that still look like
						you—just aligned to what this posting actually asks for.
					</p>
				</div>

				<div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
					{steps.map((step, index) => (
						<motion.div
							key={step.title}
							initial={{ opacity: 0, y: 22 }}
							whileInView={{ opacity: 1, y: 0 }}
							viewport={{ once: true, margin: "-40px" }}
							transition={{
								delay: 0.06 * index,
								duration: 0.5,
								ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
							}}
						>
							<Card
								className={cn(
									"h-full overflow-hidden border-border/70 bg-card/50",
									"hover:border-primary/35 hover:shadow-glow-sm",
								)}
							>
								<div
									className={cn(
										"h-1 w-full bg-gradient-to-r",
										step.accent,
									)}
								/>
								<CardContent className="p-6">
									<div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/25">
										<step.icon className="size-5" aria-hidden />
									</div>
									<p className="mt-4 text-xs font-semibold text-muted-foreground">
										Step {index + 1}
									</p>
									<h3 className="mt-1 font-display text-lg font-semibold">
										{step.title}
									</h3>
									<p className="mt-2 text-sm leading-relaxed text-muted-foreground">
										{step.body}
									</p>
								</CardContent>
							</Card>
						</motion.div>
					))}
				</div>
			</div>
		</section>
	)
}
