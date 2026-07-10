import { motion } from "framer-motion"
import { Quote } from "lucide-react"
import { StarRating } from "@/components/landing/star-rating"
import { LANDING_COPY } from "@/lib/landing-copy"
import { cn } from "@/lib/utils"

const { testimonials } = LANDING_COPY

function getInitials(name: string) {
	return name
		.split(" ")
		.map((part) => part.charAt(0))
		.join("")
		.slice(0, 2)
		.toUpperCase()
}

export function TestimonialsSection() {
	return (
		<section className="py-20 sm:py-24">
			<div className="mx-auto max-w-6xl px-4 sm:px-6">
				<div className="max-w-2xl">
					<p className="text-sm font-semibold uppercase tracking-wider text-landing-primary">
						{testimonials.eyebrow}
					</p>
					<h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-landing-ink sm:text-4xl">
						{testimonials.title}
					</h2>
					<div className="mt-4 flex flex-wrap items-center gap-3">
						<StarRating
							rating={testimonials.summaryRating}
							size="md"
							showValue
						/>
						<span className="text-sm text-landing-muted">
							{testimonials.summaryLabel}
						</span>
					</div>
				</div>

				<div className="mt-12 grid gap-5 md:grid-cols-3">
					{testimonials.items.map((item, index) => (
						<motion.blockquote
							key={item.name}
							className="flex h-full flex-col rounded-2xl border border-landing-border bg-landing-paper p-6 shadow-[0_8px_30px_-12px_rgba(26,26,46,0.12)]"
							initial={{ opacity: 0, y: 14 }}
							whileInView={{ opacity: 1, y: 0 }}
							viewport={{ once: true }}
							transition={{ delay: 0.06 * index, duration: 0.45 }}
						>
							<div className="flex items-start justify-between gap-3">
								<Quote
									className="size-5 shrink-0 text-landing-primary/70"
									aria-hidden
								/>
								<StarRating rating={item.rating} size="sm" />
							</div>
							<p className="mt-4 flex-1 text-sm leading-relaxed text-landing-ink">
								&ldquo;{item.quote}&rdquo;
							</p>
							<footer className="mt-5 border-t border-landing-border pt-4">
								<cite className="flex items-center gap-3 not-italic">
									<span
										className={cn(
											"flex size-10 shrink-0 items-center justify-center",
											"rounded-full bg-landing-primary/10",
											"font-display text-sm font-semibold text-landing-primary",
										)}
										aria-hidden
									>
										{getInitials(item.name)}
									</span>
									<span>
										<p className="text-sm font-semibold text-landing-ink">
											{item.name}
										</p>
										<p className="text-xs text-landing-muted">
											{item.role}
										</p>
									</span>
								</cite>
							</footer>
						</motion.blockquote>
					))}
				</div>
			</div>
		</section>
	)
}
