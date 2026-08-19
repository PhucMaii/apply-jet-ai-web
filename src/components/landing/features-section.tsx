import { motion } from "framer-motion"
import {
	CalendarDays,
	FileText,
	Gauge,
	List,
	Sparkles,
	Users,
	type LucideIcon,
} from "lucide-react"
import { useLandingCopy } from "@/context/landing-copy-context"
import type { LandingFeatureIconKey } from "@/lib/landing/landing-section"
import { cn } from "@/lib/utils"

const easeOutExpo = [0.22, 1, 0.36, 1] as [number, number, number, number]

const FEATURE_ICONS: Record<LandingFeatureIconKey, LucideIcon> = {
	calendar: CalendarDays,
	gauge: Gauge,
	list: List,
	sparkles: Sparkles,
	fileText: FileText,
	users: Users,
}

export function FeaturesSection() {
	const { features } = useLandingCopy()
	return (
		<section id="features" className="scroll-mt-24 py-20 sm:py-24">
			<div className="mx-auto max-w-6xl px-4 sm:px-6">
				<div className="max-w-2xl">
					<p className="text-sm font-semibold uppercase tracking-wider text-primary">
						{features.eyebrow}
					</p>
					<h2 className="mt-2 font-display text-3xl font-bold tracking-tight sm:text-4xl">
						{features.title}
					</h2>
					<p className="mt-4 text-muted-foreground">{features.description}</p>
				</div>

				<div className="mt-12 grid gap-4 md:grid-cols-3">
					{features.items.map((feature, index) => {
						const Icon = FEATURE_ICONS[feature.icon]
						return (
							<motion.div
								key={feature.title}
								className={cn(
									"group relative overflow-hidden rounded-2xl border border-border/70 bg-card/45 p-6",
									"hover:border-primary/35 hover:shadow-glow-sm",
									feature.className,
								)}
								initial={{ opacity: 0, y: 16 }}
								whileInView={{ opacity: 1, y: 0 }}
								viewport={{ once: true, margin: "-30px" }}
								transition={{
									delay: 0.04 * index,
									duration: 0.45,
									ease: easeOutExpo,
								}}
							>
								<div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100">
									<div className="absolute -right-10 -top-10 size-40 rounded-full bg-primary/15 blur-3xl" />
								</div>
								<div className="relative flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/25">
									<Icon className="size-5" aria-hidden />
								</div>
								<h3 className="relative mt-4 font-display text-lg font-semibold">
									{feature.title}
								</h3>
								<p className="relative mt-2 text-sm leading-relaxed text-muted-foreground">
									{feature.body}
								</p>
							</motion.div>
						)
					})}
				</div>
			</div>
		</section>
	)
}
