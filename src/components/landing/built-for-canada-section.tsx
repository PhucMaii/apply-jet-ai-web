import { MapleLeafIcon } from "@/components/brand/maple-leaf-icon"
import { CANADA_RED } from "@/lib/canada-brand"
import { motion } from "framer-motion"
import { FileCheck, Scale, Timer } from "lucide-react"
import { useLandingCopy } from "@/context/landing-copy-context"
import { LANDING_EASE_OUT } from "@/lib/landing-motion"

const ITEM_ICONS = [MapleLeafIcon, FileCheck, Timer, Scale] as const

export function BuiltForCanadaSection() {
	const { builtForCanada } = useLandingCopy()

	return (
		<section
			id={builtForCanada.sectionId}
			className="scroll-mt-24 py-20 sm:py-24"
		>
			<div className="mx-auto max-w-6xl px-4 sm:px-6">
				<div className="max-w-2xl">
					<p
						className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wider"
						style={{ color: CANADA_RED }}
					>
						<MapleLeafIcon className="size-5" />
						{builtForCanada.eyebrow}
					</p>
					<h2 className="mt-2 font-display text-3xl font-bold tracking-tight sm:text-4xl">
						{builtForCanada.title}
					</h2>
					<p className="mt-4 text-muted-foreground">
						{builtForCanada.description}
					</p>
				</div>

				<div className="mt-12 grid gap-4 sm:grid-cols-2">
					{builtForCanada.items.map((item, index) => {
						const Icon = ITEM_ICONS[index] ?? FileCheck
						return (
							<motion.article
								key={item.title}
								className="rounded-2xl border border-border/70 bg-card/45 p-6"
								initial={{ opacity: 0, y: 14 }}
								whileInView={{ opacity: 1, y: 0 }}
								viewport={{ once: true }}
								transition={{
									delay: 0.05 * index,
									duration: 0.45,
									ease: LANDING_EASE_OUT,
								}}
							>
								<div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/25">
									<Icon className="size-5" aria-hidden />
								</div>
								<h3 className="mt-4 font-display text-lg font-semibold">
									{item.title}
								</h3>
								<p className="mt-2 text-sm leading-relaxed text-muted-foreground">
									{item.body}
								</p>
							</motion.article>
						)
					})}
				</div>
			</div>
		</section>
	)
}
