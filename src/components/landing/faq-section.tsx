import { useId, useState } from "react"
import { Plus } from "lucide-react"
import { LandingSectionHeading } from "@/components/landing/landing-section-heading"
import { useLandingCopy } from "@/context/landing-copy-context"
import { cn } from "@/lib/utils"

function FaqItem({
	question,
	answer,
	isOpen,
	onToggle,
}: {
	question: string
	answer: string
	isOpen: boolean
	onToggle: () => void
}) {
	const baseId = useId()
	const buttonId = `${baseId}-button`
	const panelId = `${baseId}-panel`

	return (
		<li className="border-b border-hairline">
			<h3>
				<button
					id={buttonId}
					type="button"
					aria-expanded={isOpen}
					aria-controls={panelId}
					onClick={onToggle}
					className="flex w-full items-start justify-between gap-6 py-5 text-left font-display text-lg font-medium text-ink transition-colors hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 focus-visible:ring-offset-2"
				>
					{question}
					<Plus
						className={cn(
							"mt-1 size-5 shrink-0 text-ink-subtle transition-transform duration-200 motion-reduce:transition-none",
							isOpen && "rotate-45 text-brand",
						)}
						aria-hidden
					/>
				</button>
			</h3>
			<div
				id={panelId}
				role="region"
				aria-labelledby={buttonId}
				className={cn(
					"grid transition-[grid-template-rows] duration-300 ease-out motion-reduce:transition-none",
					isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
				)}
				inert={!isOpen}
			>
				<div className="overflow-hidden">
					<p className="max-w-2xl pb-6 leading-relaxed text-ink-muted">
						{answer}
					</p>
				</div>
			</div>
		</li>
	)
}

export function FaqSection() {
	const { faq } = useLandingCopy()
	const [openQuestion, setOpenQuestion] = useState<string | null>(
		faq.items[0]?.question ?? null,
	)

	return (
		<section id={faq.sectionId} className="scroll-mt-20 py-20 sm:py-28">
			<div className="mx-auto grid max-w-6xl gap-10 px-4 sm:px-6 lg:grid-cols-[1fr_1.6fr] lg:gap-16 lg:px-8">
				<LandingSectionHeading eyebrow={faq.eyebrow} title={faq.title} />
				<ul className="border-t border-hairline">
					{faq.items.map((item) => (
						<FaqItem
							key={item.question}
							question={item.question}
							answer={item.answer}
							isOpen={openQuestion === item.question}
							onToggle={() =>
								setOpenQuestion((current) =>
									current === item.question ? null : item.question,
								)
							}
						/>
					))}
				</ul>
			</div>
		</section>
	)
}
