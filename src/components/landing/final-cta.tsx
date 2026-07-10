import { motion } from "framer-motion"
import { Link } from "react-router-dom"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { LandingSignupLink } from "@/components/landing/landing-signup-link"
import { ROUTES } from "@/lib/constants"
import {
	LANDING_COPY,
	LANDING_PRIMARY_CTA_BUTTON_CLASS,
} from "@/lib/landing-copy"

const { finalCta } = LANDING_COPY

export function FinalCta() {
	return (
		<section className="pb-24 pt-6">
			<div className="mx-auto max-w-6xl px-4 sm:px-6">
				<motion.div
					className="rounded-3xl border border-border/80 bg-muted/25 px-6 py-10 text-center sm:px-10"
					initial={{ opacity: 0, y: 12 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					transition={{ duration: 0.45 }}
				>
					<h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
						{finalCta.title}
					</h2>
					<p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
						{finalCta.description}
					</p>
					<div className="mt-8 flex flex-col items-center gap-3">
						<Button
							size="lg"
							surface="light"
							className={LANDING_PRIMARY_CTA_BUTTON_CLASS}
							asChild
						>
							<LandingSignupLink
								location="final_cta"
								label={finalCta.primaryCta}
							>
								{finalCta.primaryCta}
								<ArrowRight className="size-4" aria-hidden />
							</LandingSignupLink>
						</Button>
						<Link
							to={ROUTES.login}
							className="text-sm text-landing-muted transition-colors hover:text-landing-primary"
						>
							{finalCta.loginLink}
						</Link>
					</div>
				</motion.div>
			</div>
		</section>
	)
}
