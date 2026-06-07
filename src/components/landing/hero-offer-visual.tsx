import { motion, useReducedMotion } from "framer-motion"
import { HERO_OFFER_IMAGE_SRC } from "@/lib/constants"
import { LANDING_COPY } from "@/lib/landing-copy"

const { visualAlt } = LANDING_COPY.hero

export function HeroOfferVisual() {
	const reduceMotion = useReducedMotion()

	return (
		<motion.div
			initial={reduceMotion ? false : { opacity: 0, y: 24, scale: 0.97 }}
			animate={{ opacity: 1, y: 0, scale: 1 }}
			transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
			className="relative overflow-hidden rounded-2xl border border-border/60 bg-card/40 shadow-glow backdrop-blur-sm"
		>
			<div
				className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,_color-mix(in_oklab,var(--color-primary)_18%,transparent),transparent_70%)]"
				aria-hidden
			/>
			<motion.img
				src={HERO_OFFER_IMAGE_SRC}
				alt={visualAlt}
				width={960}
				height={720}
				loading="eager"
				decoding="async"
				className="relative block h-auto w-full object-cover"
				animate={
					reduceMotion
						? undefined
						: {
								y: [0, -6, 0],
							}
				}
				transition={
					reduceMotion
						? undefined
						: {
								duration: 5,
								repeat: Infinity,
								ease: "easeInOut",
							}
				}
			/>
		</motion.div>
	)
}
