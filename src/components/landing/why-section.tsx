import { motion } from "framer-motion"
import { Check, X } from "lucide-react"
import { APP_NAME } from "@/lib/constants"
import { cn } from "@/lib/utils"

const manual = [
	"One generic resume blasted at fifty different parsers",
	"No cover letter—or the same paragraph with a new company name",
	"Long questions left blank or filled with safe, forgettable filler",
	"You never know ATS filtered you out; it feels like silence",
] as const

const withProduct = [
	"Posting-specific resume language without starting from a blank doc",
	"Cover letters grounded in this JD and your matched proof",
	"Long answers drafted with structure, story, and keywords from the post",
	"Gap view before submit—so you are not guessing in the dark",
] as const

export function WhySection() {
	return (
		<section className="py-20 sm:py-24">
			<div className="mx-auto max-w-6xl px-4 sm:px-6">
				<div className="max-w-2xl">
					<p className="text-sm font-semibold uppercase tracking-wider text-primary">
						Why it wins
					</p>
					<h2 className="mt-2 font-display text-3xl font-bold tracking-tight sm:text-4xl">
						The invisible wall is ATS—not your work ethic. Most people never
						know they were filtered.
					</h2>
				</div>

				<div className="mt-12 grid gap-6 lg:grid-cols-2">
					<motion.div
						className="rounded-2xl border border-border/70 bg-muted/20 p-6 sm:p-8"
						initial={{ opacity: 0, x: -12 }}
						whileInView={{ opacity: 1, x: 0 }}
						viewport={{ once: true }}
						transition={{ duration: 0.45 }}
					>
						<p className="text-sm font-semibold text-muted-foreground">
							Generic applications
						</p>
						<h3 className="mt-2 font-display text-xl font-semibold">
							Built to lose in automated screening
						</h3>
						<ul className="mt-6 space-y-3">
							{manual.map((line) => (
								<li
									key={line}
									className="flex gap-3 text-sm text-muted-foreground"
								>
									<span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-md bg-destructive/10 text-destructive">
										<X className="size-3.5" aria-hidden />
									</span>
									{line}
								</li>
							))}
						</ul>
					</motion.div>

					<motion.div
						className={cn(
							"relative overflow-hidden rounded-2xl border border-primary/35 bg-gradient-to-br",
							"from-primary/20 via-card/60 to-accent/10 p-6 shadow-glow sm:p-8",
						)}
						initial={{ opacity: 0, x: 12 }}
						whileInView={{ opacity: 1, x: 0 }}
						viewport={{ once: true }}
						transition={{ duration: 0.45 }}
					>
						<div className="pointer-events-none absolute -right-16 top-0 size-56 rounded-full bg-accent/20 blur-3xl" />
						<p className="text-sm font-semibold text-primary">
							With {APP_NAME}
						</p>
						<h3 className="mt-2 font-display text-xl font-semibold">
							Tailored, defensible, parser-aware
						</h3>
						<ul className="relative mt-6 space-y-3">
							{withProduct.map((line) => (
								<li key={line} className="flex gap-3 text-sm text-foreground/90">
									<span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-md bg-primary/15 text-primary">
										<Check className="size-3.5" aria-hidden />
									</span>
									{line}
								</li>
							))}
						</ul>
					</motion.div>
				</div>
			</div>
		</section>
	)
}
