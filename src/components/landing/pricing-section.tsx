import { motion } from "framer-motion"
import { Link } from "react-router-dom"
import { Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ROUTES } from "@/lib/constants"
import { cn } from "@/lib/utils"

const plans = [
	{
		name: "Free",
		price: "$0",
		desc: "See the gap and try tailored outputs on a lighter limit.",
		features: [
			"Limited tailored resume + cover generations per week",
			"Limited long-answer depth each week",
			"Match / ATS-gap view with capped runs",
			"Basic form field assist on applications",
			"Community-speed updates",
		],
		cta: "Create free account",
		href: ROUTES.signup,
		highlight: false,
	},
	{
		name: "Pro",
		price: "$9.99",
		period: "/month",
		desc: "For seekers who refuse to lose roles to the filter.",
		features: [
			"Unlimited tailored resume + cover letter generation",
			"Unlimited long-answer and prompt support",
			"Unlimited match / ATS-gap analysis",
			"Faster iteration on rewrites, tone, and structure",
			"Full form field assist + smart mapping (included)",
			"Priority updates as we ship new boards",
		],
		cta: "Go Pro",
		href: ROUTES.signup,
		highlight: true,
	},
] as const

export function PricingSection() {
	return (
		<section id="pricing" className="scroll-mt-24 py-20 sm:py-24">
			<div className="mx-auto max-w-6xl px-4 sm:px-6">
				<div className="max-w-2xl">
					<p className="text-sm font-semibold uppercase tracking-wider text-primary">
						Pricing
					</p>
					<h2 className="mt-2 font-display text-3xl font-bold tracking-tight sm:text-4xl">
						Two plans. Same mission: get documents past the filter.
					</h2>
					<p className="mt-4 text-muted-foreground">
						Free lets you feel the workflow. Pro removes caps on the tailored
						resume, cover letter, and long-answer output that actually move
						shortlists.
					</p>
				</div>

				<div className="mt-12 grid gap-6 lg:grid-cols-2">
					{plans.map((plan, i) => (
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
							transition={{ delay: 0.06 * i, duration: 0.45 }}
						>
							{plan.highlight ? (
								<span className="absolute right-6 top-6 rounded-full bg-primary px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-primary-foreground">
									Most popular
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
								{plan.features.map((f) => (
									<li key={f} className="flex gap-2.5">
										<Check
											className="mt-0.5 size-4 shrink-0 text-primary"
											aria-hidden
										/>
										{f}
									</li>
								))}
							</ul>
							<div className="mt-8 flex flex-col gap-2 sm:flex-row">
								<Button
									size="lg"
									surface="dark"
									className="flex-1"
									variant={plan.highlight ? "default" : "secondary"}
									asChild
								>
									<Link to={plan.href}>{plan.cta}</Link>
								</Button>
								{/* <Button size="lg" variant="ghost" surface="dark" className="flex-1" asChild>
									<a
										href={LINKS.extensionDownload}
										target="_blank"
										rel="noopener noreferrer"
									>
										Get extension
									</a>
								</Button> */}
							</div>
						</motion.div>
					))}
				</div>
			</div>
		</section>
	)
}
