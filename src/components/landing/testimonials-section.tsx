import { motion, useReducedMotion } from "framer-motion"
import { LandingSectionHeading } from "@/components/landing/landing-section-heading"
import { useLandingCopy } from "@/context/landing-copy-context"
import { LANDING_EASE_OUT, landingRevealViewport } from "@/lib/landing-motion"
import { cn } from "@/lib/utils"

interface MockTestimonial {
	id: string
	quote: string
	name: string
	role: string
	outcome: string
}

const MOCK_TESTIMONIALS: readonly MockTestimonial[] = [
	{
		id: "priya",
		quote:
			"I stopped sending the same resume everywhere. Seeing the missing keywords for each posting made the edits obvious, and my callback rate went from almost nothing to three interviews in two weeks.",
		name: "Priya Raman",
		role: "Data Analyst",
		outcome: "Hired at a fintech in Toronto",
	},
	{
		id: "marcus",
		quote:
			"The board view replaced my spreadsheet. I drag a card when I hear back and everything for that job is right there.",
		name: "Marcus Webb",
		role: "Product Designer",
		outcome: "42 applications tracked",
	},
	{
		id: "elena",
		quote:
			"The rewrites kept my real experience but said it the way the job post did. I edited maybe one line per bullet.",
		name: "Elena Sokolova",
		role: "Backend Engineer",
		outcome: "Match score 54 → 89",
	},
]

function getInitials(name: string) {
	return name
		.split(" ")
		.map((part) => part.charAt(0))
		.join("")
		.slice(0, 2)
		.toUpperCase()
}

function TestimonialAuthor({ item }: { item: MockTestimonial }) {
	return (
		<footer className="mt-6 flex items-center gap-3">
			<span
				className="flex size-10 shrink-0 items-center justify-center rounded-full bg-brand-soft font-display text-sm font-semibold text-brand-ink"
				aria-hidden
			>
				{getInitials(item.name)}
			</span>
			<div className="min-w-0">
				<cite className="block text-sm font-semibold not-italic text-ink">
					{item.name}
				</cite>
				<p className="text-xs text-ink-muted">
					{item.role} · {item.outcome}
				</p>
			</div>
		</footer>
	)
}

export function TestimonialsSection() {
	const reduceMotion = useReducedMotion()
	const { testimonials } = useLandingCopy()
	const [featured, ...rest] = MOCK_TESTIMONIALS

	return (
		<section className="py-20 sm:py-28">
			<div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
				<LandingSectionHeading
					eyebrow={testimonials.eyebrow}
					title={testimonials.title}
				/>

				<div className="mt-12 grid gap-5 lg:grid-cols-[1.4fr_1fr]">
					{featured ? (
						<motion.blockquote
							initial={reduceMotion ? false : { opacity: 0, y: 16 }}
							whileInView={{ opacity: 1, y: 0 }}
							viewport={landingRevealViewport}
							transition={{ duration: 0.5, ease: LANDING_EASE_OUT }}
							className="flex flex-col justify-between rounded-xl bg-ink p-8 text-white sm:p-10"
						>
							<p className="font-display text-xl leading-relaxed text-pretty sm:text-2xl">
								&ldquo;{featured.quote}&rdquo;
							</p>
							<footer className="mt-8 flex items-center gap-3">
								<span
									className="flex size-10 shrink-0 items-center justify-center rounded-full bg-white/10 font-display text-sm font-semibold"
									aria-hidden
								>
									{getInitials(featured.name)}
								</span>
								<div>
									<cite className="block text-sm font-semibold not-italic">
										{featured.name}
									</cite>
									<p className="text-xs text-white/65">
										{featured.role} · {featured.outcome}
									</p>
								</div>
							</footer>
						</motion.blockquote>
					) : null}

					<div className="grid gap-5">
						{rest.map((item, index) => (
							<motion.blockquote
								key={item.id}
								initial={reduceMotion ? false : { opacity: 0, y: 16 }}
								whileInView={{ opacity: 1, y: 0 }}
								viewport={landingRevealViewport}
								transition={{
									duration: 0.5,
									ease: LANDING_EASE_OUT,
									delay: reduceMotion ? 0 : 0.08 * (index + 1),
								}}
								className={cn(
									"flex flex-col justify-between rounded-xl border border-hairline bg-surface p-6 shadow-card",
								)}
							>
								<p className="leading-relaxed text-ink">&ldquo;{item.quote}&rdquo;</p>
								<TestimonialAuthor item={item} />
							</motion.blockquote>
						))}
					</div>
				</div>
			</div>
		</section>
	)
}
