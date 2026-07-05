import { motion, useReducedMotion } from "framer-motion"
import { Link } from "react-router-dom"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { HeroResumeMock } from "@/components/landing/hero-resume-mock"
import { ROUTES } from "@/lib/constants"
import { LANDING_COPY } from "@/lib/landing-copy"
import { LANDING_EASE_OUT } from "@/lib/landing-motion"

const { hero } = LANDING_COPY

export function HeroSection() {
	const reduceMotion = useReducedMotion()

	return (
		<section className="relative overflow-hidden pt-10 pb-16 sm:pt-14 sm:pb-24 lg:pt-20 lg:pb-28">
			<div className="mx-auto grid w-full min-w-0 max-w-6xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-[1fr_1.05fr] lg:gap-16 xl:gap-20">
				<div className="min-w-0 max-w-xl lg:max-w-none">
					<motion.h1
						initial={reduceMotion ? false : { opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.55, ease: LANDING_EASE_OUT }}
						className="font-display text-[2rem] font-medium leading-[1.12] tracking-tight text-landing-ink sm:text-5xl lg:text-[3.25rem] lg:leading-[1.08]"
					>
						{hero.title}
					</motion.h1>

					<motion.p
						initial={reduceMotion ? false : { opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{
							duration: 0.55,
							ease: LANDING_EASE_OUT,
							delay: reduceMotion ? 0 : 0.1,
						}}
						className="mt-5 text-base leading-relaxed text-landing-muted sm:mt-6 sm:text-lg sm:leading-relaxed"
					>
						{hero.description}
					</motion.p>

					<motion.div
						initial={reduceMotion ? false : { opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{
							duration: 0.55,
							ease: LANDING_EASE_OUT,
							delay: reduceMotion ? 0 : 0.2,
						}}
						className="mt-8 sm:mt-10"
					>
						<Button
							size="lg"
							surface="light"
							className="gap-2 bg-landing-primary text-white hover:bg-landing-primary-hover hover:scale-[1.02] hover:shadow-none active:scale-[0.98]"
							asChild
						>
							<Link to={ROUTES.signup}>
								{hero.primaryCta}
								<ArrowRight className="size-4" aria-hidden />
							</Link>
						</Button>
					</motion.div>
				</div>

				<div className="relative min-w-0 w-full lg:mx-0">
					<HeroResumeMock />
				</div>
			</div>
		</section>
	)
}
