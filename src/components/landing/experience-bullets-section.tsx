import { motion } from "framer-motion"
import {
	AlertCircle,
	CheckCircle2,
	Hash,
	Sparkles,
	Target,
	TrendingUp,
	XCircle,
} from "lucide-react"
import { APP_NAME } from "@/lib/constants"
import {
	LANDING_COPY,
	type ExperienceBulletTierKey,
} from "@/lib/landing-copy"
import { cn } from "@/lib/utils"

const easeOutExpo = [0.22, 1, 0.36, 1] as [number, number, number, number]

const { experienceBullets } = LANDING_COPY

const principleIcons = [Target, Hash, TrendingUp] as const

const tierStyles: Record<
	ExperienceBulletTierKey,
	{
		border: string
		bg: string
		badge: string
		badgeText: string
		icon: typeof XCircle
		iconWrap: string
		bulletMarker: string
		takeawayIcon: typeof XCircle
	}
> = {
	bad: {
		border: "border-destructive/25",
		bg: "bg-destructive/[0.04]",
		badge: "bg-destructive/10 text-destructive",
		badgeText: "Gets skipped",
		icon: XCircle,
		iconWrap: "bg-destructive/10 text-destructive",
		bulletMarker: "text-destructive/50",
		takeawayIcon: XCircle,
	},
	good: {
		border: "border-amber-500/30",
		bg: "bg-amber-500/[0.04]",
		badge: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
		badgeText: "Readable, not tailored",
		icon: AlertCircle,
		iconWrap: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
		bulletMarker: "text-amber-600/60 dark:text-amber-400/60",
		takeawayIcon: AlertCircle,
	},
	excellent: {
		border: "border-primary/45",
		bg: "bg-gradient-to-b from-primary/[0.08] via-card/50 to-accent/[0.06]",
		badge: "bg-primary text-primary-foreground",
		badgeText: "Built for this job",
		icon: Sparkles,
		iconWrap: "bg-primary/15 text-primary",
		bulletMarker: "text-primary",
		takeawayIcon: CheckCircle2,
	},
}

function TierCard({
	tier,
	index,
}: {
	tier: (typeof experienceBullets.tiers)[number]
	index: number
}) {
	const style = tierStyles[tier.key as ExperienceBulletTierKey]
	const Icon = style.icon
	const TakeawayIcon = style.takeawayIcon
	const isGenerated = "isGenerated" in tier && tier.isGenerated

	return (
		<motion.article
			initial={{ opacity: 0, y: 24 }}
			whileInView={{ opacity: 1, y: 0 }}
			viewport={{ once: true, margin: "-40px" }}
			transition={{
				delay: 0.08 * index,
				duration: 0.5,
				ease: easeOutExpo,
			}}
			className={cn(
				"relative flex h-full flex-col overflow-hidden rounded-2xl border p-5 sm:p-6",
				style.border,
				style.bg,
				isGenerated && "shadow-glow ring-1 ring-primary/20",
			)}
		>
			{isGenerated ? (
				<div className="pointer-events-none absolute -right-8 -top-8 size-32 rounded-full bg-primary/15 blur-3xl" />
			) : null}

			<div className="relative flex items-start justify-between gap-3">
				<div className="flex items-center gap-3">
					<span
						className={cn(
							"flex size-10 shrink-0 items-center justify-center rounded-xl ring-1 ring-inset ring-white/10",
							style.iconWrap,
						)}
					>
						<Icon className="size-5" aria-hidden />
					</span>
					<div>
						<div className="flex flex-wrap items-center gap-2">
							<h3 className="font-display text-lg font-bold">{tier.label}</h3>
							{isGenerated ? (
								<span className="inline-flex items-center gap-1 rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary">
									<Sparkles className="size-3" aria-hidden />
									{APP_NAME}
								</span>
							) : null}
						</div>
						<p className="text-xs text-muted-foreground">{tier.subtitle}</p>
					</div>
				</div>
				<span
					className={cn(
						"shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide",
						style.badge,
					)}
				>
					{style.badgeText}
				</span>
			</div>

			<p className="relative mt-4 text-sm leading-relaxed text-foreground/90">
				{tier.verdict}
			</p>

			<div className="relative mt-5 flex-1">
				<p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
					Experience bullets
				</p>
				<ul className="mt-3 space-y-3">
					{tier.bullets.map((bullet) => (
						<li key={bullet} className="flex gap-2.5 text-sm leading-relaxed">
							<span
								className={cn("mt-2 size-1.5 shrink-0 rounded-full", style.bulletMarker)}
								aria-hidden
							/>
							<span className="text-foreground/85">{bullet}</span>
						</li>
					))}
				</ul>
			</div>

			<div className="relative mt-5 border-t border-border/60 pt-4">
				<p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
					Why
				</p>
				<ul className="mt-2 space-y-2">
					{tier.takeaways.map((takeaway) => (
						<li
							key={takeaway}
							className="flex gap-2 text-xs leading-relaxed text-muted-foreground"
						>
							<TakeawayIcon
								className={cn(
									"mt-0.5 size-3.5 shrink-0",
									tier.key === "excellent"
										? "text-primary"
										: tier.key === "good"
											? "text-amber-600 dark:text-amber-400"
											: "text-destructive",
								)}
								aria-hidden
							/>
							{takeaway}
						</li>
					))}
				</ul>
			</div>
		</motion.article>
	)
}

