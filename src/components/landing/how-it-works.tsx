import { motion } from "framer-motion"
import { Briefcase, FileUp, Sparkles, UserPlus } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { LANDING_COPY } from "@/lib/landing-copy"
import { cn } from "@/lib/utils"

const stepIcons = [UserPlus, FileUp, Briefcase, Sparkles] as const
const stepAccents = [
	"from-primary/30 to-transparent",
	"from-accent/25 to-transparent",
	"from-primary/25 to-transparent",
	"from-accent/30 to-transparent",
] as const

const { howItWorks } = LANDING_COPY

export function HowItWorks() {
	return (
		<section id="how-it-works" className="scroll-mt-24 py-20 sm:py-24">
			<div className="mx-auto max-w-6xl px-4 sm:px-6">
				<div className="max-w-2xl">
					<p className="text-sm font-semibold uppercase tracking-wider text-primary">
						{howItWorks.eyebrow}
					</p>
					<h2 className="mt-2 font-display text-3xl font-bold tracking-tight sm:text-4xl">
						{howItWorks.title}
					</h2>
					<p className="mt-4 text-muted-foreground">{howItWorks.description}</p>
				</div>

				<div className="mt-14 grid gap-5 md:grid-cols-2">
					{howItWorks.steps.map((step, index) => {
						const Icon = stepIcons[index]
						return (
							<motion.div
								key={step.title}
								initial={{ opacity: 0, y: 22 }}
								whileInView={{ opacity: 1, y: 0 }}
								viewport={{ once: true, margin: "-40px" }}
								transition={{
									delay: 0.06 * index,
									duration: 0.5,
									ease: [0.22, 1, 0.36, 1] as [
										number,
										number,
										number,
										number,
									],
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
											stepAccents[index],
										)}
									/>
									<CardContent className="p-6">
										<div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/25">
											<Icon className="size-5" aria-hidden />
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
						)
					})}
				</div>
			</div>
		</section>
	)
}
