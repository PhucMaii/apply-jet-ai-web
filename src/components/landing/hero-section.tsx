import { motion, useReducedMotion } from "framer-motion"
import { Link } from "react-router-dom"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { CanadaMadeBadge } from "@/components/landing/canada-made-badge"
import { HeroProductMockup } from "@/components/landing/hero-product-mockup"
import { LandingSignupLink } from "@/components/landing/landing-signup-link"
import { StarRating } from "@/components/landing/star-rating"
import { useLandingCopy } from "@/context/landing-copy-context"
import { ROUTES } from "@/lib/constants"
import { FEATURES } from "@/lib/features"
import { LANDING_EASE_OUT } from "@/lib/landing-motion"

const HERO_SECONDARY_CTA = "Browse open jobs" as const

export function HeroSection() {
	const reduceMotion = useReducedMotion()
	const { hero } = useLandingCopy()

	const reveal = (delay: number) => ({
		initial: reduceMotion ? false : { opacity: 0, y: 16 },
		animate: { opacity: 1, y: 0 },
		transition: {
			duration: 0.5,
			ease: LANDING_EASE_OUT,
			delay: reduceMotion ? 0 : delay,
		},
	})

	return (
		<section className="relative overflow-hidden pt-12 pb-20 sm:pt-16 sm:pb-24 lg:pt-20 lg:pb-28">
			<div className="mx-auto grid w-full min-w-0 max-w-6xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-[1fr_1.1fr] lg:gap-14 lg:px-8">
				<div className="min-w-0 max-w-xl lg:max-w-none">
					{FEATURES.pgwp ? (
						<motion.div {...reveal(0)} className="mb-5">
							<CanadaMadeBadge label={hero.canadaMadeLabel} />
						</motion.div>
					) : (
						<motion.p
							{...reveal(0)}
							className="mb-5 text-xs font-semibold uppercase tracking-[0.14em] text-brand"
						>
							{hero.canadaMadeLabel}
						</motion.p>
					)}

					<motion.h1
						{...reveal(0.05)}
						className="font-display text-[2.25rem] font-medium leading-[1.08] tracking-tight text-ink text-balance sm:text-5xl lg:text-[3.4rem]"
					>
						{hero.title}
					</motion.h1>

					<motion.p
						{...reveal(0.1)}
						className="mt-5 max-w-lg text-base leading-relaxed text-ink-muted text-pretty sm:mt-6 sm:text-lg"
					>
						{hero.description}
					</motion.p>

					<motion.div {...reveal(0.15)} className="mt-8 sm:mt-10">
						<div className="flex flex-col gap-3 sm:flex-row sm:items-center">
							<Button size="lg" asChild>
								<LandingSignupLink location="hero" label={hero.primaryCta}>
									{hero.primaryCta}
									<ArrowRight aria-hidden />
								</LandingSignupLink>
							</Button>
							<Button size="lg" variant="ghost" asChild>
								<Link to={ROUTES.jobs}>{HERO_SECONDARY_CTA}</Link>
							</Button>
						</div>
						<p className="mt-3 text-sm text-ink-subtle">
							{hero.noCreditCardNote}
						</p>
						<div className="mt-8 flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-hairline pt-5">
							<StarRating
								rating={hero.socialProof.rating}
								size="md"
								showValue
							/>
							<span className="text-sm text-ink-muted">
								{hero.socialProof.label}
							</span>
						</div>
					</motion.div>
				</div>

				<HeroProductMockup className="min-w-0" />
			</div>
		</section>
	)
}
