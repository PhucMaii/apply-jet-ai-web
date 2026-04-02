import { AnimatePresence, motion } from "framer-motion"
import {
	AlignLeft,
	CheckCircle2,
	FileText,
	Loader2,
	Mail,
	Sparkles,
} from "lucide-react"
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

export type DemoPanelPhase =
	| "panel"
	| "extract"
	| "score"
	| "resume"
	| "cover"
	| "longAnswers"

const jdBody =
	"We're looking for a Full Stack Developer to build and ship features across our React and Node stack. You'll work with PostgreSQL, Docker, and modern CI. Experience with testing (Jest, Cypress) and collaborative leadership is a plus."

interface DemoExtensionPanelProps {
	phase: DemoPanelPhase
	className?: string
}

export function DemoExtensionPanel({ phase, className }: DemoExtensionPanelProps) {
	const showScore = phase !== "panel" && phase !== "extract"
	const ringKey = showScore ? "scored" : "idle"
	const showResume = phase === "resume" || phase === "cover" || phase === "longAnswers"
	const showCover = phase === "cover" || phase === "longAnswers"

	return (
		<div
			className={extensionPanelClassName(className)}
			style={{ backgroundColor: PANEL_BG }}
		>
			<div className="flex min-w-0 flex-1 flex-col">
				<ExtensionPanelHeader />
				<div className="thin-scrollbar flex-1 space-y-2 overflow-y-auto p-2 sm:space-y-2.5 sm:p-2.5">
					<ExtensionJobHeaderCard
						title="Full Stack Developer"
						company="TuneZilla Software Ltd"
					/>

					<AnimatePresence mode="popLayout">
						{phase === "panel" ? (
							<motion.p
								key="hint"
								initial={{ opacity: 0, y: 6 }}
								animate={{ opacity: 1, y: 0 }}
								exit={{ opacity: 0, y: -4 }}
								className="rounded-lg border border-dashed border-white/[0.1] bg-white/[0.02] px-3 py-4 text-center text-[11px] text-white/45"
							>
								Ready. We&apos;ll read this posting for ATS-relevant language…
							</motion.p>
						) : null}

						{phase === "extract" ? (
							<motion.div
								key="extract"
								initial={{ opacity: 0, y: 8 }}
								animate={{ opacity: 1, y: 0 }}
								exit={{ opacity: 0, y: -6 }}
								className="rounded-xl border border-primary/20 bg-primary/[0.08] p-4"
							>
								<div className="flex flex-col items-center gap-3 text-center">
									<div className="relative">
										<Loader2
											className="size-9 animate-spin text-primary"
											aria-hidden
										/>
										<span className="absolute inset-0 animate-ping rounded-full bg-primary/20 opacity-40" />
									</div>
									<div>
										<p className="text-xs font-semibold text-white">
											Extracting job description
										</p>
										<p className="mt-1 text-[11px] text-white/50">
											Pulling requirements and keywords parsers actually score…
										</p>
									</div>
									<div className="flex w-full gap-1.5">
										{[0, 1, 2].map((i) => (
											<div
												key={i}
												className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/[0.08]"
											>
												<motion.div
													className="h-full w-full origin-left bg-primary/70"
													initial={{ scaleX: 0 }}
													animate={{ scaleX: 1 }}
													transition={{
														delay: i * 0.15,
														duration: 0.7,
														ease: easeOutExpo,
													}}
												/>
											</div>
										))}
									</div>
								</div>
							</motion.div>
						) : null}
					</AnimatePresence>

					{showScore ? (
						<motion.div
							key="score-stack"
							initial={{ opacity: 0, y: 10 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.4, ease: easeOutExpo }}
							className="space-y-2 sm:space-y-2.5"
						>
							<ExtensionResumeFitCard percent={54.5} animationKey={ringKey} />
							<ExtensionSkillsCompareCard />
							<ExtensionJobDescriptionSnippet
								title="Full Stack Developer at TuneZilla Software Ltd"
								body={jdBody}
							/>
						</motion.div>
					) : null}

					<AnimatePresence>
						{showResume ? (
							<motion.div
								key="resume-gen"
								initial={{ opacity: 0, y: 8 }}
								animate={{ opacity: 1, y: 0 }}
								exit={{ opacity: 0 }}
								className={cn(
									"rounded-xl border border-primary/30 bg-primary/[0.14] p-3",
									phase === "resume" && "ring-1 ring-primary/35",
								)}
							>
								<div className="flex gap-2">
									<FileText
										className="mt-0.5 size-4 shrink-0 text-primary"
										aria-hidden
									/>
									<p className="text-[11px] leading-relaxed text-white/75">
										Generate a posting-specific resume: JD keywords, scope, and
										proof woven in—stronger ATS alignment without starting from a
										blank page.
									</p>
								</div>
								<button
									type="button"
									className={cn(
										"mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-2.5 text-xs font-semibold text-primary-foreground shadow-[0_0_24px_-4px_rgba(99,102,241,0.55)]",
										phase === "resume" && "animate-pulse",
									)}
								>
									<Sparkles className="size-3.5" aria-hidden />
									Generate tailored resume
								</button>
							</motion.div>
						) : null}
					</AnimatePresence>

					<AnimatePresence>
						{showCover ? (
							<motion.div
								key="cover"
								initial={{ opacity: 0, y: 8 }}
								animate={{ opacity: 1, y: 0 }}
								exit={{ opacity: 0 }}
								className={cn(
									"rounded-xl border border-sky-500/25 bg-sky-500/[0.08] p-3",
									phase === "cover" && "ring-1 ring-sky-500/30",
								)}
							>
								<div className="flex gap-2">
									<Mail
										className="mt-0.5 size-4 shrink-0 text-sky-400"
										aria-hidden
									/>
									<div>
										<p className="text-[10px] font-semibold uppercase tracking-wide text-sky-300/90">
											Cover letter
										</p>
										<p className="mt-1 text-[11px] leading-relaxed text-white/70">
											A letter that cites this role—not a recycled template—so you
											sound serious past the first screen.
										</p>
									</div>
								</div>
								<button
									type="button"
									className={cn(
										"mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-sky-400/40 bg-sky-500/20 py-2.5 text-xs font-semibold text-sky-100 transition-colors hover:bg-sky-500/30",
										phase === "cover" && "animate-pulse",
									)}
								>
									<Sparkles className="size-3.5" aria-hidden />
									Generate cover letter
								</button>
								<p className="mt-2 text-[10px] text-white/40">
									Preview: &quot;I&apos;m excited about TuneZilla&apos;s
									full-stack scope…&quot;
								</p>
							</motion.div>
						) : null}
					</AnimatePresence>

					<AnimatePresence>
						{phase === "longAnswers" ? (
							<motion.div
								key="long-answers"
								initial={{ opacity: 0, y: 8 }}
								animate={{ opacity: 1, y: 0 }}
								className="rounded-xl border border-emerald-500/25 bg-emerald-500/[0.06] p-3 ring-1 ring-emerald-500/20"
							>
								<div className="flex items-center gap-2">
									<AlignLeft
										className="size-4 shrink-0 text-emerald-400"
										aria-hidden
									/>
									<p className="text-[10px] font-semibold uppercase tracking-wide text-emerald-300/90">
										Long answers
									</p>
								</div>
								<p className="mt-2 text-[11px] leading-relaxed text-white/70">
									Behavioral screens, &quot;why this company,&quot; and
									multi-paragraph prompts—drafted with your wins and this
									posting&apos;s language so you are not staring at a blank box.
								</p>
								<ul className="mt-2 space-y-1.5 text-[11px] text-white/65">
									<li className="flex gap-2">
										<CheckCircle2
											className="mt-0.5 size-3.5 shrink-0 text-primary"
											aria-hidden
										/>
										STAR-style structure with JD-aligned keywords
									</li>
									<li className="flex gap-2">
										<CheckCircle2
											className="mt-0.5 size-3.5 shrink-0 text-primary"
											aria-hidden
										/>
										Proof points pulled from your resume + match view
									</li>
								</ul>
								<p className="mt-3 border-t border-white/[0.08] pt-2 text-[10px] text-white/40">
									Short form fields: we still map basics so you are not
									retyping the same contact line on every site.
								</p>
							</motion.div>
						) : null}
					</AnimatePresence>
				</div>
			</div>
			<ExtensionNavRail />
		</div>
	)
}
