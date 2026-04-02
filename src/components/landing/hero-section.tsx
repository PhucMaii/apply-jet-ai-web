import { motion } from "framer-motion"
import { lazy, Suspense } from "react"
import { Link } from "react-router-dom"
import { ArrowRight, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ExtensionChromeMock } from "@/components/landing/extension-chrome-mock"
import { HeroExtensionPanelMock } from "@/components/landing/hero-extension-panel-mock"
import { APP_NAME, LINKS, ROUTES } from "@/lib/constants"

const HeroCanvas = lazy(async () => {
	const mod = await import("@/components/three/hero-canvas")
	return { default: mod.HeroCanvas }
})

const easeOutExpo = [0.22, 1, 0.36, 1] as [number, number, number, number]

const fadeUp = {
	hidden: { opacity: 0, y: 18 },
	show: (i: number) => ({
		opacity: 1,
		y: 0,
		transition: { delay: 0.08 * i, duration: 0.55, ease: easeOutExpo },
	}),
}

export function HeroSection() {
	return (
		<section className="relative overflow-hidden pt-6 pb-20 sm:pb-24">
			<div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_color-mix(in_oklab,var(--color-primary)_22%,transparent),transparent_55%)]" />
			<div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10">
				<div>
					<motion.p
						custom={0}
						variants={fadeUp}
						initial="hidden"
						animate="show"
						className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur-md"
					>
						<span className="size-1.5 rounded-full bg-accent shadow-[0_0_12px_color-mix(in_oklab,var(--color-accent)_60%,transparent)]" />
						Chrome extension · built for the ATS wall
					</motion.p>
					<motion.h1
						custom={1}
						variants={fadeUp}
						initial="hidden"
						animate="show"
						className="font-display text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl lg:text-[3.25rem]"
					>
						Most applications never reach a human.{" "}
						<span className="text-gradient">
							Yours are tailored to get through.
						</span>
					</motion.h1>
					<motion.p
						custom={2}
						variants={fadeUp}
						initial="hidden"
						animate="show"
						className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg"
					>
						Applicant tracking systems filter out most people before a recruiter
						opens the file. {APP_NAME} reads each posting and helps you generate
						ATS-aligned resumes, cover letters, and long-form answers—so you are
						not stopped by a parser nobody warned you about.
					</motion.p>
					<motion.div
						custom={3}
						variants={fadeUp}
						initial="hidden"
						animate="show"
						className="mt-8 flex flex-wrap items-center gap-3"
					>
						<Button size="lg" className="gap-2 shadow-glow" asChild>
							<a href={LINKS.extensionDownload}>
								<Download className="size-4" aria-hidden />
								Download extension
							</a>
						</Button>
						<Button size="lg" variant="secondary" className="gap-2" asChild>
							<Link to={ROUTES.signup}>
								Get started
								<ArrowRight className="size-4" aria-hidden />
							</Link>
						</Button>
					</motion.div>
					<motion.p
						custom={4}
						variants={fadeUp}
						initial="hidden"
						animate="show"
						className="mt-4 text-xs text-muted-foreground"
					>
						Free to start · Pro unlocks unlimited tailoring, scoring depth, and
						long-answer generation.
					</motion.p>
				</div>

				<div className="relative">
					<div className="absolute -inset-6 rounded-[2rem] bg-gradient-to-br from-primary/25 via-transparent to-accent/10 blur-3xl" />
					<div className="relative space-y-5">
						<Suspense
							fallback={
								<div className="flex h-[300px] w-full items-center justify-center rounded-2xl border border-border/60 bg-muted/20 md:h-[420px]">
									<span className="text-sm text-muted-foreground">
										Loading scene…
									</span>
								</div>
							}
						>
							<HeroCanvas />
						</Suspense>
						<ExtensionChromeMock className="max-w-md lg:ml-auto lg:max-w-lg">
							<HeroExtensionPanelMock className="w-full" />
						</ExtensionChromeMock>
					</div>
				</div>
			</div>
		</section>
	)
}