export function ExperienceBulletsSection({
	variant = "full",
}: {
	variant?: "full" | "condensed"
}) {
	const { jobContext, principles } = experienceBullets
	const isCondensed = variant === "condensed"
	const visibleTiers = isCondensed
		? experienceBullets.tiers.filter(
				(tier) => tier.key === "bad" || tier.key === "excellent",
			)
		: experienceBullets.tiers

	return (
		<section
			id={experienceBullets.sectionId}
			className="scroll-mt-24 border-y border-border/50 bg-muted/10 py-20 sm:py-24"
		>
			<div className="mx-auto max-w-6xl px-4 sm:px-6">
				<div className="mx-auto max-w-3xl text-center">
					<p className="text-sm font-semibold uppercase tracking-wider text-primary">
						{experienceBullets.eyebrow}
					</p>
					<h2 className="mt-2 font-display text-3xl font-bold tracking-tight sm:text-4xl">
						{isCondensed
							? "Generic bullets get skipped. Tailored ones get interviews."
							: experienceBullets.title}
					</h2>
					{!isCondensed ? (
						<p className="mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
							{experienceBullets.description}
						</p>
					) : null}
				</div>

				<motion.div
					initial={{ opacity: 0, y: 16 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					transition={{ duration: 0.45, ease: easeOutExpo }}
					className="mx-auto mt-12 max-w-4xl overflow-hidden rounded-2xl border border-border/70 bg-card/60 p-5 shadow-glow-sm backdrop-blur-sm sm:p-6"
				>
					<p className="text-[10px] font-semibold uppercase tracking-wider text-primary">
						{jobContext.label}
					</p>
					<div className="mt-2 flex flex-wrap items-baseline gap-x-2 gap-y-1">
						<h3 className="font-display text-xl font-bold">{jobContext.role}</h3>
						<span className="text-sm text-muted-foreground">
							· {jobContext.company}
						</span>
					</div>
					<p className="mt-3 text-sm leading-relaxed text-muted-foreground">
						{jobContext.snippet}
					</p>
					<div className="mt-4 flex flex-wrap gap-2">
						{jobContext.keywords.map((keyword) => (
							<span
								key={keyword}
								className="rounded-full border border-primary/25 bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary"
							>
								{keyword}
							</span>
						))}
					</div>
				</motion.div>

				{!isCondensed ? (
					<div className="mt-8 grid gap-3 sm:grid-cols-3">
						{principles.map((principle, index) => {
							const PrincipleIcon = principleIcons[index]
							return (
								<motion.div
									key={principle.title}
									initial={{ opacity: 0, y: 10 }}
									whileInView={{ opacity: 1, y: 0 }}
									viewport={{ once: true }}
									transition={{ delay: 0.05 * index, duration: 0.4 }}
									className="flex gap-3 rounded-xl border border-border/60 bg-background/50 px-4 py-3"
								>
									<span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
										<PrincipleIcon className="size-4" aria-hidden />
									</span>
									<div>
										<p className="text-sm font-semibold">{principle.title}</p>
										<p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
											{principle.body}
										</p>
									</div>
								</motion.div>
							)
						})}
					</div>
				) : null}

				<p className="mt-10 text-center text-sm font-medium text-muted-foreground">
					{isCondensed
						? "Same experience. Two ways to present it ↓"
						: "Same person. Same job. Three ways to write it ↓"}
				</p>

				<div
					className={cn(
						"mt-6 grid gap-5",
						isCondensed ? "lg:grid-cols-2" : "lg:grid-cols-3",
					)}
				>
					{visibleTiers.map((tier, index) => (
						<TierCard key={tier.key} tier={tier} index={index} />
					))}
				</div>

				<motion.div
					initial={{ opacity: 0, y: 12 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					transition={{ duration: 0.45 }}
					className="mx-auto mt-10 max-w-3xl rounded-2xl border border-primary/30 bg-primary/[0.06] px-5 py-4 text-center sm:px-8 sm:py-5"
				>
					<p className="text-sm leading-relaxed text-foreground/90 sm:text-base">
						{experienceBullets.footerNote}
					</p>
				</motion.div>
			</div>
		</section>
	)
}
