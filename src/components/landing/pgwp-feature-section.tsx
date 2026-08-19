import { CalendarDays } from "lucide-react"
import { BrandLogo } from "@/components/brand/brand-logo"
import { PgwpMascot } from "@/components/pgwp/pgwp-mascot"
import { useLandingCopy } from "@/context/landing-copy-context"
import { APP_NAME } from "@/lib/constants"
import { PGWP_MASCOT_SRC } from "@/lib/pgwp-mascot"
import { PGWP_THEME } from "@/lib/pgwp-theme"
import { cn } from "@/lib/utils"

export function PgwpFeatureSection() {
	const { pgwpFeature } = useLandingCopy()
	const { preview } = pgwpFeature

	return (
		<section
			id={pgwpFeature.sectionId}
			className="scroll-mt-24 border-t border-landing-border/70 py-20 sm:py-24"
		>
			<div className="mx-auto grid max-w-6xl items-center gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:gap-16">
				<div className="max-w-xl">
					<p className="text-sm font-semibold uppercase tracking-wider text-landing-primary">
						{pgwpFeature.eyebrow}
					</p>
					<h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-landing-ink sm:text-4xl">
						{pgwpFeature.title}
					</h2>
					<p className="mt-4 text-base leading-relaxed text-landing-muted sm:text-lg">
						{pgwpFeature.description}
					</p>
					<p className="mt-5 text-sm leading-relaxed text-landing-muted/80">
						{pgwpFeature.disclaimer}
					</p>
				</div>

				<div className="space-y-5">
					<div className={cn(PGWP_THEME.heroCard, "min-h-[16rem]")}>
						<div className="flex items-center gap-3 sm:gap-5">
							<div className="min-w-0 flex-1">
								<div className="flex items-start gap-3">
									<span className={PGWP_THEME.heroIcon}>
										<CalendarDays className="size-5" />
									</span>
									<div className="min-w-0">
										<p className={PGWP_THEME.heroNumber}>
											{preview.daysValue}
										</p>
										<p className={PGWP_THEME.heroLabel}>
											{preview.daysLabel}
										</p>
										<p className={cn(PGWP_THEME.heroExpiry, "mt-4")}>
											{preview.expiryLabel}
										</p>
										<p className={PGWP_THEME.heroMessage}>
											{preview.message}
										</p>
									</div>
								</div>
							</div>
							<div className={PGWP_THEME.mascotWrap}>
								<PgwpMascot
									mascotKey={preview.mascotPhase}
									size="hero"
									decorative
									className="-mb-2 -mr-2 sm:-mb-4"
								/>
							</div>
						</div>
						<div className={PGWP_THEME.watermark}>
							<BrandLogo size="sm" className="size-6 rounded-md" />
							<span className={PGWP_THEME.watermarkText}>
								{APP_NAME}
							</span>
						</div>
					</div>

					<div>
						<p className="text-sm font-semibold text-landing-ink">
							{pgwpFeature.mascotLegendTitle}
						</p>
						<ul className="mt-3 grid grid-cols-3 gap-3">
							{pgwpFeature.mascotLegend.map((item) => (
								<li
									key={item.key}
									className="flex flex-col items-center rounded-xl border border-landing-border bg-landing-paper px-2 py-3 text-center"
								>
									<img
										src={PGWP_MASCOT_SRC[item.key]}
										alt=""
										className="h-16 w-16 object-contain sm:h-20 sm:w-20"
										decoding="async"
									/>
									<p className="mt-2 text-xs font-semibold text-landing-ink">
										{item.label}
									</p>
									<p className="mt-0.5 text-[11px] text-landing-muted">
										{item.caption}
									</p>
								</li>
							))}
						</ul>
					</div>
				</div>
			</div>
		</section>
	)
}
