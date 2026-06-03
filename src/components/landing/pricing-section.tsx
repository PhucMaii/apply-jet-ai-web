import { motion } from "framer-motion"
import { Link } from "react-router-dom"
import { Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ROUTES } from "@/lib/constants"
import { LANDING_COPY } from "@/lib/landing-copy"
import { cn } from "@/lib/utils"

const { pricing } = LANDING_COPY

const plans = [
	{ ...pricing.plans.free, href: ROUTES.signup, highlight: false },
	{ ...pricing.plans.pro, href: ROUTES.signup, highlight: true },
] as const

export function PricingSection() {
	return (
		<section id="pricing" className="scroll-mt-24 py-20 sm:py-24">
			<div className="mx-auto max-w-6xl px-4 sm:px-6">
				<div className="max-w-2xl">
					<p className="text-sm font-semibold uppercase tracking-wider text-primary">
						{pricing.eyebrow}
					</p>
					<h2 className="mt-2 font-display text-3xl font-bold tracking-tight sm:text-4xl">
						{pricing.title}
					</h2>
					<p className="mt-4 text-muted-foreground">{pricing.description}</p>
				</div>

				<div className="mt-12 grid gap-6 lg:grid-cols-2">
					{plans.map((plan, index) => (
						<motion.div
							key={plan.name}
							className={cn(
								"relative flex flex-col rounded-2xl border p-6 sm:p-8",
								plan.highlight
									? "border-primary/50 bg-gradient-to-b from-primary/15 via-card/80 to-background shadow-glow"
									: "border-border/70 bg-card/40",
							)}
							initial={{ opacity: 0, y: 18 }}
							whileInView={{ opacity: 1, y: 0 }}
							viewport={{ once: true }}
							transition={{ delay: 0.06 * index, duration: 0.45 }}
						>
							{plan.highlight && "badge" in plan ? (
								<span className="absolute right-6 top-6 rounded-full bg-primary px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-primary-foreground">
									{plan.badge}
								</span>
							) : null}
							<div>
								<h3 className="font-display text-2xl font-bold">{plan.name}</h3>
								<p className="mt-2 text-sm text-muted-foreground">{plan.desc}</p>
								<div className="mt-6 flex items-baseline gap-1">
									<span className="font-display text-4xl font-extrabold tracking-tight">
										{plan.price}
									</span>
									{"period" in plan ? (
										<span className="text-sm text-muted-foreground">
											{plan.period}
										</span>
									) : null}
								</div>
							</div>
							<ul className="mt-8 flex-1 space-y-3 text-sm text-muted-foreground">
								{plan.features.map((feature) => (
									<li key={feature} className="flex gap-2.5">
										<Check
											className="mt-0.5 size-4 shrink-0 text-primary"
											aria-hidden
										/>
										{feature}
									</li>
								))}
							</ul>
							<div className="mt-8">
								<Button
									size="lg"
									surface="dark"
									className="w-full"
									variant={plan.highlight ? "default" : "secondary"}
									asChild
								>
									<Link to={plan.href}>{plan.cta}</Link>
								</Button>
							</div>
						</motion.div>
					))}
				</div>
			</div>
		</section>
	)
}
