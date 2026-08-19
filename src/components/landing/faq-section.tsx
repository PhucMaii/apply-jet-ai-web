import { useLandingCopy } from "@/context/landing-copy-context"

export function FaqSection() {
	const { faq } = useLandingCopy()

	return (
		<section
			id={faq.sectionId}
			className="scroll-mt-24 border-t border-landing-border/70 py-20 sm:py-24"
		>
			<div className="mx-auto max-w-3xl px-4 sm:px-6">
				<p className="text-sm font-semibold uppercase tracking-wider text-landing-primary">
					{faq.eyebrow}
				</p>
				<h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-landing-ink sm:text-4xl">
					{faq.title}
				</h2>

				<div className="mt-10 space-y-3">
					{faq.items.map((item) => (
						<details
							key={item.question}
							className="group rounded-2xl border border-landing-border bg-landing-paper px-5 py-1"
						>
							<summary className="cursor-pointer list-none py-4 font-display text-base font-semibold text-landing-ink marker:content-none [&::-webkit-details-marker]:hidden">
								<span className="flex items-start justify-between gap-4">
									{item.question}
									<span
										className="mt-0.5 text-lg font-normal text-landing-muted transition-transform group-open:rotate-45"
										aria-hidden
									>
										+
									</span>
								</span>
							</summary>
							<p className="pb-4 text-sm leading-relaxed text-landing-muted">
								{item.answer}
							</p>
						</details>
					))}
				</div>
			</div>
		</section>
	)
}
