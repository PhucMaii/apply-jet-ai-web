import { motion } from "framer-motion"
import { Link } from "react-router-dom"
import { ArrowRight, Monitor } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ROUTES } from "@/lib/constants"
import { LANDING_COPY } from "@/lib/landing-copy"

const { authCta } = LANDING_COPY

export function AuthCtaSection() {
	return (
		<section className="py-20 sm:py-24">
			<div className="mx-auto max-w-6xl px-4 sm:px-6">
				<motion.div
					className="relative overflow-hidden rounded-3xl border border-primary/35 bg-gradient-to-br from-primary/20 via-card/70 to-background p-8 shadow-glow sm:p-12"
					initial={{ opacity: 0, y: 16 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					transition={{ duration: 0.5 }}
				>
					<div className="pointer-events-none absolute -left-24 top-0 size-72 rounded-full bg-accent/20 blur-3xl" />
					<div className="relative grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
						<div>
							<div className="inline-flex items-center gap-2 rounded-full border border-border bg-background/60 px-3 py-1 text-xs font-medium text-muted-foreground">
								<Monitor className="size-3.5 text-primary" aria-hidden />
								{authCta.badge}
							</div>
							<h2 className="mt-4 font-display text-3xl font-bold tracking-tight sm:text-4xl">
								{authCta.title}
							</h2>
							<p className="mt-4 max-w-xl text-muted-foreground">
								{authCta.description}
							</p>
						</div>
						<div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
							<Button size="lg" surface="dark" className="gap-2 shadow-glow" asChild>
								<Link to={ROUTES.signup}>
									{authCta.primaryCta}
									<ArrowRight className="size-4" aria-hidden />
								</Link>
							</Button>
							<Button size="lg" variant="secondary" surface="dark" asChild>
								<Link to={ROUTES.login}>{authCta.secondaryCta}</Link>
							</Button>
						</div>
					</div>
				</motion.div>
			</div>
		</section>
	)
}
