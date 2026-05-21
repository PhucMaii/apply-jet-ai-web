import { AnimatePresence, motion } from "framer-motion"
import { useCallback, useEffect, useMemo, useState } from "react"
import {
	type DemoPanelPhase,
	DemoExtensionPanel,
} from "@/components/landing/demo-extension-panel"
import { ExtensionChromeMock } from "@/components/landing/extension-chrome-mock"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import { Play, RotateCcw } from "lucide-react"

type DemoPhase = "page" | DemoPanelPhase

const phaseOrder: DemoPhase[] = [
	"page",
	"panel",
	"extract",
	"score",
	"resume",
	"cover",
	"longAnswers",
]

const phaseLabels: Record<DemoPhase, string> = {
	page: "Job page",
	panel: "Panel",
	extract: "Extract JD",
	score: "ATS match",
	resume: "Tailored resume",
	cover: "Cover letter",
	longAnswers: "Long answers",
}

const phaseCaptions: Record<DemoPhase, string> = {
	page:
		"You land on a posting. Nothing flashy—until you are ready to beat the filter.",
	panel:
		"The panel opens on the job: same header and rail as your real extension.",
	extract:
		"Loading state while we pull JD language—the same signals ATS parsers weigh.",
	score:
		"Match ring and skill comparison: see the gap between your baseline resume and this posting.",
	resume:
		"Primary output: a tailored resume version woven to this role for stronger screening alignment.",
	cover:
		"A cover letter grounded in this JD—not a one-size intro you swap the company name on.",
	longAnswers:
		"Behavioral and long-form prompts answered with structure and proof. Form-field assist is still there—just not the headline.",
}

const jdPreview =
	"We're hiring a Full Stack Developer to build and ship features across our React and Node stack. You'll work with PostgreSQL, Docker, and modern CI. Experience with testing (Jest, Cypress) and collaborative leadership is a plus."

export function ProductDemo() {
	const [phase, setPhase] = useState<DemoPhase>("page")
	const [autoPlay, setAutoPlay] = useState(true)

	const phaseIndex = useMemo(
		() => phaseOrder.indexOf(phase),
		[phase],
	)

	const panelPhase: DemoPanelPhase | null =
		phase === "page" ? null : phase

	useEffect(() => {
		if (!autoPlay) return undefined
		const id = window.setInterval(() => {
			setPhase((p) => {
				const i = phaseOrder.indexOf(p)
				return phaseOrder[(i + 1) % phaseOrder.length]
			})
		}, 2800)
		return () => window.clearInterval(id)
	}, [autoPlay])

	const goPhase = useCallback((p: DemoPhase) => {
		setPhase(p)
	}, [])

	const runDemo = useCallback(() => {
		setAutoPlay(false)
		setPhase("page")
		let step = 0
		const id = window.setInterval(() => {
			step += 1
			if (step >= phaseOrder.length) {
				window.clearInterval(id)
				return
			}
			setPhase(phaseOrder[step])
		}, 850)
	}, [])

	return (
		<section id="demo" className="scroll-mt-24 py-20 sm:py-24">
			<div className="mx-auto max-w-6xl px-4 sm:px-6">
				<div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
					<div className="max-w-2xl">
						<p className="text-sm font-semibold uppercase tracking-wider text-primary">
							Interactive demo
						</p>
						<h2 className="mt-2 font-display text-3xl font-bold tracking-tight sm:text-4xl">
							From posting to tailored packet—watch the ATS-first flow.
						</h2>
						<p className="mt-4 text-muted-foreground">
							Extract the JD, see the match gap, then generate tailored resume,
							cover letter, and long answers. Form help stays in the stack—scrub
							stages or autoplay.
						</p>
					</div>
					<div className="flex flex-wrap gap-2">
						<Button
							type="button"
							variant={autoPlay ? "default" : "secondary"}
							surface="dark"
							size="sm"
							onClick={() => setAutoPlay((v) => !v)}
						>
							{autoPlay ? "Autoplay on" : "Autoplay off"}
						</Button>
						<Button
							type="button"
							variant="secondary"
							surface="dark"
							size="sm"
							className="gap-1.5"
							onClick={runDemo}
						>
							<Play className="size-3.5" aria-hidden />
							Quick run
						</Button>
						<Button
							type="button"
							variant="ghost"
							surface="dark"
							size="sm"
							className="gap-1.5"
							onClick={() => {
								setAutoPlay(false)
								setPhase("page")
							}}
						>
							<RotateCcw className="size-3.5" aria-hidden />
							Reset
						</Button>
					</div>
				</div>

				<div className="mt-10 grid gap-8 lg:grid-cols-[1fr_min(22rem,100%)]">
					<ExtensionChromeMock>
						<div className="relative min-h-[320px] overflow-hidden rounded-xl border border-border/50 bg-gradient-to-b from-muted/25 to-background/50 p-3 sm:min-h-[360px] sm:p-4">
							<div className="flex items-start justify-between gap-3">
								<div>
									<p className="text-xs font-semibold text-primary">
										TuneZilla · Engineering
									</p>
									<h3 className="mt-1 font-display text-lg font-semibold sm:text-xl">
										Full Stack Developer
									</h3>
									<p className="mt-1 text-xs text-muted-foreground">
										TuneZilla Software Ltd · Remote-friendly
									</p>
								</div>
								<span
									className={cn(
										"rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
										phase === "page"
											? "bg-muted text-muted-foreground"
											: "bg-primary/15 text-primary",
									)}
								>
									{phase === "page" ? "Browsing" : "Extension active"}
								</span>
							</div>
							<p className="mt-3 line-clamp-3 text-sm leading-relaxed text-muted-foreground sm:line-clamp-4">
								{jdPreview}
							</p>

							<AnimatePresence>
								{panelPhase ? (
									<motion.div
										key="panel"
										initial={{ x: "105%", opacity: 0 }}
										animate={{ x: 0, opacity: 1 }}
										exit={{ x: "105%", opacity: 0 }}
										transition={{
											type: "spring",
											stiffness: 300,
											damping: 34,
										}}
										className="absolute inset-y-2 right-2 z-10 w-[min(100%,22rem)] sm:inset-y-3 sm:right-3 sm:w-[min(100%,24rem)]"
									>
										<DemoExtensionPanel
											phase={panelPhase}
											className="h-full max-h-none min-h-0 shadow-2xl"
										/>
									</motion.div>
								) : null}
							</AnimatePresence>
						</div>
					</ExtensionChromeMock>

					<div>
						<Tabs
							value={phase}
							onValueChange={(v) => {
								setAutoPlay(false)
								goPhase(v as DemoPhase)
							}}
						>
							<TabsList className="grid h-auto w-full grid-cols-2 gap-1 p-1 lg:grid-cols-1">
								{phaseOrder.map((p) => (
									<TabsTrigger
										key={p}
										value={p}
										className="whitespace-normal px-2 py-2 text-left text-xs sm:text-sm"
									>
										{phaseLabels[p]}
									</TabsTrigger>
								))}
							</TabsList>
							<TabsContent value={phase} className="mt-4">
								<motion.div
									key={phase}
									initial={{ opacity: 0, y: 6 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ duration: 0.35 }}
									className="rounded-xl border border-border/70 bg-card/40 p-4 text-sm text-muted-foreground"
								>
									<p className="font-medium text-foreground">
										Stage {phaseIndex + 1} / {phaseOrder.length}
									</p>
									<p className="mt-2 leading-relaxed">
										{phaseCaptions[phase]}
									</p>
								</motion.div>
							</TabsContent>
						</Tabs>
					</div>
				</div>
			</div>
		</section>
	)
}
