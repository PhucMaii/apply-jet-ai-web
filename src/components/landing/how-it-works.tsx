import { motion, useReducedMotion } from "framer-motion"
import { LANDING_COPY } from "@/lib/landing-copy"
import {
	LANDING_EASE_OUT,
	landingRevealViewport,
} from "@/lib/landing-motion"
import { cn } from "@/lib/utils"

const { howItWorks } = LANDING_COPY

const STEP_NUMBERS = ["01", "02", "03", "04"] as const

export function HowItWorks() {
	const reduceMotion = useReducedMotion()

	return (
		<section
			id="how-it-works"
			className="scroll-mt-24 border-t border-landing-border/70 bg-landing-sand/50 py-16 sm:py-24"
		>
			<div className="mx-auto max-w-6xl px-4 sm:px-6">
				<motion.div
					initial={reduceMotion ? false : { opacity: 0, y: 20 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={landingRevealViewport}
					transition={{ duration: 0.5, ease: LANDING_EASE_OUT }}
					className="max-w-xl"
				>
					<p className="text-sm font-medium tracking-wide text-landing-primary">
						{howItWorks.eyebrow}
					</p>
					<h2 className="mt-3 font-display text-3xl font-medium leading-tight tracking-tight text-landing-ink sm:text-4xl">
						{howItWorks.title}
					</h2>
					<p className="mt-4 text-base leading-relaxed text-landing-muted sm:text-lg">
						{howItWorks.description}
					</p>
				</motion.div>

				<ol className="relative mt-12 space-y-4 sm:mt-16 sm:space-y-5 lg:mt-20 lg:grid lg:grid-cols-2 lg:gap-x-8 lg:gap-y-6 lg:space-y-0">
					{howItWorks.steps.map((step, index) => {
						const isLast = index === howItWorks.steps.length - 1

						return (
							<motion.li
								key={step.title}
								initial={reduceMotion ? false : { opacity: 0, y: 20 }}
								whileInView={{ opacity: 1, y: 0 }}
								viewport={landingRevealViewport}
								transition={{
									duration: 0.5,
									ease: LANDING_EASE_OUT,
									delay: reduceMotion ? 0 : 0.06 * index,
								}}
								className="group relative list-none"
							>
								{/* Mobile / tablet connector */}
								{!isLast ? (
									<span
										aria-hidden
										className="absolute top-[4.25rem] bottom-[-1rem] left-6 w-px bg-landing-border lg:hidden"
									/>
								) : null}

								<article
									className={cn(
										"relative flex gap-4 rounded-xl border border-landing-border bg-landing-paper p-5",
										"shadow-[0_1px_2px_rgba(26,26,46,0.04)]",
										"transition-[transform,box-shadow,border-color] duration-300 ease-out",
										"sm:gap-5 sm:p-6",
										"hover:-translate-y-0.5 hover:border-landing-primary/25",
										"hover:shadow-[0_12px_40px_-16px_rgba(26,26,46,0.14)]",
										"motion-reduce:transition-none motion-reduce:hover:translate-y-0",
									)}
								>
									<div className="relative shrink-0">
										<span
											aria-hidden
											className={cn(
												"flex size-12 items-center justify-center rounded-full",
												"border border-landing-border bg-landing-sand",
												"font-display text-lg font-medium tabular-nums text-landing-primary",
												"transition-colors duration-300",
												"group-hover:border-landing-primary/30 group-hover:bg-landing-primary/8",
											)}
										>
											{STEP_NUMBERS[index]}
										</span>
									</div>

									<div className="min-w-0 flex-1 pt-0.5">
										<h3 className="font-display text-lg font-medium leading-snug text-landing-ink sm:text-xl">
											{step.title}
										</h3>
										<p className="mt-2 text-sm leading-relaxed text-landing-muted sm:text-[0.9375rem] sm:leading-relaxed">
											{step.body}
										</p>
									</div>

									<span
										aria-hidden
										className={cn(
											"pointer-events-none absolute inset-x-5 bottom-0 h-px origin-left scale-x-0",
											"bg-landing-primary/40 transition-transform duration-300 ease-out",
											"group-hover:scale-x-100 sm:inset-x-6",
											"motion-reduce:transition-none motion-reduce:group-hover:scale-x-0",
										)}
									/>
								</article>
							</motion.li>
						)
					})}
				</ol>
			</div>
		</section>
	)
}
