import { motion } from "framer-motion"
import { Sparkles } from "lucide-react"
import {
	ExtensionJobDescriptionSnippet,
	ExtensionJobHeaderCard,
	ExtensionNavRail,
	ExtensionPanelHeader,
	ExtensionResumeFitCard,
	ExtensionSkillsCompareCard,
	PANEL_BG,
	extensionPanelClassName,
} from "@/components/landing/extension-panel-parts"
import { cn } from "@/lib/utils"

const easeOutExpo = [0.22, 1, 0.36, 1] as [number, number, number, number]

const container = {
	hidden: { opacity: 0 },
	show: {
		opacity: 1,
		transition: { staggerChildren: 0.06, delayChildren: 0.08 },
	},
}

const item = {
	hidden: { opacity: 0, y: 10 },
	show: {
		opacity: 1,
		y: 0,
		transition: { duration: 0.4, ease: easeOutExpo },
	},
}

export function HeroExtensionPanelMock({ className }: { className?: string }) {
	return (
		<div
			className={extensionPanelClassName(
				cn("max-h-[min(32rem,70vh)] min-h-[20rem]", className),
			)}
			style={{ backgroundColor: PANEL_BG }}
		>
			<div className="flex min-w-0 flex-1 flex-col">
				<ExtensionPanelHeader />
				<motion.div
					className="thin-scrollbar flex-1 space-y-2.5 overflow-y-auto p-2.5 sm:space-y-3 sm:p-3"
					variants={container}
					initial="hidden"
					whileInView="show"
					viewport={{ once: true, margin: "-40px" }}
				>
					<motion.div variants={item}>
						<ExtensionJobHeaderCard
							title="Full Stack Developer"
							company="TuneZilla Software Ltd"
						/>
					</motion.div>

					<motion.div variants={item}>
						<ExtensionResumeFitCard percent={52} animationKey="hero" />
					</motion.div>

					<motion.div variants={item}>
						<ExtensionSkillsCompareCard />
					</motion.div>

					<motion.div
						variants={item}
						className="rounded-xl border border-primary/25 bg-primary/[0.12] p-3"
					>
						<div className="flex gap-2">
							<Sparkles
								className="mt-0.5 size-4 shrink-0 text-primary"
								aria-hidden
							/>
							<p className="text-[11px] leading-relaxed text-white/75">
								Skills from this job aren&apos;t in your baseline resume yet.
								Generate a tailored version so this application reflects the
								role—not a generic file.
							</p>
						</div>
						<button
							type="button"
							className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-2.5 text-xs font-semibold text-primary-foreground shadow-[0_0_24px_-4px_rgba(99,102,241,0.55)] transition-transform hover:scale-[1.01] active:scale-[0.99]"
						>
							<Sparkles className="size-3.5" aria-hidden />
							Generate tailored resume
						</button>
					</motion.div>

					<motion.div variants={item}>
						<ExtensionJobDescriptionSnippet
							title="Full Stack Developer at TuneZilla Software Ltd"
							body={
								"We're looking for a Full Stack Developer to build and ship features across our React and Node stack. You'll work with PostgreSQL, Docker, and modern CI. Experience with testing (Jest, Cypress) and collaborative leadership is a plus…"
							}
						/>
					</motion.div>
				</motion.div>
			</div>
			<ExtensionNavRail />
		</div>
	)
}
