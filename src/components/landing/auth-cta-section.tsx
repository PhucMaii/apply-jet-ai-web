import { motion } from "framer-motion"
import { Link } from "react-router-dom"
import { ArrowRight, Monitor } from "lucide-react"
import { Button } from "@/components/ui/button"
import { LandingSignupLink } from "@/components/landing/landing-signup-link"
import { ROUTES } from "@/lib/constants"
import {
	LANDING_COPY,
	LANDING_PRIMARY_CTA_BUTTON_CLASS,
} from "@/lib/landing-copy"

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
						<div className="flex flex-col items-start gap-3">
							<Button
								size="lg"
								surface="light"
								className={LANDING_PRIMARY_CTA_BUTTON_CLASS}
								asChild
							>
								<LandingSignupLink
									location="auth_cta"
									label={authCta.primaryCta}
								>
									{authCta.primaryCta}
									<ArrowRight className="size-4" aria-hidden />
								</LandingSignupLink>
							</Button>
							<Link
								to={ROUTES.login}
								className="text-sm text-landing-muted transition-colors hover:text-landing-primary"
							>
								{authCta.loginLink}
							</Link>
						</div>
					</div>
				</motion.div>
			</div>
		</section>
	)
}
